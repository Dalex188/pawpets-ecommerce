# Proposal: Product Catalog

## Intent

Build the core shopping interface: product listing with search, filter, sort, and pagination, plus a detail page. Replaces homepage placeholder content with real products.

## Scope

### In Scope
- Listing at `/productos` driven by URL query params (`?categoria=`, `?subcategoria=`, `?q=`, `?sort=`, `?page=`)
- Detail at `/productos/[slug]` with gallery + product info
- Sidebar category/subcategory filter, text search, sort dropdown, offset pagination
- Stock=0 shown as "Sin stock" badge; homepage shows newest 6 products
- 50–70 seed products (2–3 per subcategory) with picsum.photos placeholders
- Navbar/Footer: category links → query-param format; search input → SearchBar component

### Out of Scope
- Admin CRUD, image upload, cart integration
- Full-text search, reviews, ratings, related products
- Manual featured selection (deferred to admin)

## Capabilities

### New Capabilities
- `product-catalog`: Storefront product listing, detail, search, filter, sort, pagination

### Modified Capabilities
- `design-system`: Navbar search → SearchBar; category links → query-param routes
- `data-schema`: Seed script extended with sample products

## Approach

Server Components with direct Prisma queries. Client Components (`ProductFilters`, `SearchBar`, `ProductSorter`, `Pagination`) update URL via `useRouter`/`useSearchParams`.

Data layer: `lib/products.ts` — `getProducts()`, `getProductBySlug()`, `getCategories()`.

Listing: `page.tsx` → `ProductFilters` + `ProductGrid` → `ProductCard` × N. Header: `SearchBar` + `ProductSorter`. Footer: `Pagination`.

Detail: `ProductGallery` + `ProductInfo` + `Breadcrumbs`.

Loading/404: `loading.tsx` (skeleton), `not-found.tsx`.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| URL search params cause layout shift | Med | Suspense + loading skeleton |
| Prisma `contains` slow on large datasets | Low (MVP) | Flag for full-text search in Phase 2 |
| Placeholder images degrade UX | Med | Fixed aspect ratios, consistent picsum dimensions |

## Rollback Plan

`git revert` the merge commit. Seed is idempotent — re-running won't duplicate.

## Dependencies

- Prisma schema (Product, Category, Subcategory)
- Design system (Tailwind theme, Nunito font)
- Navbar, Footer layout components

## Success Criteria

- [ ] `/productos` renders categories sidebar + product grid
- [ ] Category filter updates URL and product list via query params
- [ ] Text search finds products by name/description (insensitive)
- [ ] Sort by name, price, newest works correctly
- [ ] Pagination navigates with page numbers
- [ ] `/productos/[slug]` shows detail with gallery
- [ ] Stock=0 products show "Sin stock" badge
- [ ] Homepage shows newest 6 products
- [ ] `npm run build` succeeds with zero errors
