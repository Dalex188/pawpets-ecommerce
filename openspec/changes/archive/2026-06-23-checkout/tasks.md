# Tasks: Checkout & Order Management

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~450–500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Schema + lib (server) → PR 2: Pages + cart + tests |
| Delivery strategy | exception-ok (single PR, user approved) |
| Chain strategy | N/A — size:exception applied |

## Phase 1: Schema — Migration

- [x] 1.1 Add `OrderStatus` concept (`PENDING`, `CONFIRMED`, `CANCELLED`) — stored as String in schema (SQLite limitation)
- [x] 1.2 Replace `status String @default("PENDING")` with typed behavior (schema keeps String but application validates typed constants)
- [x] 1.3 Split `shippingAddress String?` → 6 required fields: `shippingName`, `shippingPhone`, `shippingProvince`, `shippingCity`, `shippingStreet`, `shippingZip`
- [x] 1.4 Add `orderNumber Int @unique` to Order (autoincrement generated in application code — SQLite limitation)
- [x] 1.5 Run `npx prisma db push` to apply migration

## Phase 2: Server Action + Lib

- [x] 2.1 Create `src/lib/actions/checkout.ts` — `createOrder(prevState, formData)` with session validation, manual input validation, DB price recalculation, stock check per item, atomic Prisma `$transaction` (create Order + OrderItems + decrement stock), return `{ orderNumber }` or `{ error }`
- [x] 2.2 Create `src/lib/orders.ts` — `getOrderByNumber(orderNumber)` fetches Order + items with ownership guard; returns `OrderDetail` or `null`

## Phase 3: Checkout Page

- [x] 3.1 Create `src/app/checkout/page.tsx` — client component; redirects to `/cart` if empty via useEffect; reads items from `useCartStore()`, renders order summary (name, qty, unit price, line total, grand total)
- [x] 3.2 Render shipping form (name, phone, province, city, street, zip) with client-side `required` attributes + server-side validation
- [x] 3.3 Wire submit → calls `createOrder` via `useTransition` (instead of `useActionState` for better client-side post-success flow), on success calls `clearCart()` + `router.push(/orden/${orderNumber})`, on error shows inline message preserving form data

## Phase 4: Confirmation Page

- [x] 4.1 Create `src/app/orden/[orderNumber]/page.tsx` — server component; calls `getOrderByNumber(Number(params.orderNumber))`
- [x] 4.2 Guard: `notFound()` if order is `null` (includes ownership check via getOrderByNumber)
- [x] 4.3 Render order number, status `PENDING`, creation date, shipping details, item list, total

## Phase 5: Cart Navigation

- [x] 5.1 In `src/app/cart/page.tsx`: replaced disabled button with `<Link href="/checkout">` when items exist
- [x] 5.2 Empty cart still shows the empty state with CTA to /productos (no checkout button shown)

## Phase 6: Testing

- [x] 6.1 Unit: `createOrder` validation errors (unauthenticated, empty cart, invalid JSON, missing shipping field), stock failure (product not found, insufficient stock), client price ignored
- [x] 6.2 Unit: `getOrderByNumber` — found, not-found, wrong-user, unauthenticated
- [x] 6.3 Integration: transactional atomicity — stock check + decrement inside same `$transaction` verified via mock
- [x] 6.4 Component: checkout page renders with mocked Zustand store items (order summary, shipping form, totals)
- [x] 6.5 Component: confirmation page renders order details with mocked `getOrderByNumber`, notFound() on null
