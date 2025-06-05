package utils

import (
	"slices"
	"strconv"
	"strings"

	"card/pkg"
)

type CardLookup interface {
	Match(cardNumber string) (pkg.Schema, bool, error)
}

type cardScheme struct {
	name     pkg.Schema
	prefixes []string // Ranges like "34", "37", "3528-3589"
	lengths  []int    // Possible lengths like 15, 16, etc.
}

type lookupTable struct {
	schemes []cardScheme
}

func newLookupTable() CardLookup {
	return &lookupTable{
		schemes: []cardScheme{
			{
				name:     pkg.SchemaAmericanExpress,
				prefixes: []string{"34", "37"},
				lengths:  []int{15},
			},
			{
				name:     pkg.SchemaJCB,
				prefixes: []string{"3528-3589"},
				lengths:  []int{16, 17, 18, 19},
			},
			{
				name:     pkg.SchemaMaestro,
				prefixes: []string{"50", "56-58", "6"},
				lengths:  []int{12, 13, 14, 15, 16, 17, 18, 19},
			},
			{
				name:     pkg.SchemaVisa,
				prefixes: []string{"4"},
				lengths:  []int{13, 16, 19},
			},
			{
				name:     pkg.SchemaMasterCard,
				prefixes: []string{"2221-2720", "51-55"},
				lengths:  []int{16},
			},
		},
	}
}

func (lt *lookupTable) Match(cardNumber string) (pkg.Schema, bool, error) {
	cardLength := len(cardNumber)
	for _, scheme := range lt.schemes {
		if !slices.Contains(scheme.lengths, cardLength) {
			continue
		}

		for _, prefixRange := range scheme.prefixes {
			if ok, err := matchPrefix(cardNumber, prefixRange); err != nil {
				return "", false, err
			} else if ok {
				return scheme.name, true, nil
			}
		}
	}
	return "", false, nil
}

// matchPrefix checks if a card number matches a given prefix or prefix range.
func matchPrefix(cardNumber, prefixRange string) (bool, error) {
	if strings.Contains(prefixRange, "-") {
		// Handle ranges like "3528-3589".
		parts := strings.Split(prefixRange, "-")
		start, err := strconv.Atoi(parts[0])
		if err != nil {
			return false, err
		}
		end, err := strconv.Atoi(parts[1])
		if err != nil {
			return false, err
		}
		prefixLength := len(parts[0])
		cardPrefix, err := strconv.Atoi(cardNumber[:prefixLength])
		if err != nil {
			return false, err
		}
		return cardPrefix >= start && cardPrefix <= end, nil
	}
	// Handle fixed prefixes like "34" or "37".
	return strings.HasPrefix(cardNumber, prefixRange), nil
}
