# Apply Progress: Product Catalog — PR 1

**Batch**: Phase 1 (Data Layer + Seed)
**Mode**: Standard (strict_tdd: false)

## Completed Tasks

- [x] 1.1 Create `src/lib/products.ts` — `getProducts()`, `getProductBySlug()`, `getCategories()`
- [x] 1.2 Add `formatPrice()` to `src/lib/utils.ts`
- [x] 1.3 Extend `prisma/seed.ts` with 63 products

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `src/lib/products.ts` | **Created** | `getProducts()` with Prisma `where/orderBy/skip/take`, `contains` + `mode: insensitive` for search; `getProductBySlug()` with category/subcategory includes; `getCategories()` for filter sidebar; typed `ProductQueryParams`, `SortOption`, pagination metadata |
| `src/lib/utils.ts` | **Modified** | Added `formatPrice(price)` using `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })`, handles number and Prisma Decimal strings |
| `prisma/seed.ts` | **Modified** | Extended with 63 products across all 25 existing subcategories (2–3 per subcategory), upsert by slug for idempotency, 7 products with stock=0, picsum.photos placeholder images, category/subcategory slug-based lookup from existing seed data |

## Deviations from Design

- The seed file's existing subcategories differ from the spec's idealized 26-subcategory list. The seed already has 25 subcategories with Spanish names (e.g., "Alimentos Balanceados" vs "Alimentos", "Snacks y Premios" vs "Higiene"). Products were matched against the actual subcategory slugs to ensure lookup correctness. This is correct behavior — the seed is the source of truth.
- `formatPrice` uses `'es-AR'` locale per tasks.md and design.md, matching the Spanish-language storefront. No `en-US` override was applied.

## Issues Found

- None. All lookups map cleanly to existing seed data. The `subcategoryMap` key format (`{categorySlug}:{subcategorySlug}`) correctly handles duplicate subcategory slugs across different categories (e.g., `juguetes` in Perros, Gatos, and Aves).

## Remaining Tasks

- [ ] 2.1 Create `ProductCard.tsx`
- [ ] 2.2 Create `ProductGrid.tsx`
- [ ] 2.3 Create `Pagination.tsx`
- [ ] 2.4 Create `Breadcrumbs.tsx`
- [ ] 2.5 Create `ProductGallery.tsx`
- [ ] 2.6 Create `ProductInfo.tsx`
- [ ] 2.7 Create `ProductFilters.tsx`
- [ ] 2.8 Create `SearchBar.tsx` and `ProductSorter.tsx`
- [ ] 3.1 Create listing page
- [ ] 3.2 Create loading skeleton
- [ ] 3.3 Create detail page + not-found
- [ ] 3.4 Update homepage
- [ ] 4.1-4.3 Navigation updates
- [ ] 5.1-5.2 Build verification

## Workload / PR Boundary

- **Mode**: Stacked PR to main (PR 1 of 3)
- **Current work unit**: Data layer + seed
- **Boundary**: Phase 1 only — no components, pages, or navigation changes
- **Estimated review budget**: ~300-350 additions (new `products.ts` + utils change + seed extension)
