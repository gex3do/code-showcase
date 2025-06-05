//go:build unit

package utils

import (
	"errors"
	"testing"

	"card/pkg"

	"github.com/stretchr/testify/assert"
)

func TestNormalizeCardNumber(t *testing.T) {
	cases := []struct {
		name           string
		cardNumber     string
		expectedResult string
	}{
		{
			"should-remove-surrounding-whitespaces",
			"  378282246310005  ",
			"378282246310005",
		},
		{
			"should-remove-spaces-between-digits",
			"37 82 8224 6310 005  ",
			"378282246310005",
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			numbers := NormalizeCardNumber(c.cardNumber)
			assert.Equal(t, c.expectedResult, numbers)
		})
	}
}

func TestConvertToDigits(t *testing.T) {
	cases := []struct {
		name           string
		cardNumber     string
		expectedResult []int
		expectError    bool
	}{
		{
			"should-convert-card-number-to-digits",
			"378282246310005",
			[]int{3, 7, 8, 2, 8, 2, 2, 4, 6, 3, 1, 0, 0, 0, 5},
			false,
		},
		{
			"should-return-error-for-invalid-character-dot",
			"378282246310005.",
			nil,
			true,
		},
		{
			"should-return-error-for-invalid-character-with-spaces",
			"  3782 8224 6310 005 ",
			nil,
			true,
		},
		{
			"should-return-error-for-alphabetic-characters",
			"378282246310005abc",
			nil,
			true,
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			numbers, err := convertToDigits(c.cardNumber)
			if c.expectError {
				assert.Error(t, err)
			} else {
				assert.Equal(t, c.expectedResult, numbers)
			}
		})
	}
}

func TestValidCheckSum(t *testing.T) {
	cases := []struct {
		name           string
		numbers        []int
		expectedResult bool
	}{
		{
			"should-pass-for-sum-0",
			[]int{},
			true,
		},
		{
			"should-pass-for-sum-0-again",
			[]int{0, 0, 0, 0, 0, 0},
			true,
		},
		{
			"should-pass-as-divisible-by-10",
			[]int{3, 7, 8, 2, 8, 2, 2, 4, 6, 3, 1, 0, 0, 0, 5},
			true,
		},
		{
			"should-not-pass-as-not-divisible-by-10",
			[]int{5, 2, 3, 7, 2, 5, 1, 6, 2, 4, 7, 7, 8, 1, 3, 2},
			false,
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			numbers := validChecksum(c.numbers)
			assert.Equal(t, c.expectedResult, numbers)
		})
	}
}

func TestCardValid(t *testing.T) {
	cases := []struct {
		name             string
		cardNumber       string
		expectedResult   bool
		expectError      bool
		expectedErrorMsg error
	}{
		{
			"should-be-valid-american-express",
			"378282246310005",
			true,
			false,
			nil,
		},
		{
			"should-be-valid-jcb",
			"3530111333300000",
			true,
			false,
			nil,
		},
		{
			"should-be-valid-maestro",
			"6759649826438453",
			true,
			false,
			nil,
		},
		{
			"should-be-valid-visa",
			"4012888888881881",
			true,
			false,
			nil,
		},
		{
			"should-be-valid-master-card",
			"5105105105105100",
			true,
			false,
			nil,
		},
		{
			"should-return-error-empty",
			"",
			false,
			true,
			errors.New("invalid card number: empty"),
		},
		{
			"should-return-error-too-long",
			"11111111111111111111",
			false,
			true,
			errors.New("invalid card number: too long"),
		},
		{
			"should-return-error-contains-not-digits",
			"5105105105105100.",
			false,
			true,
			errors.New("invalid card number: contains non-digit characters"),
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			valid, err := CardValid(c.cardNumber)
			if c.expectError {
				assert.EqualError(t, err, c.expectedErrorMsg.Error())
			} else {
				assert.Equal(t, c.expectedResult, valid)
			}
		})
	}
}

func TestCardSchema(t *testing.T) {
	cases := []struct {
		name             string
		cardNumber       string
		expectedResult   pkg.Schema
		expectError      bool
		expectedErrorMsg error
	}{
		{
			"should-be-schema-american-express",
			"378282246310005",
			pkg.SchemaAmericanExpress,
			false,
			nil,
		},
		{
			"should-be-schema-jcb",
			"3530111333300000",
			pkg.SchemaJCB,
			false,
			nil,
		},
		{
			"should-be-schema-maestro",
			"6759649826438453",
			pkg.SchemaMaestro,
			false,
			nil,
		},
		{
			"should-be-schema-visa",
			"4012888888881881",
			pkg.SchemaVisa,
			false,
			nil,
		},
		{
			"should-be-schema-master-card",
			"5105105105105100",
			pkg.SchemaMasterCard,
			false,
			nil,
		},
		{
			"should-be-schema-unknown",
			"",
			pkg.SchemaUnknown,
			false,
			nil,
		},
		{
			"should-be-schema-unknown",
			"99999999999999999999",
			pkg.SchemaUnknown,
			false,
			nil,
		},
		{
			"should-return-error-empty",
			"",
			pkg.SchemaUnknown,
			true,
			errors.New("invalid card number: empty"),
		},
		{
			"should-return-error-too-long",
			"11111111111111111111",
			pkg.SchemaUnknown,
			true,
			errors.New("invalid card number: too long"),
		},
		{
			"should-return-error-contains-not-digits",
			"5105105105105100.",
			pkg.SchemaUnknown,
			true,
			errors.New("invalid card number: contains non-digit characters"),
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			schema, _ := CardSchema(c.cardNumber)
			assert.Equal(t, c.expectedResult, schema)
		})
	}
}
