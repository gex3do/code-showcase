package pkg

import (
	"context"
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

/*
PlayScenarioOfConnectionPool demonstrates custom implementation of `worker pool`.
It's designed to hold a set of temporary objects that may be individually saved and retrieved.

Abilities:
- pool capacity can be set
- pool is implemented via channels,
	as a benefit, objects will not be moved to a victim pool with the intent to be removed by GC
- safe for concurrent use (same as sync.pool)
*/

func PlayScenarioOfConnectionPool(ctx context.Context, poolSize int, numOfGoroutines int) (err error) {
	connMgr, err := newConnectionManager(poolSize, zap.NewNop())
	if err != nil {
		return errors.Wrap(err, "cannot create connection pool")
	}

	// Generally is used https://pkg.go.dev/gopkg.in/tomb.v2 module for handling
	// goroutines, but for this example scenario, it is not a point.
	errCh := make(chan error, numOfGoroutines)
	wg := sync.WaitGroup{}
	wg.Add(numOfGoroutines)

	for i := 0; i < numOfGoroutines; i++ {
		go func(connId int) {
			defer wg.Done()
			connName := fmt.Sprintf("connection-name: %d", connId)
			if connErr := connMgr.execConnection(ctx, connName); connErr != nil {
				errCh <- connErr
			}
			time.Sleep(time.Second * time.Duration(rand.Intn(10)))
		}(i)
	}

	go func() {
		wg.Wait()
		close(errCh)
	}()

	for err = range errCh {
		if err != nil {
			return err
		}
	}

	return nil
}
