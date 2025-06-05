package pkg

import (
	"context"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type connectionManager struct {
	pool *ConnectionPool
	log  *zap.Logger
}

func newConnectionManager(poolSize int, log *zap.Logger) (*connectionManager, error) {
	connFactory := func() (Connection, error) {
		return newConnection(&httpConnection{Name: "httpConnection"}), nil
	}

	connPool, err := NewConnectionPool(poolSize, connFactory, log)
	if err != nil {
		return nil, err
	}

	return &connectionManager{pool: connPool, log: log}, nil
}

func (connMgr *connectionManager) execConnection(ctx context.Context, msg string) (err error) {
	var conn Connection
	conn, err = connMgr.pool.Get(ctx)
	if err != nil {
		return errors.New("cannot get connection from the pool")
	}

	defer func() {
		if err = connMgr.pool.Put(conn); err != nil {
			connMgr.log.Error("cannot put connection to the pool", zap.Error(err))
		}
	}()

	if err = conn.Publish(msg); err != nil {
		if errors.Is(err, connectionOpenError) {
			conn.Invalidate()
		}
		return errors.Wrap(err, "cannot publish message")
	}

	if err = conn.Close(); err != nil {
		return errors.Wrap(err, "cannot close connection")
	}

	return
}
