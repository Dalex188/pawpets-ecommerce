# Tasks: User Profile / Order History

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Query + Tests → PR 2: Page + Navbar + Login |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Query layer + tests | PR 1 | Base = main. `getOrdersByUser()` + unit tests. Standalone — nothing depends on UI. |
| 2 | Profile page + Navbar + login page | PR 2 | Base = main. Depends on PR 1's query fn. Page component, Navbar auth, `/login` route. |

## Phase 1: Query Layer

- [x] 1.1 Add `OrderSummary` interface and `getOrdersByUser()` to `src/lib/orders.ts` — fetch user with orders include, map to `itemCount` + `OrderSummary[]`, sorted by `createdAt` desc
- [x] 1.2 Write `src/__tests__/get-orders-by-user.test.ts` — mock auth + db, test: returns orders with itemCount, empty array for no orders, null when unauthenticated

## Phase 2: Profile Page

- [x] 2.1 Create `src/app/perfil/page.tsx` — async server component, `auth()` guard redirecting to `/login`, fetch user + `getOrdersByUser()`
- [x] 2.2 Create `src/app/perfil/loading.tsx` — centered spinner/skeleton matching page layout
- [x] 2.3 Render user info section: name, email, "Miembro desde" formatted date from `user.createdAt`
- [x] 2.4 Render order history table: linked order number, date, item count, status badge with PENDING=yellow/CONFIRMED=green/CANCELLED=red colors, formatted total via `formatPrice`
- [x] 2.5 Render empty state when no orders: "Todavía no tenés órdenes" message + "Ver productos" CTA linking to `/productos`

## Phase 3: Navbar Auth Awareness

- [x] 3.1 Convert `Navbar` to async, add `auth()` call, conditionally render profile link (`/perfil` with user icon) when authenticated, keep "Iniciar sesión" when not

## Phase 4: Login Page

- [x] 4.1 Create `src/app/login/page.tsx` — sign-in form or redirect trigger matching the existing auth config (`pages.signIn: "/login"`)

## Phase 5: Testing

- [x] 5.1 Write `src/__tests__/profile-page.test.tsx` — mock auth + `getOrdersByUser`, test: user info renders, table renders with orders, empty state shows CTA, unauthenticated redirects to `/login`
- [x] 5.2 Write Navbar auth tests — mock `auth()` returning session vs null, assert profile link href vs login link href
