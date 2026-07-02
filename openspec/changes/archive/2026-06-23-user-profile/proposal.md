# Proposal: User Profile / Order History

## Intent

Give logged-in users a profile page where they can see their account info and order history. Currently there's no way to view past orders after checkout — users only see a confirmation once. The navbar also has no auth awareness: it shows "Iniciar sesión" regardless of session state.

## Scope

### In Scope
- `/perfil` page with user info section + order history table
- `getOrdersByUser()` query in `src/lib/orders.ts`
- Navbar auth awareness (profile link when logged in, "Iniciar sesión" when not)
- Auth guard — redirects unauthenticated users to `/login`
- Tests for new query and page

### Out of Scope
- Profile edit (phone, address fields)
- Profile photo upload
- Admin order management panel

## Capabilities

### New Capabilities
- `user-profile`: Profile page at `/perfil` with user info display and paginated order history listing linking to `/orden/[orderNumber]`

### Modified Capabilities
- `auth-core`: Navbar becomes auth-aware (profile link vs login link), auth guard redirect pattern for protected pages
- `design-system`: Navbar receives conditional profile/login rendering based on session state

## Approach

Server component at `app/perfil/page.tsx` calling `auth()` from NextAuth. Unauthenticated → `redirect("/login")`. Authenticated → fetch user with orders via new `getOrdersByUser()` query, render info card + orders table replicating the confirmation page display pattern (`formatPrice`, status badge, items summary).

Navbar: add `auth()` call, conditionally render profile link (user icon + name) or "Iniciar sesión". Reuse existing `User` icon from lucide-react.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/orders.ts` | New | `getOrdersByUser(userId)` query with pagination |
| `app/perfil/page.tsx` | New | Profile page — user info + order history |
| `components/navbar.tsx` | Modified | Auth-aware login/profile link |
| `app/perfil/loading.tsx` | New | Loading skeleton |
| `app/perfil/not-found.tsx` | New | (if needed) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Navbar becomes server component with `auth()` — could affect render timing | Low | Navbar already server component; `auth()` is lightweight JWT decode |

## Rollback Plan

`git revert` the merge commit. No schema changes — no migration needed.

## Dependencies

- Existing User + Order Prisma models (no schema changes)
- Existing `formatPrice`, status badge from order confirmation page
- NextAuth `auth()` function from `src/lib/auth.ts`

## Success Criteria

- [ ] `/perfil` shows user name, email, "Miembro desde" date
- [ ] `/perfil` lists recent orders with status, date, total
- [ ] Clicking order number navigates to `/orden/[orderNumber]`
- [ ] Unauthenticated users are redirected to `/login`
- [ ] Navbar shows profile link when signed in, "Iniciar sesión" when not
- [ ] `npm run build` succeeds with zero errors
