# Design: Admin Panel — PawPets

## Route Structure

```
src/app/admin/
├── layout.tsx                    ← Role guard + sidebar navigation
├── page.tsx                      ← Dashboard (summary cards + recent orders)
├── products/
│   ├── page.tsx                  ← Products table (list all, search, delete)
│   ├── new/
│   │   └── page.tsx              ← Create product form
│   └── [id]/
│       └── page.tsx              ← Edit product form
└── orders/
    ├── page.tsx                  ← Orders table (all, filter by status)
    └── [id]/
        └── page.tsx              ← Order detail + status update
```

## Admin Layout Guard (`src/app/admin/layout.tsx`)

Server component that wraps all `/admin/*` routes:

```tsx
export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="lg:pl-64 p-6">{children}</main>
    </div>
  );
}
```

- Calls `auth()` from `@/lib/auth`
- Checks `session.user.role === "ADMIN"`
- Redirects non-admins to `/`
- Provides consistent sidebar navigation for admin pages

## Admin Sidebar (`src/components/admin/AdminSidebar.tsx`)

Fixed sidebar on desktop, collapsible on mobile. Links:
- Dashboard (`/admin`)
- Productos (`/admin/products`)
- Pedidos (`/admin/orders`)

Highlights current route with `primary` background.

## Dashboard (`src/app/admin/page.tsx`)

Server component with summary cards:
- Total productos (count from `db.product.count()`)
- Productos destacados (count where `isFeatured: true`)
- Pedidos pendientes (count where `status: "PENDING"`)
- Pedidos totales (count)
- Lista de 5 pedidos más recientes con enlace a `/admin/orders/[id]`

## Products Section

### Products List (`/admin/products/page.tsx`)

Table with columns: Image (thumb), Nombre, Categoría, Stock, Precio, Acciones
- Server-side search via `getProducts({ search })`
- Delete action: button → confirmation modal → `deleteProduct(id)`
- Edit link: `/admin/products/[id]`
- "Nuevo producto" button → `/admin/products/new`

### Create Product (`/admin/products/new/page.tsx`)

Server component with form:
- Fields: name, slug, description, brand, price (number), stock (number), category (select from DB), subcategory (select), images (textarea: JSON array of URLs), isFeatured (checkbox)
- Server action: `createProduct(formData)`
- On success: redirect to `/admin/products`

### Edit Product (`/admin/products/[id]/page.tsx`)

Pre-filled form with existing product data. Same fields as create.
- Server action: `updateProduct(id, formData)`
- On success: redirect to `/admin/products`

### Delete Product

Server action: `deleteProduct(id)`
- Checks if product has `orderItems` (existing orders) → rejects with error if so
- Otherwise deletes product

## Product Server Actions (`src/lib/actions/admin-products.ts`)

```ts
export async function createProduct(formData: FormData): Promise<ActionResult>
export async function updateProduct(id: string, formData: FormData): Promise<ActionResult>
export async function deleteProduct(id: string): Promise<ActionResult>
```

- All check `session.user.role === "ADMIN"` at start
- Validation: required fields, price > 0, stock >= 0, unique slug
- Images: parse JSON from textarea, validate array of strings
- Returns `{ success: boolean, error?: string, product?: Product }`

## Products Queries (`src/lib/admin.ts`)

```ts
export async function getProductsAdmin(params: { page: number; search?: string; limit?: number })
export async function getProductById(id: string): Promise<ProductDetail | null>
export async function getCategoriesForSelect(): Promise<CategorySelect[]>
export async function getSubcategoriesForSelect(categoryId: string): Promise<SubcategorySelect[]>
```

## Orders Section

### Orders List (`/admin/orders/page.tsx`)

Table with columns: Pedido (#), Cliente (name + email), Fecha, Total, Estado, Acciones
- Filter by status (PENDING, CONFIRMED, CANCELLED)
- Server-side pagination
- Status badge with colors: PENDING=yellow, CONFIRMED=green, CANCELLED=red
- Click order number → `/admin/orders/[id]`

### Order Detail (`/admin/orders/[id]/page.tsx`)

- Order info: number, date, status, customer name/email, shipping address
- Items table: image, name, qty, unit price, line total
- Status dropdown (select): PENDING, CONFIRMED, CANCELLED
- On status change: calls `updateOrderStatus(id, newStatus)` server action
- Total with `formatPrice()`

## Order Server Actions & Queries

### `src/lib/actions/admin-orders.ts`

```ts
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult>
```
- Checks admin role
- Validates transition: PENDING → CONFIRMED | CANCELLED (no reverse for MVP)
- Returns updated order

### `src/lib/admin.ts` (orders section)

```ts
export async function getAllOrders(params: { page: number; status?: OrderStatus; limit?: number })
export async function getOrderDetailAdmin(orderId: string): Promise<OrderDetail | null>
```
- No ownership filter — admin sees all orders
- Includes items, user relation for customer info

## Navbar Update

Modify `src/components/layout/Navbar.tsx`:
- Call `auth()` to get session
- If `session.user.role === "ADMIN"`, add "Panel Admin" link to `/admin` (with icon)
- Keep existing "Mi Perfil" for all authenticated users
- Mobile navbar: same logic

## Security

- Every server action starts with:
  ```ts
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }
  ```
- Admin layout redirects non-admins
- Navbar only shows admin link for ADMIN role
- Server-side validation on all forms

## Component Reuse

- Table pattern from `src/app/perfil/page.tsx`
- Status badge from profile page (PENDING=yellow, CONFIRMED=green, CANCELLED=red)
- `formatPrice()` from `@/lib/utils`
- `cn()` from `@/lib/utils`
- Form input styling: existing patterns

## File Summary

| File | Type | Purpose |
|------|------|---------|
| `src/app/admin/layout.tsx` | RSC | Role guard + sidebar |
| `src/app/admin/page.tsx` | RSC | Dashboard |
| `src/app/admin/products/page.tsx` | RSC | Products list |
| `src/app/admin/products/new/page.tsx` | RSC | Create form |
| `src/app/admin/products/[id]/page.tsx` | RSC | Edit form |
| `src/app/admin/orders/page.tsx` | RSC | Orders list |
| `src/app/admin/orders/[id]/page.tsx` | RSC | Order detail + status |
| `src/lib/actions/admin-products.ts` | Server Actions | Product CRUD |
| `src/lib/actions/admin-orders.ts` | Server Action | Order status update |
| `src/lib/admin.ts` | Queries | Admin-scoped data fetching |
| `src/components/admin/AdminSidebar.tsx` | RSC | Navigation sidebar |
| `src/components/layout/Navbar.tsx` | Modified | Admin link conditional |
| `src/components/layout/NavbarMobile.tsx` | Modified | Admin link conditional |