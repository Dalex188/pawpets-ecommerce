# Product Detail Specification

## Purpose

Provide a rich product detail page at `/productos/[slug]` with SEO metadata, product information, image gallery, stock status, breadcrumb navigation, and an add-to-cart button placeholder.

## Requirements

### R1: Route & SEO

The system MUST handle `/productos/[slug]` as a Server Component. It MUST export `generateMetadata` to set `<title>`, `<meta name="description">`, and `<meta property="og:image">` from product data. Title format: `{name} — PawPets`.

### R2: Product Information

The system MUST display: name (heading), price (formatted as USD with an IVA note), description, brand, weight, size, and age group. Price formatting SHALL use `Intl.NumberFormat('es-AR')` with currency USD.

### R3: Image Gallery

The system MUST render product images in a gallery layout: one main image with thumbnail strip below. For MVP, images are placeholder URLs from the seed data. Clicking a thumbnail swaps the main image.

### R4: Stock Badge

The system MUST show a badge next to the price area: green with "En stock" when `stock > 0`, red with "Sin stock" when `stock = 0`.

### R5: Breadcrumb

The system MUST render breadcrumb navigation: `Inicio > {Category} > {Subcategory} > {Product Name}`. Breadcrumb MUST use `<ol>` with `<li>` items and proper schema.org `BreadcrumbList` structured data.

When subcategory is null, omit that segment: `Inicio > {Category} > {Product Name}`.

### R6: 404 for Invalid Slugs

When no product matches the slug, the system MUST call `notFound()` which renders `not-found.tsx` with a "Producto no encontrado" message and a link back to `/productos`.

### R7: Add to Cart Button

The system MUST show an "Agregar al carrito" button. When `stock = 0`, the button MUST be `disabled` with "Sin stock" text. When `stock > 0`, the button SHALL be enabled but does nothing (cart is future scope). Visual state: primary color when enabled, gray when disabled.

## Scenarios

#### Scenario: Product detail renders

- GIVEN a valid product slug
- WHEN the visitor navigates to `/productos/alimento-premium-perros`
- THEN the page shows product name, price, description, brand, weight, size, age group, images, stock badge, breadcrumb, and add-to-cart button

#### Scenario: SEO metadata generated

- GIVEN a valid product slug
- WHEN `generateMetadata` runs
- THEN `<title>` contains product name, `<meta name="description">` contains the product description, and `<meta property="og:image">` contains the first product image

#### Scenario: Breadcrumb navigation

- GIVEN a product in Perros > Juguetes
- WHEN the detail page renders
- THEN breadcrumb shows: Inicio > Perros > Juguetes > Product Name

#### Scenario: Product not found

- GIVEN an invalid or non-existent slug
- WHEN the visitor navigates to `/productos/slug-invalido`
- THEN a 404 page renders with "Producto no encontrado"

#### Scenario: Out of stock display

- GIVEN a product with `stock = 0`
- WHEN the detail page renders
- THEN the stock badge is red with "Sin stock" and the add-to-cart button is disabled

#### Scenario: Image gallery interaction

- GIVEN a product with multiple images
- WHEN the visitor clicks a thumbnail
- THEN the main image updates to the selected image

## Technical Notes

- Use `params: { slug: string }` from Next.js page props
- `generateMetadata` fetches product with `select: { name, description, images }` (lean query)
- Breadcrumb links: Inicio → `/`, Category → `/productos?categoria={slug}`, Subcategory → `/productos?categoria={slug}&subcategoria={slug}`
- Images: `next/image` with fixed aspect ratio container (`aspect-square` or `4:3`)
- Price: always show "(IVA incluido)" suffix in Spanish

## Acceptance Criteria

- [ ] `/productos/[slug]` renders full product detail for valid slugs
- [ ] `generateMetadata` produces correct SEO tags
- [ ] Breadcrumb matches category hierarchy
- [ ] Invalid slug triggers 404
- [ ] Stock=0 shows red badge and disabled button
- [ ] Image gallery allows thumbnail navigation
- [ ] Price formats correctly with IVA note
