package trace

import (
	"net/http"

	traceUtil "notexistingdomain.com/back/go-commons/pkg/stats/trace"

	"go.opencensus.io/exporter/stackdriver/propagation"
	"go.opencensus.io/plugin/ochttp/propagation/b3"
	"go.opencensus.io/plugin/ochttp/propagation/tracecontext"
	"go.opencensus.io/trace"

	"github.com/gojektech/heimdall"
)

const (
	StatusCodeKey = "http.status_code"
	URLKey        = "http.url"
)

type Option func(*TracedDoer)

func AddB3Headers() Option {
	return func(doer *TracedDoer) {
		doer.addB3Headers = true
	}
}

func AddTraceContextHeaders() Option {
	return func(doer *TracedDoer) {
		doer.addTraceContextHeaders = true
	}
}

func AddStackDriverHeaders() Option {
	return func(doer *TracedDoer) {
		doer.addStackDriverHeaders = true
	}
}

func RecordURL() Option {
	return func(doer *TracedDoer) {
		doer.recordURL = true
	}
}

func New(d heimdall.Doer, spanName string, opts ...Option) *TracedDoer {
	td := &TracedDoer{
		Doer:                   d,
		spanName:               spanName,
		addTraceContextHeaders: false,
		addStackDriverHeaders:  false,
		addB3Headers:           false,
		recordURL:              false,
	}

	for _, o := range opts {
		o(td)
	}

	return td
}

type TracedDoer struct {
	heimdall.Doer

	spanName string

	addB3Headers           bool
	addStackDriverHeaders  bool
	addTraceContextHeaders bool
	recordURL              bool
}

func (td *TracedDoer) Do(req *http.Request) (res *http.Response, err error) {
	ctx := req.Context()

	ctx, span := trace.StartSpan(ctx, td.spanName)
	defer func() { traceUtil.RecordStatus(span, err); span.End() }()

	if td.recordURL {
		span.AddAttributes(traceUtil.TrimmedStringAttribute(URLKey, req.URL.String()))
	}

	td.addSpanContextHeaders(span, req.WithContext(ctx))
	res, err = td.Doer.Do(req)
	if err != nil {
		return res, err
	}

	span.AddAttributes(trace.Int64Attribute(StatusCodeKey, int64(res.StatusCode)))
	return res, nil
}

func (td *TracedDoer) addSpanContextHeaders(span *trace.Span, req *http.Request) {
	if td.addB3Headers {
		(*b3.HTTPFormat)(nil).SpanContextToRequest(span.SpanContext(), req)
	}
	if td.addStackDriverHeaders {
		(*propagation.HTTPFormat)(nil).SpanContextToRequest(span.SpanContext(), req)
	}
	if td.addTraceContextHeaders {
		(*tracecontext.HTTPFormat)(nil).SpanContextToRequest(span.SpanContext(), req)
	}
}
