package pkg

import (
	"context"

	"pool/pkg/pool"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var connectionOpenError = errors.New("the connection is not open")

type Connection interface {
	pool.Poolable

	Publish(msg string) error
	Close() error
}

type connection struct {
	pool.AtomicValidatable
	httpConn *httpConnection
}

func newConnection(httpConn *httpConnection) Connection {
	c := &connection{
		pool.NewAtomicValidatable(true),
		httpConn,
	}
	return c
}

func (c *connection) Publish(msg string) error {
	return c.httpConn.Publish(msg)
}

func (c *connection) Close() error {
	return c.httpConn.Close()
}

var _ Connection = &connection{}

type ConnectionPool struct {
	p *pool.Pool
}

type ConnectionFactory func() (Connection, error)

func NewConnectionPool(capacity int, connFactory ConnectionFactory, log *zap.Logger) (*ConnectionPool, error) {
	fact := func() (pool.Poolable, error) {
		return connFactory()
	}

	p, err := pool.New(capacity, fact, pool.WithLog(log))
	if err != nil {
		return nil, err
	}
	return &ConnectionPool{p}, nil
}

func (cp *ConnectionPool) Get(ctx context.Context) (Connection, error) {
	p, err := cp.p.Get(ctx)
	if err != nil {
		return nil, err
	}
	return p.(Connection), nil
}

func (cp *ConnectionPool) Put(c Connection) error {
	return cp.p.Put(c)
}

func (cp *ConnectionPool) Close() {
	cp.p.Close()
}
