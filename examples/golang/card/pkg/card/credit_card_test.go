//go:build unit

package card

import (
	"testing"

	"card/pkg"

	"github.com/stretchr/testify/assert"
)

func TestCreditCardFullyDetails(t *testing.T) {
	cases := []struct {
		name           string
		cardNumber     string
		expectedNumber string
		expectedValid  bool
		expectedSchema pkg.Schema
		expectError    bool
	}{
		{
			"should-be-valid-america-express",
			"  378282246310005  ",
			"378282246310005",
			true,
			pkg.SchemaAmericanExpress,
			false,
		},
		{
			"should-be-valid-jcb",
			" 3530 111 3333 00 000  ",
			"3530111333300000",
			true,
			pkg.SchemaJCB,
			false,
		},
		{
			"should-be-invalid-but-recognized-maestro",
			"6759649826438454",
			"6759649826438454",
			false,
			pkg.SchemaMaestro,
			false,
		},
		{
			"should-return-error-when-empty",
			"",
			"",
			false,
			pkg.SchemaUnknown,
			true,
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			wrappedCard, err := NewCreditCard(c.cardNumber)
			if c.expectError {
				assert.Error(t, err)
			} else {
				assert.Equal(t, c.expectedNumber, wrappedCard.Number())
				assert.Equal(t, c.expectedValid, wrappedCard.Valid())
				assert.Equal(t, c.expectedSchema, wrappedCard.Schema())
				assert.NoError(t, err)
			}
		})
	}
}
