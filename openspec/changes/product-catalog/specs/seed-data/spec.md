# Seed Data Specification

## Purpose

Extend the existing database seed (`prisma/seed.ts`) with 50–70 realistic pet products across all 7 categories and 25 subcategories, enabling the product catalog to render meaningful data immediately after seeding.

## Requirements

### R1: Product Count

The seed MUST create 50–70 total products, distributed as 2–3 products per subcategory (25 subcategories × ~2.5 avg = 62–63 target). At least 6 products in total MUST have `stock = 0`.

### R2: Realistic Product Data

Every product MUST have:
- `name` — a real-sounding Spanish pet product name (e.g. "Alimento Balanceado para Perros Adultos Raza Mediana")
- `slug` — derived from name via `slugify()`
- `description` — 1–2 sentences describing the product in Spanish
- `price` — realistic USD price (Decimal), range $2.99–$89.99
- `stock` — integer 0–100, with at least 6 products at 0
- `images` — array of 2–3 picsum.photos URLs: `https://picsum.photos/seed/{product-slug}-{n}/400/400`
- `brand` — one of 8–10 realistic pet brand names (e.g. Royal Canin, Purina, Pedigree, Whiskas, Dog Chow, Cat Chow, PetStar, etc.)
- `categoryId` — linked via category slug lookup
- `subcategoryId` — linked via subcategory slug + categoryId lookup

### R3: Diverse Distribution

Products MUST span all 25 subcategories. No subcategory SHOULD have more than 3 products. Brands SHOULD be distributed across categories (not all same brand in one category).

### R4: Idempotent Upsert

All product inserts MUST use `prisma.product.upsert({ where: { slug } })`. Running the seed multiple times MUST NOT create duplicate records.

### R5: Seed Order

Products MUST be seeded AFTER categories and subcategories. The seed script SHALL look up category/subcategory IDs dynamically to avoid hardcoded IDs.

## Scenarios

#### Scenario: Products populate after seed

- GIVEN a freshly seeded database
- WHEN `npx prisma db seed` completes
- THEN Product table has 50–70 rows, each with valid category and subcategory relations

#### Scenario: Idempotent re-run

- GIVEN a seeded database with products
- WHEN `npx prisma db seed` runs again
- THEN no duplicate products are created; existing products are updated in place

#### Scenario: Out-of-stock products exist

- GIVEN a seeded database
- WHEN querying for `stock = 0`
- THEN at least 6 products are returned

#### Scenario: All subcategories have products

- GIVEN a seeded database
- WHEN querying each subcategory
- THEN every subcategory returns 2–3 products

## Technical Notes

- Use a `PRODUCTS` array constant in `prisma/seed.ts` with category slug references
- Lookup category and subcategory IDs by slug within the seed loop
- Image URLs: `https://picsum.photos/seed/{unique-key}/400/400` (deterministic: same key = same image)
- Suggested brand list: Royal Canin, Purina Pro Plan, Pedigree, Whiskas, Dog Chow, Cat Excellence, PetStar, NutraGold, Hill's Science Diet, BH Pet
- Product names: `slugify()` via simple `toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`

## Acceptance Criteria

- [ ] Seed creates 50–70 products (verify with `SELECT COUNT(*)`)
- [ ] Every subcategory has 2–3 products
- [ ] At least 6 products have `stock = 0`
- [ ] Re-running seed doesn't create duplicates
- [ ] All products have valid category/subcategory relations
- [ ] Images are valid picsum.photos URLs
- [ ] `npm run build` succeeds with seeded data
