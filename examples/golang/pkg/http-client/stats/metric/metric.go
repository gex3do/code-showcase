package metric

import (
	"net/http"
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"

	"github.com/gojektech/heimdall"
)

type Option func(*MetricsDoer)

func RecordHost() Option {
	return func(doer *MetricsDoer) {
		doer.recordHost = true
	}
}

func RecordPath() Option {
	return func(doer *MetricsDoer) {
		doer.recordPath = true
	}
}

func RecordScheme() Option {
	return func(doer *MetricsDoer) {
		doer.recordScheme = true
	}
}

func ClientName(name string) Option {
	return func(doer *MetricsDoer) {
		doer.name = &name
	}
}

func DurationMeasure(m *stats.Int64Measure) Option {
	return func(doer *MetricsDoer) {
		if m != nil {
			doer.mDuration = m
		}
	}
}

func ErrorMeasure(m *stats.Int64Measure) Option {
	return func(doer *MetricsDoer) {
		if m != nil {
			doer.mError = m
		}
	}
}

func ResponseMeasure(m *stats.Int64Measure) Option {
	return func(doer *MetricsDoer) {
		if m != nil {
			doer.mResponse = m
		}
	}
}

func New(d heimdall.Doer, opts ...Option) *MetricsDoer {
	md := &MetricsDoer{
		Doer:         d,
		recordHost:   false,
		recordPath:   false,
		recordScheme: false,
		mDuration:    mHTTPDur,
		mResponse:    mHTTPResp,
		mError:       mHTTPErr,
	}
	for _, o := range opts {
		o(md)
	}
	return md
}

type MetricsDoer struct {
	heimdall.Doer

	name         *string
	recordHost   bool
	recordPath   bool
	recordScheme bool

	mDuration *stats.Int64Measure
	mResponse *stats.Int64Measure
	mError    *stats.Int64Measure
}

func (md *MetricsDoer) Do(req *http.Request) (res *http.Response, err error) {
	ctx := req.Context()

	if md.name != nil {
		ctx, _ = tag.New(ctx, tag.Insert(ClientTagKey, *md.name))
	}
	if md.recordHost {
		ctx, _ = tag.New(ctx, tag.Insert(HostKey, req.Host))
	}
	if md.recordPath {
		ctx, _ = tag.New(ctx, tag.Insert(PathKey, req.URL.Path))
	}
	if md.recordScheme {
		ctx, _ = tag.New(ctx, tag.Insert(SchemeKey, req.URL.Scheme))
	}

	start := time.Now()
	defer func() {
		stats.Record(ctx, md.mDuration.M(time.Since(start).Nanoseconds()/1e6))
		if err != nil {
			stats.Record(ctx, md.mError.M(1))
			return
		}
		ctx, _ = tag.New(ctx, tag.Insert(StatusCodeTagKey, normalizeStatusCode(res.StatusCode)))
		stats.Record(ctx, md.mResponse.M(1))
	}()
	return md.Doer.Do(req)
}

func normalizeStatusCode(statusCode int) string {
	switch {
	case statusCode < 200:
		return "1xx"
	case statusCode < 300:
		return "2xx"
	case statusCode < 400:
		return "3xx"
	case statusCode < 500:
		return "4xx"
	case statusCode < 600:
		return "5xx"
	default:
		return "unknown"
	}
}
