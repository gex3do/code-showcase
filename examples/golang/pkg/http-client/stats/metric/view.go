package metric

import (
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var mHTTPResp = stats.Int64("http_response_codes", "http response codes", "1")
var mHTTPErr = stats.Int64("http_errors", "http errors", "1")
var mHTTPDur = stats.Int64("http_durations", "http request duration", "ms")

var (
	StatusCodeTagKey, _ = tag.NewKey("statusCode")
	ClientTagKey, _     = tag.NewKey("client")
	HostKey, _          = tag.NewKey("host")
	PathKey, _          = tag.NewKey("path")
	SchemeKey, _        = tag.NewKey("scheme")
)

type ViewOption func(*viewConfig)

type viewConfig struct {
	httpDurationDistribution []float64
}

func DurationDistribution(bounds ...float64) ViewOption {
	return func(config *viewConfig) {
		config.httpDurationDistribution = bounds
	}
}

func RegisterDefaultViews(opts ...ViewOption) error {
	cfg := &viewConfig{
		httpDurationDistribution: []float64{
			1e2, 2e2, 3e2, 4e2, 5e2, 6e2, 7e2, 8e2, 9e2,
			1e3, 2e3, 3e3, 4e3, 5e3, 6e3, 7e3, 8e3, 9e3,
			1e4, 2e4, 3e4, 4e4, 5e4, 6e4, 7e4, 8e4, 9e4,
			1e5, 2e5, 3e5, 4e5, 5e5, 6e5, 7e5, 8e5, 9e5,
			1e6, 2e6, 3e6, 4e6, 5e6, 6e6, 7e6, 8e6, 9e6,
		},
	}

	for _, o := range opts {
		o(cfg)
	}

	httpRespCountView := &view.View{
		Name:        "http/response_count",
		Measure:     mHTTPResp,
		TagKeys:     []tag.Key{StatusCodeTagKey, HostKey, PathKey, SchemeKey, ClientTagKey},
		Description: "The number of http responses",
		Aggregation: view.Count(),
	}
	httpErrorView := &view.View{
		Name:        "http/request_error_count",
		Measure:     mHTTPErr,
		TagKeys:     []tag.Key{HostKey, PathKey, SchemeKey, ClientTagKey},
		Description: "The number of http request errors",
		Aggregation: view.Count(),
	}
	httpDurationView := &view.View{
		Name:        "http/request_duration_ms",
		Measure:     mHTTPDur,
		TagKeys:     []tag.Key{HostKey, PathKey, SchemeKey, ClientTagKey},
		Description: "The duration of http requests in ms",
		Aggregation: view.Distribution(cfg.httpDurationDistribution...),
	}
	return view.Register(httpRespCountView, httpErrorView, httpDurationView)
}
