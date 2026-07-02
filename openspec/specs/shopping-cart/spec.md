# Shopping Cart Specification

## Purpose

Client-side shopping cart that persists in localStorage via Zustand v5. Users add products, see a live badge count, manage quantities on a `/cart` page, and prepare for checkout. No server-side persistence for MVP — the cart works without authentication.

## Requirements

### Requirement: Cart Store

The system MUST provide a Zustand v5 store with `persist` middleware backed by localStorage. The store MUST hold an array of cart items — each with `productId`, `slug`, `name`, `price`, `image`, `quantity` — and expose `addItem`, `removeItem`, `updateQuantity`, `clearCart`, and computed `totalItems` / `subtotal`. The store MUST hydrate from localStorage on mount. If localStorage is unavailable or hydration fails, the store MUST fall back to an empty cart.

#### Scenario: Add item to empty cart

- GIVEN the cart is empty
- WHEN `addItem({ productId: 1, slug: "dog-food", name: "Dog Food", price: 1500, image: "/img.jpg" })` is called
- THEN the store contains one item with quantity 1

#### Scenario: Hydrate cart from localStorage

- GIVEN localStorage has a saved cart with 2 items
- WHEN the store hydrates on mount
- THEN `totalItems` equals 2

#### Scenario: Fallback on localStorage failure

- GIVEN localStorage is disabled in the browser
- WHEN the store attempts to hydrate
- THEN the store initializes with an empty array and no error is thrown

### Requirement: Add to Cart Button

A client component (`AddToCartButton`) MUST replace the inert `<button>` inside `ProductInfo`. It MUST accept `productId`, `slug`, `name`, `price`, and `image` as props. On click, it MUST call `addItem` on the cart store. The button MUST be disabled when `stock` is 0 (reusing the existing `inStock` logic). A visual confirmation (brief color change or toast) SHOULD appear on success.

#### Scenario: Add in-stock product

- GIVEN a product with stock > 0 is displayed on the product detail page
- WHEN the user clicks "Agregar al carrito"
- THEN the product is added to the cart store with quantity 1
- AND the button shows a brief visual confirmation

#### Scenario: Out-of-stock product

- GIVEN a product with stock === 0
- WHEN the user clicks the button
- THEN nothing is added to the cart store

### Requirement: Cart Badge

A client component (`CartBadge`) MUST replace the hardcoded `<span>0</span>` inside the Navbar cart icon. It MUST subscribe to `cartStore.totalItems` and display the current count. The badge MUST update in real-time as items are added or removed. When `totalItems` is 0, the badge SHOULD remain visible with a `0` value.

#### Scenario: Badge reflects item count

- GIVEN the cart has 3 items
- WHEN CartBadge renders
- THEN it displays "3"

#### Scenario: Badge updates after remove

- GIVEN the cart has 2 items and CartBadge displays "2"
- WHEN all items are removed via `clearCart`
- THEN CartBadge displays "0"

### Requirement: Cart Page

The system MUST provide a `/cart` route. The page MUST display a list of cart items with product image, name, unit price, quantity controls, line subtotal, and a remove button. Below the list, it MUST show the cart subtotal total and a "Proceder al pago" button. The page MUST be a client component that reads from the cart store.

#### Scenario: Cart page shows items

- GIVEN the cart has 3 items with varying quantities
- WHEN the user navigates to `/cart`
- THEN all items are displayed with correct quantities and line subtotals
- AND the total subtotal equals the sum of all line subtotals

### Requirement: Quantity Management

Each cart item MUST expose increase (+) and decrease (-) buttons and a remove (🗑) button. Decreasing below 1 MUST remove the item from the cart. Quantity MUST NOT exceed 99 per item. The store and UI MUST update synchronously.

#### Scenario: Increase quantity

- GIVEN an item in the cart with quantity 1
- WHEN the user clicks "+"
- THEN the quantity becomes 2

#### Scenario: Decrease to zero removes item

- GIVEN an item in the cart with quantity 1
- WHEN the user clicks "-"
- THEN the item is removed from the cart

### Requirement: Empty Cart State

When the cart has zero items, the `/cart` page MUST render an empty state with a friendly message and a "Ver productos" link to `/productos`. The Navbar badge MUST show `0`.

#### Scenario: Empty cart renders CTA

- GIVEN the cart is empty
- WHEN the user navigates to `/cart`
- THEN the page displays an empty state message and a link to `/productos`

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
