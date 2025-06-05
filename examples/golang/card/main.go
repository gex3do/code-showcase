package main

import (
	"fmt"
	"log"

	"card/pkg/card"
	"card/pkg/utils"
)

func main() {
	exampleOne()
	exampleTwo()
}

func exampleOne() {
	// Example 1: Validating and checking schema of a card number.
	guestCard := utils.NormalizeCardNumber("3782 8224 6310 005")

	cardSchema, err := utils.CardSchema(guestCard)
	if err != nil {
		log.Fatalf("Error determining schema for card %s: %v", guestCard, err)
	}

	isValid, err := utils.CardValid(guestCard)
	if err != nil {
		log.Fatalf("Error validating card %s: %v", guestCard, err)
	}

	if isValid {
		fmt.Printf("The card '%s' is 'valid' and belongs to the '%s' schema.\n", guestCard, cardSchema)
	} else {
		fmt.Printf("The card '%s' is 'invalid' but has the '%s' schema.\n", guestCard, cardSchema)
	}
}

func exampleTwo() {
	// Example 2: Using a credit card instance.

	// The credit card wrapper performs normalization on the card number.
	creditCard, err := card.NewCreditCard("5105 1051 0510 5100")
	if err != nil {
		log.Fatalf("Error creating credit card: %v", err)
	}
	fmt.Printf("Credit card details: %v\n", creditCard)
}
