package main

import (
	"context"

	"pool/pkg"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	poolSize := 1
	numOfGoroutines := 2
	if err := pkg.PlayScenarioOfConnectionPool(ctx, poolSize, numOfGoroutines); err != nil {
		cancel()
		panic(err)
	}
}
