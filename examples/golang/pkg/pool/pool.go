package pool

import (
	"context"
	"sync"
	"time"

	"go.uber.org/atomic"

	"go.uber.org/zap"

	"github.com/pkg/errors"
)

var (
	ErrPoolClosed          = errors.New("pool is closed")
	ErrOutOfResources      = errors.New("no resources were found in time")
	ErrAllResourcesInvalid = errors.New("all resources are in an invalid state")
)

type Poolable interface {
	// Valid returns false, the pool will try to replace the invalid instance and refill automatically
	Valid() bool

	Invalidate()
	Validate()
}

type factory func() (Poolable, error)

type Pool struct {
	mu sync.RWMutex

	ch  chan Poolable
	f   factory
	log *zap.Logger

	closed        bool
	refillTimeout time.Duration

	healthy *atomic.Int32
}

type Option func(*Pool) error

func WithLog(log *zap.Logger) Option {
	return func(pool *Pool) error {
		pool.log = log
		return nil
	}
}

func New(capacity int, factory factory, opts ...Option) (*Pool, error) {
	if capacity <= 0 {
		return nil, errors.New("invalid capacity settings")
	}

	pool := &Pool{
		ch:            make(chan Poolable, capacity),
		f:             factory,
		closed:        false,
		refillTimeout: time.Second,
		log:           zap.NewNop(),
		healthy:       atomic.NewInt32(int32(capacity)),
	}

	for _, o := range opts {
		if err := o(pool); err != nil {
			return nil, err
		}
	}

	// create initial poolables, if something goes wrong, just close the Pool and error out.
	for i := 0; i < capacity; i++ {
		v, err := factory()
		if err != nil {
			pool.Close()
			return nil, errors.Wrap(err, "factory is not able to fill the pool")
		}
		pool.ch <- v
	}

	return pool, nil
}

func (p *Pool) Get(ctx context.Context) (Poolable, error) {
	if p.healthy.Load() == 0 {
		return nil, ErrAllResourcesInvalid
	}

	invalid := 0
	defer func() {
		go p.refill(invalid)
	}()

	for {
		select {
		case <-ctx.Done():
			return nil, ErrOutOfResources
		case v, ok := <-p.ch:
			if !ok {
				return nil, ErrPoolClosed
			}
			if !v.Valid() {
				invalid++
				continue
			}
			return v, nil
		}
	}
}

type errCloser interface {
	Close() error
}

type nilCloser interface {
	Close()
}

func (p *Pool) Put(v Poolable) error {
	if v == nil {
		return errors.New("rejecting <nil> poolable")
	}

	// lock the mutex because we are sending to p.ch
	// without the lock one could call close; close ch and the send to p.ch would panic
	p.mu.RLock()
	defer p.mu.RUnlock()

	if p.closed {
		// pool is closed, try to close passed poolable
		switch t := v.(type) {
		case errCloser:
			return t.Close()
		case nilCloser:
			t.Close()
			return nil
		default:
			return nil
		}
	}

	p.ch <- v
	return nil
}

func (p *Pool) Close() {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.closed {
		return
	}
	p.closed = true

	close(p.ch)

	for v := range p.ch {
		switch t := v.(type) {
		case errCloser:
			if err := t.Close(); err != nil {
				p.log.Warn("error closing poolable", zap.Error(err))
			}
		case nilCloser:
			t.Close()
		}
	}
}

func (p *Pool) refill(invalid int) {
	p.healthy.Sub(int32(invalid))
	for j := 0; j < invalid; time.Sleep(p.refillTimeout) {
		if p.closed {
			return
		}
		v, err := p.f()
		if err != nil {
			p.log.Debug("unable to refill pool", zap.Error(err), zap.Bool("retry", true))
			continue
		}
		if err := p.Put(v); err != nil {
			p.log.Debug("unable to refill pool", zap.Error(err), zap.Bool("retry", true))
			continue
		}
		j++
		p.healthy.Add(1)
	}
}
