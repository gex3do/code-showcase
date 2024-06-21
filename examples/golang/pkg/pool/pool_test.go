//go:build unit
// +build unit

package pool

import (
	"context"
	"testing"
	"time"

	"go.uber.org/zap"

	"github.com/pkg/errors"
	"github.com/stretchr/testify/require"
)

type mockPoolable struct {
	AtomicValidatable
	errClose error
}

func (mp *mockPoolable) Close() error {
	return mp.errClose
}

func TestNewPoolSuccess(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), nil}, nil
	}
	_, err := New(1, factory, WithLog(zap.NewNop()))
	require.NoError(t, err)
}

func TestNewPoolFailureFactory(t *testing.T) {
	factory := func() (Poolable, error) {
		return nil, errors.New("boom")
	}
	_, err := New(1, factory)
	require.Error(t, err)
}

func TestNewPoolFailureCapSettings(t *testing.T) {
	factory := func() (Poolable, error) {
		return nil, errors.New("boom")
	}
	_, err := New(0, factory)
	require.Error(t, err)
}

func TestPoolGetErrClosed(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), nil}, nil
	}
	pool, err := New(1, factory)
	require.NoError(t, err)
	pool.Close()
	_, err = pool.Get(context.Background())
	require.Error(t, err)
}

func TestPoolClosedPutCloses(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), nil}, nil
	}
	pool, err := New(1, factory)
	require.NoError(t, err)
	pool.Close()
	require.Error(t, pool.Put(&mockPoolable{NewAtomicValidatable(true), errors.New("boom")}))
}

func TestPoolPutNilError(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), nil}, nil
	}
	pool, err := New(1, factory)
	require.NoError(t, err)
	pool.Close()
	require.Error(t, pool.Put(nil))
}

func TestPoolGetSuccessFromCache(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), nil}, nil
	}
	pool, err := New(1, factory)
	require.NoError(t, err)
	_, err = pool.Get(context.Background())
	require.NoError(t, err)
	require.Equal(t, 0, len(pool.ch))
}

func TestPoolRefill(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), nil}, nil
	}
	pool, err := New(1, factory)
	require.NoError(t, err)

	pool.ch = make(chan Poolable, 1)
	inv := &mockPoolable{NewAtomicValidatable(false), nil}
	pool.ch <- inv

	pool.refillTimeout = time.Millisecond

	ctx, cancel := context.WithTimeout(context.Background(), time.Millisecond)
	defer cancel()

	_, err = pool.Get(ctx)
	require.Error(t, err)

	v := <-pool.ch
	require.True(t, v.Valid())
}

func TestPoolCloseError(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), errors.New("boom")}, nil
	}
	pool, err := New(1, factory)
	require.NoError(t, err)
	pool.Close()
}

func TestPoolParallelClose(t *testing.T) {
	factory := func() (Poolable, error) {
		return &mockPoolable{NewAtomicValidatable(true), nil}, nil
	}
	pool, err := New(10, factory)
	require.NoError(t, err)
	for i := 0; i < 100; i++ {
		go pool.Close()
	}
}
