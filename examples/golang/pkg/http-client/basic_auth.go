package client

import (
	"net/http"

	"github.com/gojektech/heimdall"
)

type basicAuthHttpClient struct {
	client   heimdall.Doer
	username string
	password string
}

func (c basicAuthHttpClient) Do(r *http.Request) (*http.Response, error) {
	r.SetBasicAuth(c.username, c.password)
	return c.client.Do(r)
}
