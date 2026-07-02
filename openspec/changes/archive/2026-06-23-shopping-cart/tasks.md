# Tasks: Shopping Cart

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~540 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Store + Badge → PR 2: AddToCart → PR 3: Drawer + /cart |
| Delivery strategy | ask-always |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Store foundation + live badge | PR 1 (main) | Store, CartBadge, Navbar wiring |
| 2 | Add-to-cart button | PR 2 (main) | AddToCartButton, ProductInfo extension |
| 3 | Drawer + full cart page | PR 3 (main) | CartDrawer, /cart page, quantity controls |

## Phase 1: Foundation — Cart Store

- [x] 1.1 Create `src/store/cart-store.ts` with Zustand v5 persist — `CartItem`/`CartState` types, actions (`addItem`, `removeItem`, `updateQuantity`, `clearCart`), computed (`totalItems`, `subtotal`)
- [x] 1.2 Configure persist key `pawpets-cart` v1, `partialize` serializable fields, try/catch hydration fallback, `onRehydrateStorage` for version migration

## Phase 2: Client Components

- [x] 2.1 Create `src/components/cart/AddToCartButton.tsx` — "use client" button, calls `addItem` on click, disabled when `stock === 0`, visual confirmation on success
- [x] 2.2 Create `src/components/cart/CartBadge.tsx` — "use client" badge subscribing to `totalItems`, shows live count
- [x] 2.3 Create `src/components/cart/CartDrawer.tsx` — slide-over panel (Tailwind translate/transition), item list, subtotal, link to `/cart`

## Phase 3: Integration

- [x] 3.1 Create `src/app/cart/page.tsx` — full cart page client component: item rows with image/name/price/quantity(+/-)/line total/remove button, subtotal, disabled "Proceder al pago" when empty, empty state CTA
- [x] 3.2 Modify `src/components/products/ProductInfo.tsx` — add `id`, `slug`, `images` to `ProductInfoProduct` interface, replace inert `<button>` with `<AddToCartButton>` passing parsed props
- [x] 3.3 Modify `src/components/layout/Navbar.tsx` — replace hardcoded `<span>0</span>` with `<CartBadge />`, wire trigger to toggle CartDrawer

## Phase 4: Testing & Build

- [x] 4.1 Unit: 15 tests covering addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal
- [x] 4.2 Unit: store persist configured with version key + createJSONStorage (try/catch via Zustand)
- [x] 4.3 Integration: 5 AddToCartButton tests + 3 CartBadge tests with store interaction
- [x] 4.4 `next build` succeeds with zero TypeScript/lint errors
