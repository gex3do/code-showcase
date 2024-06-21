package client

// Makes use of heimdall.Client and http.Client to create a http client
// with metrics, traces and retries configured.
//
// Create with:
//
//		// import httpClient "notexistingdomain.com/back/go-commons/pkg/http/client"
//		client, err := httpClient.New()
//
// Create from configuration:
//
//		// import httpClient "notexistingdomain.com/back/go-commons/pkg/http/client"
//		client, err := httpClient.New(httpClient.FromConfig(config))

import (
	goerrors "errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"time"

	"github.com/gojektech/heimdall"
	"github.com/pkg/errors"

	"notexistingdomain.com/back/go-commons/pkg/http/client/retry"
	"notexistingdomain.com/back/go-commons/pkg/http/client/stats/metric"
	"notexistingdomain.com/back/go-commons/pkg/http/client/stats/trace"
)

type Option func(*builder) error

type ClientOption func(*clientBuilder) error

type clientBuilder struct {
	basicAuth     BasicAuthConfig
	checkRedirect func(req *http.Request, via []*http.Request) error
	proxyURL      *url.URL
	timeout       time.Duration
	transport     *http.Transport
}

type builder struct {
	client        *clientBuilder
	retryOptions  []retry.Option
	traceEnabled  bool
	traceOptions  []trace.Option
	metricEnabled bool
	metricOptions []metric.Option
}

func Proxy(username, password, host string, port int) ClientOption {
	return func(b *clientBuilder) error {
		purl, err := url.Parse(
			fmt.Sprintf("http://%s:%s@%s:%d",
				username, password, host, port))

		if err != nil {
			return errors.Wrap(err, "unable to build for proxy")
		}
		b.proxyURL = purl
		return nil
	}
}

func Transport(transport *http.Transport) ClientOption {
	return func(b *clientBuilder) error {
		b.transport = transport
		return nil
	}
}

func ClientOptions(opts ...ClientOption) Option {
	return func(b *builder) error {
		for _, o := range opts {
			if err := o(b.client); err != nil {
				return err
			}

		}
		return nil
	}
}

func BasicAuth(username, password string) Option {
	return func(b *builder) error {
		b.client.basicAuth = BasicAuthConfig{
			Enabled:  true,
			Username: username,
			Password: password,
		}
		return nil
	}
}

func RetryOptions(opts ...retry.Option) Option {
	return func(b *builder) error {
		if b.retryOptions == nil {
			b.retryOptions = []retry.Option{}
		}
		b.retryOptions = append(b.retryOptions, opts...)
		return nil
	}
}

func TraceOptions(opts ...trace.Option) Option {
	return func(b *builder) error {
		b.traceOptions = opts
		return nil
	}
}

func NoTrace() Option {
	return func(b *builder) error {
		b.traceEnabled = false
		return nil
	}
}

func MetricOptions(opts ...metric.Option) Option {
	return func(b *builder) error {
		b.metricOptions = opts
		return nil
	}
}

func NoMetric() Option {
	return func(b *builder) error {
		b.metricEnabled = false
		return nil
	}
}

// implementation of http Client's CheckRedirect to not redirect
func abortRedirect(req *http.Request, via []*http.Request) error {
	return http.ErrUseLastResponse
}

func FromConfig(cfg HTTPConfig) Option {
	return func(b *builder) error {
		proxyURL, err := proxyURLFromConfig(cfg)
		if err != nil {
			return err
		}

		transport, err := transportFromConfig(cfg)
		if err != nil {
			return err
		}

		b.client.basicAuth = cfg.Auth.Basic
		b.client.proxyURL = proxyURL
		b.client.timeout = cfg.Timeout
		b.client.transport = transport
		b.retryOptions = retryOptionsFromConfig(cfg)

		if !cfg.FollowRedirects {
			b.client.checkRedirect = abortRedirect
		}

		return nil
	}
}

func retryOptionsFromConfig(cfg HTTPConfig) []retry.Option {
	retryOptions := []retry.Option{
		retry.RetryCount(cfg.Retry.Retries),
		retry.Retrier(heimdall.NewRetrier(heimdall.NewConstantBackoff(cfg.Retry.Backoff, 100*time.Millisecond))),
		retry.RetryStatusCodes(func(sc int) bool {
			if sc == http.StatusTooManyRequests ||
				sc == http.StatusBadGateway && cfg.Retry.StatusBadGateway {
				return true
			}
			return sc >= http.StatusInternalServerError
		}),
		retry.RetryErrors(func(err error) bool {
			terr, ok := goerrors.Unwrap(err).(net.Error)
			if !ok {
				return false
			}
			return terr.Temporary() || terr.Timeout()
		}),
	}

	return retryOptions
}

func proxyURLFromConfig(cfg HTTPConfig) (*url.URL, error) {
	if cfg.Proxy.Enabled {
		purl, err := url.Parse(
			fmt.Sprintf("http://%s:%s@%s:%s",
				cfg.Proxy.Username,
				cfg.Proxy.Password,
				cfg.Proxy.Host,
				cfg.Proxy.Port))
		if err != nil {
			return nil, errors.Wrap(err, "unable to configure proxy")
		}
		return purl, nil
	}

	return nil, nil
}

func transportFromConfig(cfg HTTPConfig) (*http.Transport, error) {
	transport := &http.Transport{
		MaxIdleConns:          cfg.MaxIdleConns,
		MaxIdleConnsPerHost:   cfg.MaxIdleConns,
		IdleConnTimeout:       cfg.IdleConnTimeout,
		ExpectContinueTimeout: 1 * time.Second,
		DialContext: (&net.Dialer{
			Timeout:   cfg.DialTimeout,
			KeepAlive: cfg.DialKeepAlive,
		}).DialContext,
	}

	if cfg.Auth.TLS.Enabled {
		tlscfg, err := cfg.Auth.TLS.CryptoTLSConfig()
		if err != nil {
			return nil, fmt.Errorf("unable to parse tls config: %w", err)
		}
		transport.TLSClientConfig = tlscfg
	}

	return transport, nil
}

// Creates a http client with metrics and traces enabled.
//
// To disable metrics use the NoMetric option.
// To disable traces use the NoTrace option.
func New(opts ...Option) (heimdall.Doer, error) {
	b := newBuilder()

	for _, o := range opts {
		if err := o(b); err != nil {
			return nil, err
		}
	}

	return b.build()
}

func newBuilder() *builder {
	metricOptions := []metric.Option{
		metric.RecordPath(),
	}

	retryOptions := []retry.Option{}

	traceOptions := []trace.Option{
		trace.AddB3Headers(),
		trace.AddStackDriverHeaders(),
		trace.AddTraceContextHeaders(),
		trace.RecordURL(),
	}

	return &builder{
		client:        &clientBuilder{},
		retryOptions:  retryOptions,
		metricEnabled: true,
		metricOptions: metricOptions,
		traceEnabled:  true,
		traceOptions:  traceOptions,
	}
}

func (b *builder) build() (heimdall.Doer, error) {
	var c heimdall.Doer

	c = b.client.build()
	if b.metricEnabled {
		c = metric.New(c, b.metricOptions...)
	}
	if b.traceEnabled {
		c = trace.New(c, "HTTP.Request", b.traceOptions...)
	}
	c = retry.New(c, b.retryOptions...)
	return c, nil
}

func (b *clientBuilder) build() heimdall.Doer {
	var base heimdall.Doer

	base = &http.Client{
		CheckRedirect: b.checkRedirect,
		Timeout:       b.timeout,
		Transport:     b.transport,
	}

	if b.basicAuth.Enabled {
		base = &basicAuthHttpClient{base, b.basicAuth.Username, b.basicAuth.Password}
	}

	return base
}
