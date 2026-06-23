# Apply Progress: Product Catalog — PR 2

**Batch**: Phase 2 (Product Components)
**Mode**: Standard (strict_tdd: false)

## Completed Tasks

- [x] 2.1 Create `ProductCard.tsx`
- [x] 2.2 Create `ProductGrid.tsx`
- [x] 2.3 Create `Pagination.tsx`
- [x] 2.4 Create `Breadcrumbs.tsx`
- [x] 2.5 Create `ProductGallery.tsx`
- [x] 2.6 Create `ProductInfo.tsx`
- [x] 2.7 Create `ProductFilters.tsx`
- [x] 2.8 Create `SearchBar.tsx` and `ProductSorter.tsx`

## Files Changed (All Created)

| File | Action | What Was Done |
|------|--------|---------------|
| `src/components/products/ProductCard.tsx` | **Created** | Server component — image (first from images[]), name, formatted price, brand badge, stock badge (green/red), wraps in Link to `/productos/[slug]`, hover shadow lift effect, group hover scale on image |
| `src/components/products/ProductGrid.tsx` | **Created** | Server component — responsive grid 1/2/3/4 cols, maps products to ProductCard, empty state with icon + "No se encontraron productos" message |
| `src/components/products/Pagination.tsx` | **Created** | Client component — page numbers with prev/next SVG arrows, current page highlighted with primary color, ellipsis for large page ranges, hides when totalPages ≤ 1, generates ?page=N search params |
| `src/components/products/Breadcrumbs.tsx` | **Created** | Server component — `<ol>` with schema.org BreadcrumbList JSON-LD script, chevron separators, last item plain text, links use NEXT_PUBLIC_SITE_URL for canonical items |
| `src/components/products/ProductGallery.tsx` | **Created** | Client component — main image (aspect-square) + clickable thumbnail strip, useState for selected index, primary border/ring on active thumbnail, responsive horizontal scroll, empty state placeholder |
| `src/components/products/ProductInfo.tsx` | **Created** | Server component — h1 name, brand, price + "(IVA incluido)", stock badge (green/red), description section, specs table (brand/weight/size/ageGroup, skipping nulls), "Agregar al carrito" button (disabled + "Sin stock" if stock=0, primary color if available) |
| `src/components/products/ProductFilters.tsx` | **Created** | Client component — sidebar with category list, expandable subcategories, "Todos los productos" link, active states highlighted with primary font color, mobile toggle button (hidden on lg+), router.push with updated search params, resets page on filter change |
| `src/components/products/SearchBar.tsx` | **Created** | Client component — form with search input + "Buscar" button with SVG icon, reads current searchParams, on submit navigates via router.push with ?q= param, same input styling as existing Navbar raw input |
| `src/components/products/ProductSorter.tsx` | **Created** | Client component — select dropdown with 5 options (Nombre A-Z, Z-A, Precio menor/mayor, Más nuevos), onChange updates ?sort= via router.push, default "newest" removed from URL when selected |

## Deviations from Design

- The design says `src/components/product/` (singular) but the task and this implementation use `src/components/products/` (plural). This matches the task spec.
- `ProductCard` uses `next/image` with `fill` + `sizes` attribute for proper responsive images. The placeholder `/placeholder.svg` path is referenced but won't show until the file is added (it gracefully falls back to the gray background).
- `ProductFilters` uses `<a>` elements with `onClick.preventDefault()` + `router.push()` for accessibility (right-click/open in new tab works) while also enabling client-side navigation. This is a pragmatic hybrid over pure `router.push`.
- `Pagination` uses `basePath` prop instead of hardcoded `/productos`, making it reusable for admin listings.
- `ProductGallery` accepts a `productName` prop for image alt text (accessibility), which wasn't called out in the spec but follows accessibility best practices.

## Issues Found

- None. All components are self-contained with proper imports from `@/lib/utils` and `next/link`/`next/image`.
- The `Breadcrumbs` component references `process.env.NEXT_PUBLIC_SITE_URL` which should be set in the environment for correct canonical URLs in JSON-LD. Defaults to `https://pawpets.com` if not set.
- `ProductCard` references `/placeholder.svg` as a fallback image — if this file doesn't exist, the gray background serves as a visual placeholder.

## Remaining Tasks (Phase 3+)

- [ ] 3.1 Create listing page `src/app/productos/page.tsx`
- [ ] 3.2 Create `src/app/productos/loading.tsx` skeleton
- [ ] 3.3 Create detail page `src/app/productos/[slug]/page.tsx` + not-found
- [ ] 3.4 Update homepage featured section
- [ ] 4.1-4.3 Navigation updates (Navbar, Footer, NavbarMobile)
- [ ] 5.1-5.2 Build verification

## Workload / PR Boundary

- **Mode**: Stacked PR to main (PR 2 of 3, stacked on `catalog/data-layer-seed`)
- **Current work unit**: Product components
- **Boundary**: Phase 2 only — 8 product components, no pages, no navigation changes
- **Estimated review budget**: ~450-550 additions
