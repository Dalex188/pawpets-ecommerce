# Tasks: Admin Panel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1800–2200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation + Layout → PR 2: Products CRUD → PR 3: Orders + Navbar → PR 4: Tests |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Admin foundation: queries, types, layout guard, sidebar, dashboard | PR 1 | Base: `main`; includes admin layout, sidebar, dashboard, queries; tests for queries + layout |
| 2 | Product CRUD: server actions + list/create/edit pages | PR 2 | Base: PR 1 branch; product queries, actions, 3 pages; component tests |
| 3 | Orders management: server action + list/detail pages + Navbar | PR 3 | Base: PR 2 branch; order queries, action, 2 pages, Navbar updates; component tests |
| 4 | Integration tests for all admin flows | PR 4 | Base: PR 3 branch; auth guard, product CRUD, order status flows |

## Phase 1: Foundation (Queries + Types)

- [x] 1.1 Create `src/lib/admin.ts` with `getProductsAdmin({ page, search, limit })` returning paginated products with category/subcategory names
- [x] 1.2 Add `getProductById(id: string)` to `src/lib/admin.ts` fetching by Prisma cuid with full relations
- [x] 1.3 Add `getCategoriesForSelect()` to `src/lib/admin.ts` returning `{ id, name }[]` for category dropdown
- [x] 1.4 Add `getSubcategoriesForSelect(categoryId)` to `src/lib/admin.ts` returning `{ id, name }[]` for subcategory dropdown
- [x] 1.5 Add `getAllOrders({ page, status, limit })` to `src/lib/admin.ts` — no ownership guard, includes user relation
- [x] 1.6 Add `getOrderDetailAdmin(orderId)` to `src/lib/admin.ts` — no ownership guard, includes items + product names + user
- [x] 1.7 Create `src/lib/actions/admin-products.ts` skeleton with `ActionResult` type export
- [x] 1.8 Create `src/lib/actions/admin-orders.ts` skeleton with `ActionResult` type export
- [x] 1.9 Unit tests: `src/__tests__/admin-queries.test.ts` — test getProductsAdmin search/pagination, getProductById notFound, getCategoriesForSelect, getAllOrders filter by status

## Phase 2: Server Actions (Product CRUD + Order Status)

- [ ] 2.1 Implement `createProduct(formData)` in `src/lib/actions/admin-products.ts` — auth check ADMIN, validate required fields, parse images JSON, unique slug check, create product, return `{ success: true, product }` or `{ success: false, error }`
- [ ] 2.2 Implement `updateProduct(id, formData)` in `src/lib/actions/admin-products.ts` — auth check ADMIN, validate, parse images JSON, unique slug (exclude current), update product, return result
- [ ] 2.3 Implement `deleteProduct(id)` in `src/lib/actions/admin-products.ts` — auth check ADMIN, check `orderItems` count > 0 → reject, else delete, return result
- [ ] 2.4 Implement `updateOrderStatus(orderId, status)` in `src/lib/actions/admin-orders.ts` — auth check ADMIN, validate transition PENDING → CONFIRMED|CANCELLED only, update order, return result
- [ ] 2.5 Unit tests: `src/__tests__/admin-products-actions.test.ts` — createProduct validation, duplicate slug, updateProduct, deleteProduct with/without orderItems
- [ ] 2.6 Unit tests: `src/__tests__/admin-orders-actions.test.ts` — updateOrderStatus valid/invalid transitions, non-admin rejection

## Phase 3: Admin Layout + Dashboard

- [x] 3.1 Create `src/app/admin/layout.tsx` — async RSC, `auth()` call, role check ADMIN, `redirect("/")` on fail, render `<AdminSidebar />` + children in `lg:pl-64`
- [x] 3.2 Create `src/components/admin/AdminSidebar.tsx` — RSC, fixed sidebar with links: Dashboard, Productos, Pedidos; highlight current route via `usePathname()`
- [x] 3.3 Create `src/app/admin/page.tsx` — Dashboard RSC: total products count, featured products count, pending orders count, total orders count, 5 recent orders with links to `/admin/orders/[id]`
- [x] 3.4 Component tests: `src/__tests__/admin-layout.test.tsx` — layout redirects non-admin, renders children for admin
- [x] 3.5 Component tests: `src/__tests__/admin-sidebar.test.tsx` — renders links, highlights active route
- [x] 3.6 Component tests: `src/__tests__/admin-dashboard.test.tsx` — renders counts, empty state, recent orders list

## Phase 4: Products CRUD Pages

- [ ] 4.1 Create `src/app/admin/products/page.tsx` — RSC table: image thumb, name, category, stock, price, actions (edit link + delete button); server-side search via `getProductsAdmin({ search })`; "Nuevo producto" button → `/admin/products/new`
- [ ] 4.2 Create `src/app/admin/products/new/page.tsx` — RSC form: name, slug, description, brand, price, stock, category select, subcategory select, images textarea (JSON), isFeatured checkbox; POST → `createProduct(formData)`; redirect on success
- [ ] 4.3 Create `src/app/admin/products/[id]/page.tsx` — RSC edit form pre-filled via `getProductById(id)`; `notFound()` if null; POST → `updateProduct(id, formData)`; redirect on success
- [ ] 4.4 Add delete confirmation modal to products list page (client component) calling `deleteProduct(id)`
- [ ] 4.5 Component tests: `src/__tests__/admin-products-list.test.tsx` — renders table, search, delete button, empty state
- [ ] 4.6 Component tests: `src/__tests__/admin-products-create.test.tsx` — form renders, validation, submit calls action
- [ ] 4.7 Component tests: `src/__tests__/admin-products-edit.test.tsx` — form pre-filled, update calls action, notFound for invalid id

## Phase 5: Orders Management Pages

- [ ] 5.1 Create `src/app/admin/orders/page.tsx` — RSC table: order number (link), customer name+email, date, total, status badge (PENDING=yellow, CONFIRMED=green, CANCELLED=red), filter by status dropdown; `getAllOrders({ status })`
- [ ] 5.2 Create `src/app/admin/orders/[id]/page.tsx` — RSC detail: order info, items table (image, name, qty, unit price, line total), shipping address, status badge, status select dropdown → `updateOrderStatus(id, status)`; `notFound()` if null
- [ ] 5.3 Component tests: `src/__tests__/admin-orders-list.test.tsx` — renders table, status filter, empty state, status badge colors
- [ ] 5.4 Component tests: `src/__tests__/admin-order-detail.test.tsx` — renders items, shipping, status dropdown, calls action on change, notFound

## Phase 6: Navbar Admin Link

- [ ] 6.1 Update `src/components/layout/Navbar.tsx` — add conditional "Panel Admin" link with icon when `session.user.role === "ADMIN"` (keep "Mi Perfil" for all authenticated)
- [ ] 6.2 Update `src/components/layout/NavbarMobile.tsx` — add conditional "Panel Admin" link in mobile menu when `isAuthenticated` and role is ADMIN (requires passing role from parent)
- [ ] 6.3 Update `Navbar.tsx` to pass `userRole` to `NavbarMobile` prop
- [ ] 6.4 Component tests: `src/__tests__/navbar-admin-link.test.tsx` — admin sees link, client does not, unauthenticated does not

## Phase 7: Integration Tests

- [ ] 7.1 Integration test: `src/__tests__/admin-auth-guard.test.tsx` — admin accesses `/admin`, client redirected to `/`, unauthenticated redirected to `/`
- [ ] 7.2 Integration test: `src/__tests__/admin-product-crud.test.tsx` — create product → appears in list → edit → update → delete (no orders) → removed; delete with orderItems → rejected
- [ ] 7.3 Integration test: `src/__tests__/admin-order-status.test.tsx` — admin views all orders → updates PENDING → CONFIRMED → reflects; non-admin calls action directly → 403/error

## Phase 8: Cleanup + Verification

- [ ] 8.1 Verify all admin routes accessible and functional end-to-end
- [ ] 8.2 Run full test suite (`pnpm test`) — all pass
- [ ] 8.3 Run type-check (`pnpm typecheck`) — no errors
- [ ] 8.4 Run lint (`pnpm lint`) — no errors