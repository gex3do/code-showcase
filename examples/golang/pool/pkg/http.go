package pkg

import "fmt"

type httpConnection struct {
	Name string
}

func (c *httpConnection) Publish(msg string) error {
	fmt.Printf("httpConnection: %s, publishing: %s\n", c.Name, msg)
	return nil
}

func (c *httpConnection) Close() error {
	fmt.Printf("httpConnection %s closes\n", c.Name)
	return nil
}
