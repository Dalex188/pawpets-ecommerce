# Proposal: Shopping Cart

## Intent

Add a client-side shopping cart so users can add products, see the badge count, and review selections before checkout. Currently the "Agregar al carrito" button renders but does nothing, and the navbar badge is hardcoded to `0`.

## Scope

### In Scope
- Zustand persist store with localStorage
- AddToCartButton client component replacing the inert server button
- CartBadge component replacing hardcoded `0` in Navbar
- CartDrawer component (optional slide-over)
- Full cart page at `/cart`

### Out of Scope
- Server-side cart persistence (guest → user migration deferred)
- Coupon/discount logic
- Stock reservation or real-time validation
- Checkout flow (next change)

## Capabilities

### New Capabilities
- `cart-store`: Zustand store with persist middleware — manages items (product id, slug, name, price, image, quantity), exposes add/remove/update/total actions, hydrates from localStorage

### Modified Capabilities
- None at canonical spec level (data-schema, auth-core, design-system, etc. are untouched). The product-detail delta spec will be updated when its parent change (product-catalog) is resumed.

## Approach

Client-only via Zustand v5 `persist` middleware to localStorage. No Prisma changes for MVP. Checkout phase will read the store and create Order + OrderItem in a Prisma transaction. Guest cart stays local entirely — no auth required.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/store/cart-store.ts` | New | Zustand store with persist |
| `src/components/cart/AddToCartButton.tsx` | New | Client "Add to cart" button |
| `src/components/cart/CartBadge.tsx` | New | Live count badge |
| `src/components/cart/CartDrawer.tsx` | New | Optional slide-over drawer |
| `src/app/cart/page.tsx` | New | Full cart review page |
| `src/components/products/ProductInfo.tsx` | Modified | Extend interface (id, slug), replace button with AddToCartButton |
| `src/components/layout/Navbar.tsx` | Modified | Replace hardcoded badge with CartBadge |
| `src/app/productos/[slug]/page.tsx` | Modified | Pass id/slug to ProductInfo |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Zustand persist version skew on schema change | Low | Version key in persist config; auto-clear on mismatch |
| localStorage disabled or quota exceeded | Low | Wrap hydration in try/catch, fall back to empty cart |

## Rollback Plan

1. `git checkout -- src/components/products/ProductInfo.tsx src/components/layout/Navbar.tsx src/app/productos/[slug]/page.tsx`
2. Delete new files: `Remove-Item -Recurse src/store/cart src/components/cart src/app/cart`
3. Button goes back to inert state, badge to hardcoded `0`

## Dependencies

- Zustand v5 (already installed — no install needed)

## Success Criteria

- [ ] AddToCartButton persists product to Zustand store on click
- [ ] Navbar badge reflects real-time item count from store
- [ ] `/cart` page lists all items with quantity controls
- [ ] Cart survives page reload (localStorage hydration)
- [ ] `next build` succeeds with no TypeScript errors
