package client

import (
	"time"

	tlsConf "notexistingdomain.com/back/go-commons/pkg/config"
	"notexistingdomain.com/back/go-commons/pkg/retry"
)

type EmbeddedHTTPConfig struct {
	HTTP HTTPConfig
}

type HTTPConfig struct {
	Timeout         time.Duration
	DialTimeout     time.Duration
	DialKeepAlive   time.Duration
	IdleConnTimeout time.Duration
	MaxIdleConns    int
	FollowRedirects bool

	Retry RetryConfig
	Proxy ProxyConfig
	Auth  AuthConfig
}

type AuthConfig struct {
	TLS   tlsConf.TLSConfig
	Basic BasicAuthConfig
}

type BasicAuthConfig struct {
	Enabled  bool
	Username string
	Password string
}

type RetryConfig struct {
	retry.Config `mapstructure:",squash"`

	// true: retry on http.StatusBadGateway
	StatusBadGateway bool
}

type ProxyConfig struct {
	Enabled  bool
	Username string
	Password string
	Host     string
	Port     string
}

func DefaultHTTPConfig() EmbeddedHTTPConfig {
	return EmbeddedHTTPConfig{
		HTTP: HTTPConfig{
			Timeout:         30 * time.Second,
			DialTimeout:     2 * time.Second,
			DialKeepAlive:   10 * time.Second,
			MaxIdleConns:    100,
			IdleConnTimeout: 90 * time.Second,
			Retry: RetryConfig{
				Config:           retry.DefaultConfig(),
				StatusBadGateway: false,
			},
			FollowRedirects: true,
			Auth: AuthConfig{
				TLS: tlsConf.TLSConfig{
					Enabled: false,
				},
				Basic: BasicAuthConfig{
					Enabled: false,
				},
			},
			Proxy: ProxyConfig{
				Enabled: false,
			},
		},
	}
}
