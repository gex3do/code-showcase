package retry

import (
	"bytes"
	"errors"
	"io"
	"net"
	"net/http"
	"time"

	"github.com/gojektech/heimdall"
)

type RetryDoer struct {
	doer heimdall.Doer

	retryError      func(error) bool
	retryStatusCode func(int) bool
	retry           func(*http.Request, *http.Response) bool

	retrier    heimdall.Retriable
	retryCount int
}

type Option func(doer *RetryDoer)

func RetryStatusCodes(f func(int) bool) Option {
	return func(doer *RetryDoer) {
		doer.retryStatusCode = f
	}
}

func RetryErrors(f func(error) bool) Option {
	return func(doer *RetryDoer) {
		doer.retryError = f
	}
}

func Retry(f func(request *http.Request, response *http.Response) bool) Option {
	return func(doer *RetryDoer) {
		doer.retry = f
	}
}

func RetryCount(c int) Option {
	return func(doer *RetryDoer) {
		doer.retryCount = c
	}
}

func Retrier(r heimdall.Retriable) Option {
	return func(doer *RetryDoer) {
		doer.retrier = r
	}
}

func New(doer heimdall.Doer, opts ...Option) *RetryDoer {
	d := &RetryDoer{
		doer:            doer,
		retryCount:      10,
		retrier:         heimdall.NewRetrier(heimdall.NewConstantBackoff(5*time.Second, 100*time.Millisecond)),
		retryStatusCode: func(statusCode int) bool { return statusCode >= http.StatusInternalServerError },
		retryError: func(err error) bool {
			terr, ok := errors.Unwrap(err).(net.Error)
			if !ok {
				return false
			}
			return terr.Temporary() || terr.Timeout()
		},
		retry: func(_ *http.Request, _ *http.Response) bool {
			return false
		},
	}
	for _, o := range opts {
		o(d)
	}
	return d
}

// Do performs the request and retries on error or configured statuscodes;
//
// At the moment we copy the request body and rewind it on retries to make sure that
// all requests are performed with the same body. See https://brandur.org/fragments/go-http2 for example.
// To achieve that we read the body and copy it once; that makes this doer unsuitable for large request bodies,
// In the future one may use a type switch to see if the request body is already a io.Seeker, in which case
// It is unnecessary to copy the body in to a bytes.Reader.
func (rd RetryDoer) Do(request *http.Request) (response *http.Response, err error) {
	var bodyReader *bytes.Reader

	if request.Body != nil {
		reqData, readErr := io.ReadAll(request.Body)
		if readErr != nil {
			return nil, readErr
		}
		bodyReader = bytes.NewReader(reqData)
	}

	for i := 0; i <= rd.retryCount; i++ {
		r := request.Clone(request.Context())

		if bodyReader != nil {
			_, _ = bodyReader.Seek(0, 0)
			r.Body = io.NopCloser(bodyReader)
		}

		response, err = rd.doer.Do(r)

		if err != nil {
			if rd.retryError(err) {
				backoffTime := rd.retrier.NextInterval(i)
				time.Sleep(backoffTime)
				continue
			}
			return response, err
		}
		if rd.retryStatusCode(response.StatusCode) || rd.retry(request, response) {
			drain(response.Body)
			backoffTime := rd.retrier.NextInterval(i)
			time.Sleep(backoffTime)
			continue
		}
		break
	}
	return response, err
}

func drain(body io.ReadCloser) {
	defer func() { _ = body.Close() }()
	_, _ = io.Copy(io.Discard, body)
}
