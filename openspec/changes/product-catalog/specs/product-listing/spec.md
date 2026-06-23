# Product Listing Specification

## Purpose

Provide a browsable, searchable product grid at `/productos` driven entirely by URL query params. Users can search, filter by category/subcategory, sort, and paginate results without client state — every interaction updates the URL.

## Requirements

### R1: Product Grid

The system MUST render products in a responsive grid (1 col mobile, 2 tablet, 3+ desktop) using ProductCard components. Each card MUST display: image, name, price, brand, and stock badge.

### R2: Text Search

The system MUST search products by `name` and `description` using Prisma `contains` with `mode: 'insensitive'` when `?q=` is present in the URL.

### R3: Category & Subcategory Filter

The system MUST filter products by `?categoria=` (slug) and optionally `?subcategoria=` (slug). When only `categoria` is provided, all products in that category are shown. When both are provided, results narrow to that subcategory.

A sidebar MUST list all categories. Active category is highlighted. Expanding a category shows its subcategories as links.

### R4: Sort

The system MUST support `?sort=` with values: `name_asc`, `name_desc`, `price_asc`, `price_desc`, `newest`. Default sort is `newest` (by `createdAt` desc).

### R5: Pagination

The system MUST use offset-based pagination (`skip`/`take`). Page size SHALL be 12. The `?page=` param drives the offset. Page numbers MUST render at the bottom with prev/next buttons. Current page MUST be visually distinct.

### R6: Loading State

The system MUST show a skeleton grid (6 placeholder cards with pulsing animation) while the page is streaming via `loading.tsx`.

### R7: Empty State

When no products match filters, the grid MUST display "No se encontraron productos" with a suggestion to clear filters.

### R8: URL as Source of Truth

All filter/sort/search/page state MUST live in URL query params. Updating any param triggers a server re-render via Next.js search params. Initial page load reads all state from the URL.

## Scenarios

#### Scenario: Full catalog loads

- GIVEN a visitor navigates to `/productos`
- WHEN the page renders
- THEN all products are displayed in a grid, sorted by newest first

#### Scenario: Search finds results

- GIVEN products exist matching "alimento"
- WHEN the visitor types "alimento" in the search bar
- THEN results filter to matching products by name or description

#### Scenario: Category + subcategory filter

- GIVEN the visitor selects category "Perros" and subcategory "Juguetes"
- WHEN the URL updates to `?categoria=perros&subcategoria=juguetes`
- THEN only products in Perros > Juguetes are shown

#### Scenario: Sort changes

- GIVEN 12+ products visible
- WHEN the visitor selects "Precio: menor a mayor"
- THEN products reorder by price ascending

#### Scenario: Pagination navigation

- GIVEN 24+ products match current filters
- WHEN the visitor clicks page 2
- THEN products 13-24 render and page 2 is highlighted

#### Scenario: No results

- GIVEN no products match the current filters
- WHEN the grid renders
- THEN "No se encontraron productos" is displayed

#### Scenario: Loading state

- GIVEN a visitor navigates to `/productos` with filters
- WHEN the page is streaming
- THEN a 6-card skeleton grid is shown

## Technical Notes

- Sidebar filter links: `?categoria={slug}`, subcategory links: `?categoria={slug}&subcategoria={slug}`
- Search: `<form>` with input name `q`, submits to current URL with `q` param
- Sort: `<select>` updates `?sort=` via `useRouter().replace()`
- Pagination: `skip = (page - 1) * 12`, `take = 12`
- Client components: `ProductFilters` (sidebar), `SearchBar`, `ProductSorter`, `Pagination` — all use `useSearchParams()`
- Data layer: `lib/products.ts` exports `getProducts({ filters })`

## Acceptance Criteria

- [ ] `/productos` renders product grid with all default products
- [ ] Search by name and description works case-insensitively
- [ ] Category sidebar filters correctly; active state is visible
- [ ] Subcategory filter narrows within category
- [ ] Sort options reorder products correctly
- [ ] Pagination shows page numbers, prev/next, correct offset
- [ ] Empty state renders when no matches
- [ ] Skeleton grid renders during loading
- [ ] All state is reflected in URL query params
