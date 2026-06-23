# Homepage Featured Products Specification

## Purpose

Replace the current placeholder divs on the homepage with a section displaying the 6 most recently added products, giving visitors immediate visibility into new inventory.

## Requirements

### R1: Featured Products Section

The system MUST replace the three placeholder "Producto destacado próximamente" divs on `/` with a real product grid showing the 6 most recently created products, ordered by `createdAt` descending.

### R2: Product Card Rendering

Each featured product MUST render using the same ProductCard component used on the listing page. Each card MUST include image, name, price, and stock badge.

### R3: Section Title

The section MUST have a visible title. The title SHALL be "Productos Destacados" with a subtle "Novedades" subtitle or the reverse — either is acceptable as long as it's clear and visually distinct from the main hero heading.

### R4: View All Link

Below the grid, the system MUST render a "Ver todos" link styled as an outlined button that navigates to `/productos`.

### R5: Empty State (Edge Case)

If fewer than 6 products exist (fresh database), the grid SHALL show however many are available. If zero products exist, the entire featured section SHALL be hidden.

## Scenarios

#### Scenario: Homepage shows featured products

- GIVEN 6+ products exist in the database
- WHEN a visitor loads `/`
- THEN the page shows a "Productos Destacados" section below the hero with 6 product cards in a responsive grid

#### Scenario: ProductCard links to detail

- GIVEN a featured product card is visible
- WHEN the visitor clicks the card
- THEN they navigate to `/productos/[slug]` for that product

#### Scenario: View all navigates to catalog

- GIVEN the featured section is visible
- WHEN the visitor clicks "Ver todos"
- THEN they navigate to `/productos`

#### Scenario: Zero products hides section

- GIVEN the database has no products
- WHEN the homepage renders
- THEN the featured products section is not rendered

## Technical Notes

- Query: `db.product.findMany({ orderBy: { createdAt: 'desc' }, take: 6 })`
- The section MUST be part of the homepage Server Component — no client-side fetching
- ProductCard component SHOULD be shared with listing (`@/components/product/ProductCard`)
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` matching the listing grid
- Card dimensions: same as listing (consistent UX)

## Acceptance Criteria

- [ ] Homepage shows 6 newest products instead of placeholders
- [ ] Cards link to correct `/productos/[slug]`
- [ ] "Ver todos" links to `/productos`
- [ ] Section is hidden when no products exist
- [ ] Uses same ProductCard as listing
