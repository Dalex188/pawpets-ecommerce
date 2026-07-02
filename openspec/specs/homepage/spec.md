# Homepage Specification

## Purpose

The homepage guides visitors into the catalog through three vertically stacked sections: a hero banner, category navigation, and a featured products showcase.

## Requirements

### Requirement: Hero Section

The homepage MUST render a full-width hero with a background image, gradient overlay, headline, subheadline, and CTA button linking to `/productos`.

#### Scenario: Hero renders fully

- GIVEN a visitor lands on the homepage
- WHEN the page loads
- THEN a full-width hero is displayed with a background image, gradient overlay, headline "Todo para tu mascota", subheadline describing the catalog, and a "Ver productos" CTA button linking to `/productos`

#### Scenario: Background image fails to load

- GIVEN the hero background image URL is unreachable
- WHEN the hero renders
- THEN a fallback background color is shown instead of the image
- AND all text and the CTA remain visible

### Requirement: Category Grid

The homepage MUST render 7 category cards with emoji icons and links to `/productos?categoria={slug}`.

| Category | Emoji | Slug |
|----------|-------|------|
| Perros | 🐕 | perros |
| Gatos | 🐱 | gatos |
| Aves | 🐦 | aves |
| Peces | 🐟 | peces |
| Roedores | 🐹 | roedores |
| Salud General | 🩺 | salud-general |
| Accesorios Generales | 🎒 | accesorios-generales |

#### Scenario: All cards render with links

- GIVEN the homepage loads
- WHEN the category grid section renders
- THEN 7 cards display, each with an emoji, the category name, and a link to `/productos?categoria={slug}`

#### Scenario: Grid wraps on mobile

- GIVEN the viewport is ≤ 640px wide
- WHEN the category grid renders
- THEN cards display in a 2-column layout

### Requirement: Featured Products Section

The homepage MUST display up to 6 featured products using `ProductGrid`, fetched via `getFeaturedProducts()`.

#### Scenario: Featured products display

- GIVEN products with `isFeatured: true` exist
- WHEN the featured section renders
- THEN up to 6 featured product cards display via `ProductGrid`
- AND a "Ver todos los productos" link appears below the grid

#### Scenario: No featured products

- GIVEN no products have `isFeatured: true`
- WHEN the section renders
- THEN `getFeaturedProducts()` returns fallback newest products
- AND the section renders those products as a normal grid

#### Scenario: Fewer than 6 featured products

- GIVEN only 3 products have `isFeatured: true`
- WHEN the section renders
- THEN exactly those 3 products display in the grid
- AND no empty slots or placeholders appear

### Requirement: Empty State

The homepage SHALL NOT break when data is missing entirely.

#### Scenario: Empty database

- GIVEN the database has no products
- WHEN the homepage renders
- THEN the hero displays normally
- AND the featured section is hidden (renders nothing)

### Requirement: Mobile Responsive

All homepage sections MUST adapt to mobile viewports.

#### Scenario: Every section stacks on mobile

- GIVEN the viewport is ≤ 640px
- WHEN each section renders
- THEN the hero stacks vertically with reduced padding
- AND the category grid uses 2 columns
- AND the featured products grid uses 2 columns
