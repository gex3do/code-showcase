package card

import (
	"fmt"

	"card/pkg"
	"card/pkg/utils"
)

// CreditCard interface defines the methods for validating and displaying card information
type CreditCard interface {
	Number() string
	Valid() bool
	Schema() pkg.Schema
}

type card struct {
	number string     // The sanitized card number.
	valid  bool       // Cached result indicating if the card is valid
	schema pkg.Schema // The card's schema determined during validation.
}

// NewCreditCard creates a new credit card instance from a string representation of the card number
func NewCreditCard(cardNumber string) (CreditCard, error) {
	number := utils.NormalizeCardNumber(cardNumber)

	valid, schema, err := validateCardDetails(number)
	if err != nil {
		return nil, err
	}

	return &card{
		number: number,
		valid:  valid,
		schema: schema,
	}, nil
}

// Number returns the sanitized (normalized) card number.
func (c *card) Number() string {
	return c.number
}

// Valid checks whether the card is valid based on the cached validation result.
func (c *card) Valid() bool {
	return c.valid
}

// Schema returns the cached card schema.
func (c *card) Schema() pkg.Schema {
	return c.schema
}

func (c *card) String() string {
	validText := map[bool]string{true: "valid", false: "invalid"}[c.valid]
	return fmt.Sprintf("The card '%s' is '%s' and has '%s' schema", c.number, validText, c.schema)
}

func validateCardDetails(cardNumber string) (bool, pkg.Schema, error) {
	valid, err := utils.CardValid(cardNumber)
	if err != nil {
		return false, "", err
	}
	schema, err := utils.CardSchema(cardNumber)
	if err != nil {
		return false, "", err
	}
	return valid, schema, nil
}
