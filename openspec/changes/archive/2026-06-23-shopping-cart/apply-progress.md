# Apply Progress: Shopping Cart

**Batch**: All phases (1–4)
**Mode**: Strict TDD (Vitest v2.1.9)
**Size**: size:exception (user approved single PR)

## Completed Tasks

### Phase 1 — Cart Store Foundation
- [x] 1.1 Create `src/store/cart-store.ts` — Zustand v5 persist store with CartItem/CartState types, all actions (addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal)
- [x] 1.2 Create `src/store/index.ts` — barrel export

### Phase 2 — Client Components
- [x] 2.1 Create `src/components/cart/AddToCartButton.tsx` — "use client" with stock-aware behavior and visual confirmation
- [x] 2.2 Create `src/components/cart/CartBadge.tsx` — "use client" live count from store
- [x] 2.3 Create `src/components/cart/CartDrawer.tsx` — slide-over panel with items, quantity controls, subtotal, empty state

### Phase 3 — Integration Wiring
- [x] 3.1 Update `src/components/products/ProductInfo.tsx` — extended interface with id/slug/images, replaced button with AddToCartButton
- [x] 3.2 Update `src/components/layout/Navbar.tsx` — replaced hardcoded badge with CartPanel (CartBadge + CartDrawer)
- [x] 3.3 Update `src/app/productos/[slug]/page.tsx` — (no change needed, types already match)
- [x] 3.4 Create `src/app/cart/page.tsx` — full cart page with empty state, items, quantity controls

### Phase 4 — Testing & Build
- [x] 4.1 Store unit test — 15 tests covering all actions + computed values
- [x] 4.2 AddToCartButton test — 5 tests: render, click, disabled, stock-awareness, confirmation
- [x] 4.3 CartBadge test — 3 tests: empty count, populated count, clear updates
- [x] 4.4 Build — `next build` succeeds with zero TypeScript/lint errors

## TDD Cycle Evidence

| Task | Test File | Layer | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|-----|-------|-------------|----------|
| 1.1 + 4.1 | `cart-store.test.ts` | Unit | ✅ Written | ✅ Passed | ✅ 15 cases | ➖ None |
| 2.1 + 4.2 | `add-to-cart-button.test.tsx` | Unit | ✅ Written | ✅ Passed | ✅ 5 cases | ➖ None |
| 2.2 + 4.3 | `cart-badge.test.tsx` | Unit | ✅ Written | ✅ Passed | ✅ 3 cases | ➖ None |
| 2.3 | CartDrawer | N/A | N/A | ✅ Implemented | N/A | N/A |
| 3.1 | ProductInfo | N/A | N/A | ✅ Modified | N/A | N/A |
| 3.2 | Navbar | N/A | N/A | ✅ Modified | N/A | N/A |
| 3.4 | /cart page | N/A | N/A | ✅ Created | N/A | N/A |
| 4.4 | Build | Build | N/A | ✅ Passed | N/A | N/A |

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `src/store/cart-store.ts` | Created | Zustand persist store with localStorage |
| `src/store/index.ts` | Created | Barrel export |
| `src/components/cart/AddToCartButton.tsx` | Created | Client button with stock awareness |
| `src/components/cart/CartBadge.tsx` | Created | Live count badge |
| `src/components/cart/CartDrawer.tsx` | Created | Slide-over panel |
| `src/components/cart/CartPanel.tsx` | Created | Client wrapper for Navbar integration |
| `src/app/cart/page.tsx` | Created | Full cart page |
| `src/components/products/ProductInfo.tsx` | Modified | Extended interface + AddToCartButton |
| `src/components/layout/Navbar.tsx` | Modified | CartPanel integration |
| `src/__tests__/cart-store.test.ts` | Created | 15 store tests |
| `src/__tests__/add-to-cart-button.test.tsx` | Created | 5 button tests |
| `src/__tests__/cart-badge.test.tsx` | Created | 3 badge tests |
| `src/__tests__/setup.ts` | Created | jest-dom matchers |
| `vitest.config.ts` | Modified | jsdom environment + setup |
| `package.json` | Modified | Added test dependencies |

## Deviations from Design

1. **CartPanel wrapper**: Created `CartPanel.tsx` to manage drawer state since Navbar is a server component and cannot hold `useState`. The design specified wiring the drawer toggle directly in Navbar, but the wrapper is architecturally cleaner.

## Issues Found

- Vitest was configured with `environment: "node"` — changed to `jsdom` for React component tests
- `@testing-library/react` and `@testing-library/user-event` were not installed — added as dev dependencies
- The product detail page needed no changes — `getProductBySlug` already returns `id`, `slug`, `images`

## Remaining Tasks

None. All 13 tasks complete.

## Workload / PR Boundary

- **Mode**: size:exception (single PR)
- **Estimated review budget impact**: ~540 lines
