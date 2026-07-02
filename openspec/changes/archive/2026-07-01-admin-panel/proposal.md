# Proposal: Admin Panel

## Intent

Admins currently have no way to manage products or orders — role exists in the model but zero admin routes. Give staff a dedicated panel to handle catalog operations and order fulfillment without touching the database directly.

## Scope

### In Scope
- `/admin` layout with ADMIN role guard (auth() + role check)
- Dashboard page with entity counts
- Product CRUD: list, create, edit, soft-delete
- Order management: list all, view detail, update status
- Navbar conditional admin link for ADMIN users
- Server actions for product CRUD + order status update
- Admin-scoped queries (no ownership guard on orders)

### Out of Scope
- User management (CRUD for users)
- File/image upload (URL input for MVP)
- Analytics/charts
- Email notifications
- Activity logs
- Pagination on lists (search/filter instead)

## Capabilities

### New Capabilities
- `admin-core`: Admin layout with role guard, dashboard, navbar link
- `admin-products`: Product CRUD (list, create, edit, delete)
- `admin-orders`: Order list, detail view, status update

### Modified Capabilities
None — all admin behavior is additive, existing specs unchanged.

## Approach

- **Guard**: Layout calls `auth()`, checks `session.user.role === "ADMIN"`, redirects to `/` if unauthorized
- **Product ID**: Use Prisma `cuid` (not slug) for admin routes
- **Images**: Textarea accepting JSON array of URLs (matches existing schema)
- **Order status**: Dropdown/select triggers server action to update
- **Navbar**: `session.user.role === "ADMIN"` renders link to `/admin`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/admin/layout.tsx` | New | Role-guarded admin layout |
| `src/app/admin/page.tsx` | New | Dashboard with counts |
| `src/app/admin/productos/` | New | Product CRUD pages |
| `src/app/admin/ordenes/` | New | Order management pages |
| `src/lib/actions/admin/` | New | Server actions |
| `src/lib/admin/` | New | Admin queries |
| `src/components/layout/Navbar.tsx` | Modified | Admin link condition |
| `prisma/schema.prisma` | None | Already has role + needed enums |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Role guard bypass | Low | Server-side check in layout + actions re-verify role |
| Data corruption via delete | Low | Soft-delete pattern (isActive flag) |
| Order status race conditions | Low | Single updater, no concurrent admin usage in MVP |

## Rollback Plan

Remove `openspec/changes/admin-panel/` folder, revert changes to `Navbar.tsx`, revert any schema additions. No data migration needed — all new tables/columns use additive schema changes.

## Dependencies

- Admin user seeded (already exists: admin@pawpets.com)
- Role already in JWT/session callbacks (already wired)

## Success Criteria

- [ ] Admin can log in and see dashboard with entity counts
- [ ] Admin can create, edit, view, and delete products
- [ ] Admin can list all orders and update their status
- [ ] CLIENT users cannot access `/admin` (redirected)
- [ ] Navbar shows admin link only for ADMIN users
