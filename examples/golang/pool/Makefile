GOOS = $(shell go env GOOS)
GOARCH = $(shell go env GOARCH)
SUBPATH = $(GOOS)/$(GOARCH)

GOENV = GOSUMDB=off GOFLAGS=-mod=vendor CGO_ENABLED=0
GO = $(GOENV) go

BINNAME = my_pool
BUILDBASE = build
BUILDDIR = $(BUILDBASE)/$(SUBPATH)

BIN = $(BUILDDIR)/$(BINNAME)

TESTFLAGS = -timeout 3m -covermode=atomic -cover -coverprofile=cover.out

PREFIX  = /opt
DESTDIR = $(PREFIX)/bin

SOURCEDIRS = pkg
SOURCES = $(shell find $(SOURCEDIRS) -name '*.go')

IN_DOCKER := docker run --rm \
		-v `pwd`:/app \
        -w /app \
        golangci/golangci-lint:v1.57.2

ifeq (, $(shell which golangci-lint))
GOLANGCI_LINT := $(IN_DOCKER) golangci-lint
else
GOLANGCI_LINT := golangci-lint
endif

.PHONY: all install clean clean-go-cache dep proper

all: $(BINNAME)

test: unittest

unittest:
	$(GO) test $(TESTFLAGS) -tags unit ./...

install: $(BINNAME)
	install -D -t $(DESTDIR) $(BINNAME)

proper: clean clean-go-cache

check:
	$(GOLANGCI_LINT) run

clean-go-cache:
	$(GO) clean -testcache -modcache

clean:
	rm -f $(BINNAME)
	rm -rf $(BUILDBASE) $(COVERDIR)

dep:
	$(GO) mod tidy
	$(GO) mod vendor

vendor-gofmt:
	git diff --name-only 'vendor/**.go' | xargs -r gofmt -w

$(BUILDDIR):
	mkdir -p $(BUILDDIR)

$(BIN): $(BUILDDIR) $(SOURCES) $(PROTOSETS)
	$(GO) build -o $(BIN) .

$(BINNAME): $(BIN)
	cp $(BIN) .
