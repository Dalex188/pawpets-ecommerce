# Delta for shopping-cart

## MODIFIED Requirements

### Requirement: Checkout Preparation

The store MUST compute `subtotal` (sum of `price * quantity` for all items). The `/cart` page MUST display this value formatted as currency. The "Proceder al pago" button SHOULD navigate to `/checkout`. The button MUST be disabled with a note when the cart is empty.

(Previously: Checkout was deferred to a future change; the "Proceder al pago" button had no navigation and was always disabled)

#### Scenario: Subtotal calculation

- GIVEN the cart has item A (price 1000, qty 2) and item B (price 500, qty 3)
- WHEN computing subtotal
- THEN subtotal equals 3500

#### Scenario: Checkout button navigates to /checkout

- GIVEN the cart has at least one item
- WHEN the user clicks "Proceder al pago"
- THEN the user is navigated to `/checkout`

#### Scenario: Checkout button disabled for empty cart

- GIVEN the cart is empty
- WHEN the user views `/cart`
- THEN the "Proceder al pago" button is disabled with a note
