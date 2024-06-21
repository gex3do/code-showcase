package main

import (
	"context"

	"myproject.com/pool/example/pool"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	poolSize := 1
	numOfGoroutines := 2
	if err := pool.PlayScenarioOfConnectionPool(ctx, poolSize, numOfGoroutines); err != nil {
		cancel()
		panic(err)
	}
}
