package utils

import (
	"errors"
	"strings"

	"card/pkg"
)

const maxCardLength = 19

// NormalizeCardNumber removes spaces and trims the input string
func NormalizeCardNumber(cardNumber string) string {
	return strings.TrimSpace(strings.ReplaceAll(cardNumber, " ", ""))
}

// CardValid validates a card based on its normalized card number.
// The input card number should already be normalized, meaning all non-numeric characters
// (such as spaces or dashes) must be removed before calling this function.
// Input example: 378282246310005
func CardValid(cardNumber string) (bool, error) {
	if err := validateCardNumberLength(cardNumber); err != nil {
		return false, err
	}

	digits, err := convertToDigits(cardNumber)
	if err != nil {
		return false, err
	}

	return validChecksum(digits), nil
}

// CardSchema determines the schema of a card based on its normalized card number.
// If the schema cannot be determined, it returns "Unknown".
// The input card number should already be normalized, meaning all non-numeric characters
// (such as spaces or dashes) must be removed before calling this function.
// Input example: 378282246310005
func CardSchema(cardNumber string) (pkg.Schema, error) {
	if err := validateCardNumberLength(cardNumber); err != nil {
		return pkg.SchemaUnknown, err
	}

	schema, matched, err := newLookupTable().Match(cardNumber)
	if err != nil {
		return pkg.SchemaUnknown, err
	} else if !matched {
		return pkg.SchemaUnknown, nil
	}

	return schema, nil
}

func validateCardNumberLength(cardNumber string) error {
	numLen := len(cardNumber)
	if numLen == 0 {
		return errors.New("invalid card number: empty")
	} else if numLen > maxCardLength {
		return errors.New("invalid card number: too long")
	}
	return nil
}

// convertToDigits converts a card number string into a slice of integers
func convertToDigits(cardNumber string) ([]int, error) {
	numbers := make([]int, 0, len(cardNumber))
	for _, digit := range cardNumber {
		if digit < '0' || digit > '9' {
			return nil, errors.New("invalid card number: contains non-digit characters")
		}
		numbers = append(numbers, int(digit-'0'))
	}
	return numbers, nil
}

// validChecksum validates a sequence of digits.
// It processes the digits in reverse order, doubling every second digit (from the right).
// If a doubled digit exceeds 9, its digits are summed (e.g., 18 becomes 1 + 8 = 9).
// Returns true if the checksum is valid (divisible by 10).
func validChecksum(digits []int) bool {
	checksum := 0
	second := false
	for p := len(digits) - 1; p >= 0; p-- {
		number := digits[p]

		if second {
			number = digits[p] * 2
		}

		checksum += number / 10
		checksum += number % 10

		second = !second
	}
	return (checksum % 10) == 0
}
