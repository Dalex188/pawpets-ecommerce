# Apply Progress: Product Catalog — PR 3

**Batch**: Phases 3 + 4 + 5 (Pages, Navigation, Build Verification)
**Mode**: Standard (strict_tdd: false)
**Chain strategy**: stacked-to-main
**Base branch**: catalog/product-components
**PR branch**: catalog/pages-navigation

## Completed Tasks

### Phase 3 — Pages & Routes

- [x] 3.1 Create `src/app/productos/page.tsx` — reads `searchParams`, calls `getProducts` + `getCategories`, renders ProductFilters sidebar + SearchBar/ProductSorter controls + ProductGrid + Pagination. Sidebar collapses on mobile. Breadcrumbs wrapper renders correct trail based on URL params.
- [x] 3.2 Create `src/app/productos/loading.tsx` — 6 pulsing card skeleton placeholders with same grid layout, sidebar skeleton, breadcrumb/title skeletons.
- [x] 3.3 Create `src/app/productos/[slug]/page.tsx` with `generateMetadata` (title, description, Open Graph) + `notFound()` when product missing. Create `src/app/productos/not-found.tsx` with "Producto no encontrado" message + link back to `/productos`.
- [x] 3.4 Update `src/app/page.tsx` — replace placeholder dashed divs with "Productos Destacados" section: star icon, heading, ProductGrid with latest 6 products, "Ver todos los productos →" CTA link.

### Phase 4 — Navigation

- [x] 4.1 Update `Navbar.tsx` — replace raw `<input>` with `<SearchBar />` component (wrapped in Suspense for useSearchParams); category links updated: `/productos/perros` → `/productos?categoria=perros` (same for gatos, aves).
- [x] 4.2 Update `NavbarMobile.tsx` — category links: `/productos/perros` → `/productos?categoria=perros`.
- [x] 4.3 Update `Footer.tsx` — category links: `/productos/perros` → `/productos?categoria=perros` (all 5 categories).

### Phase 5 — Build Verification

- [x] 5.1 Fix build errors: (1) TypeScript array type inference on Breadcrumbs wrapper, (2) Missing Suspense boundaries around `useSearchParams` components (`SearchBar` in Navbar, `ProductFilters`/`SearchBar`/`ProductSorter`/`Pagination` in productos page), (3) `force-dynamic` on homepage to prevent DB calls at build time.
- [x] 5.2 Build succeeds — `npm run build` passes with all routes: `/` (ƒ dynamic), `/productos` (ƒ dynamic), `/productos/[slug]` (ƒ dynamic).

## Files Changed

### New Files (5)

| File | Action | What Was Done |
|------|--------|---------------|
| `src/app/productos/page.tsx` | **Created** | Listing page — server component, fetches data via getProducts/getCategories, renders sidebar + controls + grid + pagination |
| `src/app/productos/loading.tsx` | **Created** | Skeleton with 6 pulsing card placeholders, sidebar + breadcrumb + title skeletons |
| `src/app/productos/Breadcrumbs.tsx` | **Created** | Wrapper server component that builds BreadcrumbItem[] from URL search params (categoria/subcategoria) |
| `src/app/productos/[slug]/page.tsx` | **Created** | Detail page with dynamic metadata (title, description, og:image) + Breadcrumbs + ProductGallery + ProductInfo + notFound() |
| `src/app/productos/not-found.tsx` | **Created** | "Producto no encontrado" with sad face icon + link back to /productos |

### Modified Files (4 + tasks.md)

| File | Action | What Was Done |
|------|--------|---------------|
| `src/app/page.tsx` | **Modified** | Replaced placeholder dashed divs with featured products section: star icon, "Productos Destacados" heading, ProductGrid (latest 6), "Ver todos" CTA. Added `force-dynamic` export. |
| `src/components/layout/Navbar.tsx` | **Modified** | Replaced raw `<input>` with `<SearchBar />` wrapped in Suspense; category links use `?categoria=` query params |
| `src/components/layout/NavbarMobile.tsx` | **Modified** | Category links use `?categoria=` query params |
| `src/components/layout/Footer.tsx` | **Modified** | All 5 category links use `?categoria=` query params |
| `openspec/changes/product-catalog/tasks.md` | **Modified** | All Phase 3/4/5 tasks marked [x] |

## Deviations from Design

1. **searchParams sync (not async)**: Followed the explicit task instruction to use synchronous `searchParams` prop (Next.js 14), matching the installed version (14.2.35).
2. **Suspense boundaries**: Added `Suspense` boundaries around components using `useSearchParams()` (SearchBar in Navbar, ProductFilters/ProductSorter/Pagination in listing page) — required by Next.js 14 for static generation. Not called out in the design.
3. **`force-dynamic` on homepage**: Homepage calls `getProducts()` at the top level during server rendering. Added `export const dynamic = 'force-dynamic'` to prevent build-time database connection errors. Not in design.
4. **Local Breadcrumbs wrapper**: Created `src/app/productos/Breadcrumbs.tsx` as a thin wrapper that constructs BreadcrumbItem[] from searchParams, since the reusable `<Breadcrumbs>` component only accepts an array of items. Not in design but follows the same pattern.
5. **`/productos?categoria=` vs `/productos/[categoria]`**: The design showed `/productos/perros` as category route, but updated to query-param format per tasks spec. Navigation components updated consistently.

## Issues Found

- **useSearchParams + static generation**: All client components using `useSearchParams()` need a `Suspense` boundary when rendered in a page that might be statically generated. Fixed by wrapping each consumer.
- **No database at build time**: Homepage's `getProducts()` call fails during `next build` because there's no PostgreSQL server running. Fixed by marking the page as `force-dynamic`.
- **BreadcrumbItem type strictness**: The type has `href?: string` (optional), but TypeScript's array type inference from `[{ label: "Inicio", href: "/" }]` narrows it to `{ label: string; href: string }[]`, requiring explicit type annotation.

## Remaining Tasks

None. All tasks for Phases 3, 4, and 5 are complete.

## Workload / PR Boundary

- **Mode**: Stacked PR to main (PR 3 of 3, stacked on `catalog/product-components`)
- **Current work unit**: Pages + Navigation + Build Verification
- **Boundary**: All tasks complete — ready for verify and merge
- **Estimated review budget**: ~9 files (5 new + 4 modified), ~300 additions
