# Delta for Data Schema

## MODIFIED Requirements

### Requirement: Database Seed

The seed script SHALL populate one admin user, all MVP categories with subcategories, **and 50–70 sample products across all subcategories**. The seed MUST be idempotent (safe to re-run).
(Previously: seed only populated admin user and categories with subcategories)

#### Scenario: Seed populates all data

- GIVEN an empty database
- WHEN `npx prisma db seed` runs
- THEN the database has one ADMIN user, 7 categories, their subcategories, and 50–70 products

#### Scenario: Products have correct relations

- GIVEN a seeded database
- WHEN querying any product with its category and subcategory
- THEN the relation returns the correct parent entities

#### Scenario: Idempotent re-run (unchanged)

- GIVEN a seeded database
- WHEN the seed runs again
- THEN no duplicate records are created (uses upsert)

#### Scenario: Out-of-stock products exist

- GIVEN a seeded database
- WHEN querying products with `stock = 0`
- THEN at least 6 products are returned

## Technical Notes

- Product seed runs AFTER category/subcategory creation in the same `main()` function
- Uses lookup by slug to assign `categoryId` and `subcategoryId`
- Image URLs: `https://picsum.photos/seed/{unique-key}/400/400` (deterministic)
- Product data defined as a `PRODUCTS` array constant with category/subcategory slug references
