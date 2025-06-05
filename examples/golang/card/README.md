# Description

Your goal is to create two functions in Golang that verifies the correctness of a supplied credit card number and determine its card scheme. You can decide on the function's signature and types. It is mandatory that you add automated tests.

Create a work branch for yourself. Create a pull request to the `main` branch when your solution is complete.

## Function #1: Validity of the card number 

The following algorithm can be used to check validity of a card number:

1. Starting from the right, replace each **second** digit of the card number with its doubled value
2. When doubling a digit produces a 2-digit number (e.g 6 produces 12), then add those 2 digits (1+2 = 3)
3. Sum up all the digits

The card number is valid if the sum is divisible by 10

**Example**: Let's check if `5237 2516 2477 8133` is a valid credit card number.

1. Double each second digit: **10** 2 **6** 7 **4** 5 **2** 6 **4** 4 **14** 7 **16** 1 **6** 3
2. Add 2-digit numbers: **1** 2 6 7 4 5 2 6 4 4 **5** 7 **7** 1 6 3
3. Sum up all the digits: 70

70 is divisible by 10, so `5237 2516 2477 8133` is a **valid** credit card number

Please implement a function that given a credit card number returns if it is valid 

## Function #2: Known/supported card schemes

Card Scheme (Visa, MasterCard, JCB, etc) can be detected by the first digits of the card and the length of the card. 

**Example**

| Scheme           | Ranges           | Number of Digits | Example number   |
|---               |---               |---               |---
| American Express | 34,37            | 15               | 378282246310005  |
| JCB              | 3528-3589        | 16-19            | 3530111333300000 |
| Maestro          | 50, 56-58, 6     | 12-19            | 6759649826438453 |
| Visa             | 4                | 13,16,19         | 4012888888881881 |
| MasterCard       | 2221-2720, 51-55 | 16               | 5105105105105100 |


Please implement a function that given a credit card number returns its card scheme.
