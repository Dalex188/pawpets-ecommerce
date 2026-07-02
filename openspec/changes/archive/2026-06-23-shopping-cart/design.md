# Design: Shopping Cart

## Technical Approach

Client-side shopping cart using Zustand v5 `persist` middleware to localStorage. Server components render thin "use client" wrappers that hydrate from the store. Cart data is never sent to the server until the checkout phase (next change), which will read the store and create `Order` + `OrderItem` records in a Prisma transaction.

The pattern: **server component owns the layout → renders a client component → client component owns the store interaction**. This keeps server components safe (no `useState`/`useEffect`) while the cart feels instant.

## Architecture Decisions

### Decision: Zustand persist key & versioning

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single key without version | Old schema corrupts on future changes | Store key: `pawpets-cart`, version `1` in `persist` config |
| Multiple keys per user | Overkill for guest-only MVP | On version mismatch, `migrate` or `onRehydrateStorage` clears silently |

**Rationale**: Version key + `partialize` (whitelist only serializable fields) prevents schema skew. If we add fields later, bumping the version auto-clears stale carts — safer than migration for MVP.

### Decision: ProductInfo interface extension

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add `id` + `slug` + `images` to existing interface | Minimal diff, but `images` string stays opaque | Add `id`, `slug`, and `images` as `string` to `ProductInfoProduct` |
| Create a separate `CartProduct` type | More abstract, but extra indirection for MVP | **Chosen** — keep it in a single interface |
| Spread entire Prisma return type | Tight coupling to DB schema | Rejected — explicit fields are cleaner |

**Rationale**: `getProductBySlug` already returns `id`, `slug`, and `images` (the full Prisma result). The interface just wasn't declaring them. Adding them is the smallest diff. `ProductInfo` passes them down to `AddToCartButton` as props — no store calls from server land.

### Decision: CartDrawer vs full cart page

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Only `/cart` page | Fast to build, but no quick peek | **Both** — drawer for glance, `/cart` for full management |
| Only persistent drawer | Less navigation, but awkward for complex edits | Rejected — quantity controls need space |

**Rationale**: The drawer is a slide-over (no route change) for quick "what's in there". The cart page at `/cart` is a full route with row-based quantity controls, line totals, and a "Proceed to checkout" button (wired in the next change).

### Decision: Image handling in cart items

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Store parsed URL in cart item | Redundant parsing each render | **Chosen** — parse once on add, store the first image URL |
| Store raw JSON string, parse on render | Always up-to-date with product | Rejected — cart is client-only; product data is static snapshot |

**Rationale**: Prisma stores `images` as a JSON string like `["/img1.jpg","/img2.jpg"]`. When adding to cart, the component parses it and stores `image: "/img1.jpg"`. If the product images change server-side, the cart still shows the image at time-of-add (acceptable for MVP).

## Data Flow

```
ProductDetailPage (server)
  │
  ├── getProductBySlug → returns { id, slug, images, price, name, ... }
  │
  └── <ProductInfo product={product} />
        │
        └── <AddToCartButton
              productId={id}
              slug={slug}
              name={name}
              price={Number(price)}
              image={JSON.parse(images)[0]}
            />
              │
              └── onClick → cartStore.addItem({ id, slug, name, price, image, quantity: 1 })

Navbar (server)
  │
  └── <CartBadge />
        │
        └── useCartStore(state => state.totalItems()) → live count
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/store/cart-store.ts` | Create | Zustand v5 store with persist middleware. Types: `CartItem`, `CartState`. Actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`. Computed: `totalItems`, `subtotal`. |
| `src/components/cart/AddToCartButton.tsx` | Create | "use client" button. Reads `useCartStore().addItem`. Accepts `productId`, `slug`, `name`, `price`, `image`. Disabled when `stock === 0` (passed from parent). |
| `src/components/cart/CartBadge.tsx` | Create | "use client" span. Reads `useCartStore().totalItems()`. Renders count or hides at 0. |
| `src/components/cart/CartDrawer.tsx` | Create | Slide-over panel (Tailwind translate + transition). Lists items, shows subtotal, links to `/cart`. Opens from `CartBadge` click. |
| `src/app/cart/page.tsx` | Create | Full cart page. Reads `useCartStore()`. Table with image, name, quantity +/- , line total, remove. Empty state. |
| `src/components/products/ProductInfo.tsx` | Modify | Add `id`, `slug`, `images` to `ProductInfoProduct` interface. Replace raw `<button>` with `<AddToCartButton>`. |
| `src/components/layout/Navbar.tsx` | Modify | Replace hardcoded `<span>0</span>` with `<CartBadge />`. Wire button to toggle `CartDrawer`. |
| `src/app/productos/[slug]/page.tsx` | Modify | No change needed — `getProductBySlug` already returns `id`, `slug`, `images`. The interface extension in `ProductInfo.tsx` is sufficient. |

## Interfaces / Contracts

```typescript
// src/store/cart-store.ts

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;        // Decimal → Number (same pattern as getProductBySlug)
  image: string;         // first URL from images JSON
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Store actions (add, remove, update, clear) | Vitest — create store instance, call actions, assert state |
| Unit | Persist hydration | Vitest — mock localStorage, set/get, verify rehydration |
| Integration | AddToCartButton click → store update | Vitest + jsdom — render button, simulate click, assert store |
| Integration | CartBadge renders correct count | Vitest + jsdom — render with mocked store |
| Build | TypeScript compilation | `tsc --noEmit` — no errors across new files |

## Migration / Rollout

No migration required. The cart is entirely client-side and does not touch the database. Existing users will see an empty cart on first visit — no data to migrate.

## Open Questions

- None — all decisions resolved on the proposal and codebase scan.
