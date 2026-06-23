# Tasks: Product Catalog

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 950–1300 (+14 files, ~5 modified) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (data+seed) → PR 2 (components) → PR 3 (pages+navigation) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data layer + seed | PR 1 | base: feature/tracker; `lib/products.ts`, `utils.ts`, `seed.ts` |
| 2 | Product components | PR 2 | base: PR 1 branch; all 8 `components/product/*` |
| 3 | Pages + navigation | PR 3 | base: PR 2 branch; listing, detail, homepage, Navbar, Footer |
| 4 | Build verification | PR 3 | `npm run build`, smoke test after PR 3 merges |

## Phase 1: Data Layer

- [x] 1.1 Create `src/lib/products.ts` — `getProducts()`, `getProductBySlug()`, `getCategories()` with typed Prisma queries
- [x] 1.2 Add `formatPrice()` to `src/lib/utils.ts` using `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })`
- [x] 1.3 Extend `prisma/seed.ts` with 50–70 products array (2–3 per subcategory, ≥6 at stock=0), category slug lookups, `upsert` per slug

## Phase 2: Product Components

- [x] 2.1 Create `ProductCard.tsx` — image, name, price, brand, stock badge, Link to `/productos/[slug]`
- [x] 2.2 Create `ProductGrid.tsx` — Server component, responsive grid mapping ProductCard, empty state message
- [x] 2.3 Create `Pagination.tsx` — Client component, page numbers with prev/next, highlights current page
- [x] 2.4 Create `Breadcrumbs.tsx` — Server component, `<ol>` with schema.org BreadcrumbList structured data
- [x] 2.5 Create `ProductGallery.tsx` — Client component, main image + clickable thumbnail strip
- [x] 2.6 Create `ProductInfo.tsx` — Server component: price, brand, description, stock badge, disabled CTA if stock=0
- [x] 2.7 Create `ProductFilters.tsx` — Client sidebar, category/subcategory tree, active state via `useSearchParams`
- [x] 2.8 Create `SearchBar.tsx` and `ProductSorter.tsx`— Client `<form>` and `<select>` updating URL params

## Phase 3: Pages & Routes

- [x] 3.1 Create `src/app/productos/page.tsx` — reads `searchParams`, calls `getProducts`, renders sidebar + grid + controls
- [x] 3.2 Create `src/app/productos/loading.tsx` — 6-card skeleton grid with pulsing animation
- [x] 3.3 Create `src/app/productos/[slug]/page.tsx` with `generateMetadata` + `src/app/productos/not-found.tsx`
- [x] 3.4 Update `src/app/page.tsx` — replace placeholder divs with "Productos Destacados" section (6 newest, "Ver todos" link)

## Phase 4: Navigation

- [x] 4.1 Update `Navbar.tsx` — replace raw `<input>` with `<SearchBar />`; category links → `/productos?categoria={slug}`
- [x] 4.2 Update `NavbarMobile.tsx` — category links → `/productos?categoria={slug}`
- [x] 4.3 Update `Footer.tsx` — category links → `/productos?categoria={slug}`

## Phase 5: Build Verification

- [x] 5.1 Run `npm run build` and fix TypeScript/import errors
- [x] 5.2 Smoke test: build succeeds — `/productos` (ƒ dynamic), `/productos/[slug]` (ƒ dynamic), `/` (ƒ dynamic) all compile
