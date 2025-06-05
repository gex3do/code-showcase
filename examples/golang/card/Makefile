GOENV = GOSUMDB=off GOFLAGS=-mod=vendor CGO_ENABLED=0
GO = $(GOENV) go

TESTFLAGS = -timeout 3m -covermode=atomic -cover -coverprofile=cover.out

IN_DOCKER := docker run --rm \
		-v `pwd`:/app \
        -w /app \
        golangci/golangci-lint:v1.64.4

ifeq (, $(shell which golangci-lint))
GOLANGCI_LINT := $(IN_DOCKER) golangci-lint
else
GOLANGCI_LINT := golangci-lint
endif

.PHONY: clean-go-cache dep

all: dev-run

test:
	$(GO) test $(TESTFLAGS) -tags unit ./...

check:
	$(GOLANGCI_LINT) run

clean-go-cache:
	$(GO) clean -testcache -modcache

dep:
	$(GO) mod tidy
	$(GO) mod vendor

dev-run:
	$(GO) run .
