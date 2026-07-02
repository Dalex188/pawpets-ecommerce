# Design: Checkout / Order Management

## Technical Approach

Server Action (`lib/actions/checkout.ts`) handles order creation with DB-price recalculation, stock validation, and transactional Order+OrderItems creation. Three new route components, two new lib modules, one schema migration. Client cart (Zustand) is cleared post-success. Confirmation page is a server component with ownership guard.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Server Action vs API route | Actions integrate with `useActionState`, share `auth()` context directly; API routes require manual fetch + error handling | **Server Action** — idiomatic App Router, less ceremony |
| `orderNumber` as autoincrement Int vs cuid | cuid: format mismatch for user-facing number. autoincrement: sequential, human-readable, no extra code | **Int @default(autoincrement())** — simpler, user-friendly |
| Shipping fields nullable vs required | Nullable `String?` implies optional address data; required enforces presence at DB level | **Required String** — form validates on both ends |
| OrderStatus values | Proposal had 5 values (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED) | **3 values per spec**: PENDING, CONFIRMED, CANCELLED — MVP scope |
| Transaction writes | Separate writes risk race condition between order and stock decrement | **Single `$transaction`** — atomic check+decrement |
| clearCart responsibility | Server Action can't clear Zustand localStorage | **Client-side** after successful Server Action returns |

## Data Flow

```
User at /cart → clicks "Proceder al pago"
       │
       ▼
/checkout (client component)
  │  reads items from useCartStore()
  │  renders order summary + shipping form
  │
  ▼  form submit → createOrder(shippingData)
┌──────────────────────────────────────────┐
│  Server Action: lib/actions/checkout.ts   │
│                                          │
│  1. auth() → get session (fail → /login) │
│  2. Validate shipping fields             │
│  3. For each cart item:                  │
│     a. SELECT product (price, stock)     │
│     b. Fail if stock < qty → user error  │
│  4. db.$transaction([                    │
│     a. CREATE Order (userId, total,      │
│        status: PENDING, shipping fields) │
│     b. CREATE OrderItems (n)             │
│     c. UPDATE Product.stock (n)          │
│   ])                                     │
│  5. Return { orderNumber }               │
└──────────────────────────────────────────┘
       │
       ▼  success
clearCart() + router.push(`/orden/${orderNumber}`)
       │
       ▼
/orden/[orderNumber] (server component)
  auth() → fetch order by number
  userId check → notFound() if mismatch
  render: number, status, shipping, items, total
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add OrderStatus enum (PENDING, CONFIRMED, CANCELLED); replace `status String` → `status OrderStatus @default(PENDING)`; split `shippingAddress String?` → 6 required String fields; add `orderNumber Int @unique @default(autoincrement())` |
| `src/lib/actions/checkout.ts` | Create | Server Action — `createOrder(formData)` with validation, stock check, transaction |
| `src/lib/orders.ts` | Create | Query module — `getOrderByNumber(orderNumber)` for confirmation page |
| `src/app/checkout/page.tsx` | Create | Client component — cart summary, shipping form, Server Action call, error display |
| `src/app/orden/[orderNumber]/page.tsx` | Create | Server component — order confirmation with ownership guard |
| `src/app/cart/page.tsx` | Modify | Enable checkout button: `disabled → false`, replace with `<Link href="/checkout">` |
| `prisma/migrations/` | Create | Auto-generated migration (via `prisma db push` or `prisma migrate dev`) |

## Interfaces / Contracts

```typescript
// lib/actions/checkout.ts — Server Action
"use server";

export interface CreateOrderInput {
  shippingName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingCity: string;
  shippingStreet: string;
  shippingZip: string;
}

// Returns orderNumber on success, error string on failure
export async function createOrder(
  prevState: unknown,
  formData: FormData,
): Promise<{ orderNumber?: number; error?: string }>
```

```typescript
// lib/orders.ts — server-only queries
export async function getOrderByNumber(
  orderNumber: number,
): Promise<OrderDetail | null>

export interface OrderDetail {
  orderNumber: number;
  status: string;
  total: number;
  createdAt: Date;
  shippingName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingCity: string;
  shippingStreet: string;
  shippingZip: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }[];
}
```

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | createOrder validation, auth check, stock failure | Mock Prisma + auth, test each error path |
| Integration | Transaction atomicity, price recalculation | Test DB (`prisma db push` to temp) — verify stock decrements, stale client prices ignored |
| E2E | Full happy path: login → add to cart → checkout → confirmation | Playwright — verify order shows on /orden/N, cart is empty |
| Edge | Empty cart redirect, nonexistent order 404, wrong user's order 404 | Unit + E2E for each |

## Migration / Rollout

**No data migration required**. `npx prisma db push` handles schema changes:
- `status`: existing String values coerce to `PENDING` (SQLite flexible typing)
- `shippingAddress`: column dropped, 6 new columns added as empty strings for existing rows
- `orderNumber`: autoincrement assigns sequential values to existing rows

**Rollback**: `git checkout prisma/schema.prisma` + `npx prisma db push`. Delete new directories.

## Open Questions

None — all decisions resolved in proposal + specs.
