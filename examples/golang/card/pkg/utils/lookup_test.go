//go:build unit

package utils

import (
	"testing"

	"card/pkg"

	"github.com/stretchr/testify/assert"
)

func TestLookup(t *testing.T) {
	cardLookupTable := newLookupTable()
	cases := []struct {
		name           string
		cardNumber     string
		expectedResult pkg.Schema
	}{
		{
			"should-be-american-express",
			"378282246310005",
			pkg.SchemaAmericanExpress,
		},
		{
			"should-be-jcb",
			"3530111333300000",
			pkg.SchemaJCB,
		},
		{
			"should-be-maestro",
			"6759649826438453",
			pkg.SchemaMaestro,
		},
		{
			"should-be-visa",
			"4012888888881881",
			pkg.SchemaVisa,
		},
		{
			"should-be-master-card",
			"5105105105105100",
			pkg.SchemaMasterCard,
		},
		{
			"should-be-unrecognized-card",
			"9105105105105100",
			"",
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			schema, _, _ := cardLookupTable.Match(c.cardNumber)
			assert.Equal(t, c.expectedResult, schema)
		})
	}
}

func TestMatchPrefix(t *testing.T) {
	cases := []struct {
		name           string
		cardNumber     string
		prefixRange    string
		expectedResult bool
		expectError    bool
	}{
		{
			"should-match-for-single-prefix",
			"378282246310005",
			"37",
			true,
			false,
		},
		{
			"should-not-match-for-wrong-single-prefix",
			"378282246310005",
			"38",
			false,
			false,
		},
		{
			"should-match-for-range-prefix",
			"3530111333300000",
			"3528-3589",
			true,
			false,
		},
		{
			"should-not-match-for-wrong-range-prefix",
			"2030111333300000",
			"3528-3589",
			false,
			false,
		},
		{
			"should-return-error-for-wrong-start-range",
			"2030111333300000",
			"hello-3589",
			false,
			true,
		},
		{
			"should-return-error-for-wrong-end-range",
			"2030111333300000",
			"3528-hello",
			false,
			true,
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			matched, err := matchPrefix(c.cardNumber, c.prefixRange)
			if c.expectError {
				assert.Error(t, err)
			} else {
				assert.Equal(t, c.expectedResult, matched)
			}
		})
	}
}
