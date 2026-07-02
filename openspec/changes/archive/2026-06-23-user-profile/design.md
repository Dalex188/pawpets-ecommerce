# Design: User Profile / Order History

## Technical Approach

Server component at `app/perfil/page.tsx` that calls `auth()` from NextAuth — no session leaks to the client. Unauthenticated → `redirect("/login")`. Authenticated → fetch user with orders via new `getOrdersByUser(userId)` query, render info card + order table. Navbar calls `auth()` to toggle profile link vs login button. Reuses existing `formatPrice`, status badge pattern from `/orden/[orderNumber]`. Zero schema changes.

## Architecture Decisions

### Decision: Server component with auth guard
| Option | Tradeoff |
|--------|----------|
| Client component with `useSession()` | Extra JS bundle, flash-of-login, needs loading state |
| **Server component with `auth()`** | **Zero JS, no flash, redirect before render** |
| Middleware guard | Runs on EVERY request — too broad for a single route |

**Choice**: Server component guard — same pattern as existing `/orden/[orderNumber]`.

### Decision: Navbar auth via direct `auth()` call
| Option | Tradeoff |
|--------|----------|
| `useSession()` in client | Forces Navbar into client component — more JS, layout shift |
| **`auth()` in server component** | **Same bundle size, no layout shift, SSR-safe** |
| API route returning session | Extra network hop, latency on every navigation |

**Choice**: Navbar already a server component — add `auth()` call, conditionally render the profile/login link. Navbar becomes `async`.

### Decision: Status badge — inline vs component
| Option | Tradeoff |
|--------|----------|
| **Inline styled `<span>`** | **Already proven in `/orden/[orderNumber]`, zero abstraction overhead** |
| `<OrderStatusBadge>` component | Premature extraction for 2 call sites |

**Choice**: Inline for MVP. Extract to component later if a 3rd usage appears.

## Data Flow

```
Request /perfil
    │
    ▼
app/perfil/page.tsx (async server component)
    │
    ├── auth()
    │   ├── null → redirect("/login")
    │   └── session → continue
    │
    ├── getOrdersByUser(session.user.id)
    │   │
    │   └── Prisma: User.findUnique({ where: { id }, include: { orders: { ... } } })
    │
    └── Render:
        ├── UserInfoCard (name, email, "Miembro desde")
        └── OrderTable (rows with linked orderNumber, date, items count, status badge, total)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/perfil/page.tsx` | Create | Profile page — auth guard, user info + order history |
| `src/app/perfil/loading.tsx` | Create | Loading skeleton (spinner or skeleton card) |
| `src/lib/orders.ts` | Modify | Add `getOrdersByUser(userId)` with pagination |
| `src/components/layout/Navbar.tsx` | Modify | Add `auth()` call, conditional profile/login link |
| `src/__tests__/get-orders-by-user.test.ts` | Create | Query tests — empty, with orders, auth guard |
| `src/__tests__/profile-page.test.tsx` | Create | Page render tests — user info, table, empty state, redirect |

## Interfaces / Contracts

```typescript
// Added to src/lib/orders.ts

export interface OrderSummary {
  orderNumber: number;
  status: string;
  total: number;
  createdAt: Date;
  itemCount: number;
}

/**
 * Fetch all orders for a given user, sorted by newest first.
 * Returns empty array for users with no orders.
 * Does NOT check ownership — caller is responsible for auth guard.
 */
export async function getOrdersByUser(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<OrderSummary[]>
```

Return shape for the page (composed, not exported):

```typescript
interface ProfilePageData {
  user: { name: string | null; email: string; createdAt: Date };
  orders: OrderSummary[];
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getOrdersByUser()` with orders, empty, invalid userId | Mock `db.user.findUnique` + `auth()`, same pattern as `get-order-by-number.test.ts` |
| Unit | Auth guard — null session redirects | Mock `auth()` returning null, assert `redirect("/login")` called |
| Render | Profile page: user info renders, table renders with data | Mock `getOrdersByUser()`, render with `@testing-library/react` |
| Render | Empty state: "Todavía no tenés órdenes" + CTA | Mock `getOrdersByUser()` returning `[]` |
| Render | Navbar: profile link when auth, login link when not | Mock `auth()` both states, assert link hrefs |

## Migration / Rollout

No migration required. Zero schema changes. Deploy as part of normal PR cycle.

## Open Questions

- [ ] Confirm whether Navbar `auth()` call + async conversion could affect layout rendering timing (low risk per proposal)
