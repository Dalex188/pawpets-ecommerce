# Checkout Specification

## Purpose

Users complete purchases by reviewing their cart, entering shipping information, and creating an order. The system recalculates prices from the database, validates stock, creates Order + OrderItems in a transaction, decrements inventory, and shows a confirmation page.

## Requirements

### Requirement: Create Order Server Action

The system MUST provide a Server Action (`lib/actions/checkout.ts`) that accepts shipping fields. It MUST validate the user session — unauthenticated requests MUST fail with a redirect to login. It MUST recalculate all prices from the Product table (client prices MUST NOT be trusted). It MUST check stock for every item; if any item has insufficient stock, the entire order MUST fail with a message identifying the item. It MUST create the Order and OrderItems in a single Prisma transaction. On success, it MUST decrement stock for each product and return the generated `orderNumber`. The caller MUST call `clearCart` on success.

#### Scenario: Successful order creation

- GIVEN an authenticated user with 2 cart items (product A: stock 10, DB price 1500; product B: stock 5, DB price 800)
- WHEN the user submits the shipping form with valid fields
- THEN an Order with `status: PENDING`, `total: 2300`, and 2 OrderItems is created
- AND product A stock becomes 9, product B stock becomes 4
- AND the Server Action returns the `orderNumber`
- AND the Zustand cart is cleared

#### Scenario: Unauthenticated user

- GIVEN the user is not authenticated
- WHEN the Server Action is called
- THEN it returns an error redirecting to `/auth/login`
- AND no Order is created

#### Scenario: Insufficient stock fails the order

- GIVEN an authenticated user with product A (requested qty 5, actual stock 3)
- WHEN the user submits the shipping form
- THEN the Server Action returns an error: "Insufficient stock for {product name}"
- AND no Order is created
- AND stock for product A remains at 3

#### Scenario: Client price is ignored

- GIVEN an authenticated user with product A (DB price: 1500, client sends 100)
- WHEN the Server Action runs
- THEN the Order uses the DB price (1500)
- AND total reflects DB prices, not client-submitted values

### Requirement: Checkout Page

The `/checkout` route MUST be a client component. It MUST read cart items from the Zustand store. It MUST display an order summary: product name, quantity, unit price, line total per item, and a grand total. It MUST render a shipping form with fields: full name, phone, province, city, address, zip. On submit, it MUST call the Server Action. On success, it MUST clear the cart and redirect to `/orden/[orderNumber]`. On error, it MUST display the error message inline without losing form data.

#### Scenario: Checkout shows cart summary and shipping form

- GIVEN an authenticated user with 3 items in the Zustand cart
- WHEN the user navigates to `/checkout`
- THEN all 3 items display with correct quantities, unit prices, and line totals
- AND the shipping form shows 6 required fields
- AND the grand total matches the cart subtotal

#### Scenario: Empty cart redirects to /cart

- GIVEN the Zustand cart is empty
- WHEN the user navigates to `/checkout`
- THEN the page redirects to `/cart`

#### Scenario: Server error shows inline message

- GIVEN the user submits the form with valid data
- WHEN the Server Action returns an out-of-stock error
- THEN the error message is displayed on the checkout page
- AND the form data is preserved

### Requirement: Confirmation Page

The `/orden/[orderNumber]` route MUST be a server component. It MUST fetch the Order by `orderNumber`. It MUST display order number, status, creation date, shipping details, item list (name, qty, unit price, line total), and total. If the order is not found or does not belong to the current user, it MUST return a 404 via `notFound()`.

#### Scenario: Order found displays details

- GIVEN an authenticated user who just created order
- WHEN navigating to `/orden/1001`
- THEN the page shows order number "1001", status "PENDING", shipping info, items, and total

#### Scenario: Nonexistent order returns 404

- GIVEN an authenticated user
- WHEN navigating to `/orden/99999`
- THEN `notFound()` is triggered, displaying a 404 page

#### Scenario: Another user's order returns 404

- GIVEN an authenticated user (Alice)
- WHEN Alice navigates to `/orden/{orderNumber}` for an order belonging to Bob
- THEN the page returns 404
- AND Bob's order details are not exposed

### Requirement: Stock Decrement Integrity

Product stock MUST be decremented by the purchased quantity within the same transaction as Order creation. The stock check and decrement MUST be atomic — no other read should see stale stock between the check and the write.

#### Scenario: Race condition prevented

- GIVEN product A has stock 1 and two users simultaneously try to buy it
- WHEN both Server Actions run concurrently
- THEN exactly one Order succeeds with stock reaching 0
- AND the other Order fails with an insufficient stock error
