# Design: Product Catalog for PawPets

## Technical Approach

Server Components with direct Prisma queries — no API routes. URL query params (`?categoria=`, `?subcategoria=`, `?q=`, `?sort=`, `?page=`) are the single source of truth for listing state. Client Components only for interactive widgets that update the URL. Data layer: `lib/products.ts` exports typed query functions consumed by Server Components.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Server/Client split | Listing page: Server. Filters/search/sort: Client `"use client"` | All client — wasteful; all server — interactivity impossible | Server Components stream HTML; small Client islands (`SearchBar`, `ProductFilters`, `ProductSorter`, `Pagination`) update URL via `useRouter().replace()`/`useSearchParams()` |
| Filter state | URL search params (`useSearchParams`) | React state + context + debounce | URL is naturally shareable, bookmarkable, back-button-safe. No client cache to sync. Each param change triggers a server re-render via Next.js suspense boundary |
| Pagination | Offset-based (`skip`/`take`, page=12) | Cursor pagination | Offset is simpler and directly maps to page numbers. Cursor advantages (stable under inserts) don't apply at MVP scale. Worst case: re-seat to cursor in Phase 2 |
| Search | Prisma `contains` + `mode: 'insensitive'` (maps to PG ILIKE) | PostgreSQL `tsvector` full-text search | ILIKE is sufficient for 60–70 products. Full-text search adds raw SQL complexity. Flagged in proposal for Phase 2 if needed |
| Price formatting | `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })` + ` (IVA incluido)` | Server-side string | No runtime cost. Pure function in `lib/utils.ts`. Consistent across listing and detail |

### Component Tree

```
/productos/page.tsx  (Server — reads searchParams, calls getProducts)
├── ProductFilters    (Client — sidebar, category/subcategory links)
├── Section: results
│   ├── SearchBar    (Client — form, navigates on submit)
│   ├── ProductSorter (Client — <select>, updates ?sort=)
│   ├── ProductGrid  (Server — iterates products)
│   │   └── ProductCard × N (Server — Link + image + price + badge)
│   └── Pagination   (Client — page numbers, prev/next)
└── loading.tsx      (Server — 6-card skeleton)
```

```
/productos/[slug]/page.tsx  (Server — generateMetadata + detail)
├── Breadcrumbs             (Server — schema.org BreadcrumbList)
├── ProductGallery          (Client — thumbnail click swaps main image)
└── ProductInfo             (Server — name, price, brand, desc, CTA)
```

## Data Flow

```
Browser URL ──→ /productos/page.tsx
                    │
                    ▼
             lib/products.ts
               getProducts({ categoria, subcategoria, q, sort, page })
                    │
                    ▼
              Prisma (db.product.findMany)
               - where: { category slug, subcategory slug, name/desc contains q }
               - orderBy: sort param
               - skip: (page-1)*12, take: 12
                    │
                    ▼
             ProductGrid (Server Component)
               maps products → ProductCard × N
                    │
                    ▼
             HTML streamed to browser
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/products.ts` | **Create** | `getProducts()`, `getProductBySlug()`, `getCategories()` — typed Prisma queries |
| `src/app/productos/page.tsx` | **Create** | Listing page: reads `searchParams`, calls `getProducts`, renders sidebar + grid |
| `src/app/productos/loading.tsx` | **Create** | 6-card skeleton grid for streaming |
| `src/app/productos/[slug]/page.tsx` | **Create** | Detail page with `generateMetadata` + `notFound()` fallback |
| `src/app/not-found.tsx` | **Create** | "Producto no encontrado" + link back to `/productos` |
| `src/components/product/ProductCard.tsx` | **Create** | Shared card: image, name, price, brand, stock badge, Link to `[slug]` |
| `src/components/product/ProductGrid.tsx` | **Create** | Server component: responsive grid mapping `ProductCard` |
| `src/components/product/ProductFilters.tsx` | **Create** | Client sidebar: category tree, active states via `useSearchParams` |
| `src/components/product/SearchBar.tsx` | **Create** | Client `<form>` → navigates to `/productos?q=...` |
| `src/components/product/ProductSorter.tsx` | **Create** | Client `<select>` → updates `?sort=` |
| `src/components/product/Pagination.tsx` | **Create** | Client: page numbers, prev/next, active page highlight |
| `src/components/product/Breadcrumbs.tsx` | **Create** | Server: `<ol>` with schema.org `BreadcrumbList` structured data |
| `src/components/product/ProductGallery.tsx` | **Create** | Client: main image + clickable thumbnails |
| `src/components/product/ProductInfo.tsx` | **Create** | Server: price, brand, description, stock badge, CTA button |
| `src/lib/utils.ts` | **Modify** | Add `formatPrice()` using `Intl.NumberFormat` |
| `src/app/page.tsx` | **Modify** | Replace 3 placeholder divs with `ProductGrid` (newest 6) + section title + "Ver todos" |
| `src/components/layout/Navbar.tsx` | **Modify** | Replace raw `<input>` with `<SearchBar />`; category links → query-param format (`/productos?categoria=perros`) |
| `src/components/layout/NavbarMobile.tsx` | **Modify** | Category links → query-param format |
| `src/components/layout/Footer.tsx` | **Modify** | Category links → query-param format |
| `prisma/seed.ts` | **Modify** | Add 50–70 products array after category/subcategory creation, using `upsert` per slug |

## Testing Strategy

No test runner detected (`strict_tdd: false` in config). Verification via `npm run build`.

| Layer | What | Approach |
|-------|------|----------|
| Build | TypeScript + Next build | `npm run build` — catches type errors, missing exports, invalid imports |
| Manual | Listing with filters | Navigate `/productos`, apply each filter, verify URL updates and results |
| Manual | Detail + SEO | Check `/productos/[slug]` renders, inspect `<title>`/`<meta>` tags |
| Manual | Homepage | Confirm 6 newest products render instead of placeholders |
| Manual | Seed idempotency | Run `npx prisma db seed` twice, verify no duplicates |
| Manual | Stock=0 | Confirm "Sin stock" badge + disabled button on detail |

## Open Questions

None. All decisions are covered by specs, codebase patterns, and proposal scope.
