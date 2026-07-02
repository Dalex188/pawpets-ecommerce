# Delta for Data Schema

## ADDED Requirements

### Requirement: getFeaturedProducts Query

The system MUST provide a `getFeaturedProducts(limit?: number)` function in `src/lib/products.ts` that queries products with `isFeatured: true`, sorted by `createdAt` descending. When no featured products exist, it MUST fall back to the newest products.

#### Scenario: Returns featured products sorted by newest

- GIVEN products with `isFeatured: true` exist
- WHEN `getFeaturedProducts(6)` is called
- THEN it returns up to 6 products with `isFeatured: true`, ordered by `createdAt` descending
- AND each product includes category and subcategory relations

#### Scenario: No featured products — fallback to newest

- GIVEN no products have `isFeatured: true`
- WHEN `getFeaturedProducts(6)` is called
- THEN it returns the 6 most recently created products regardless of `isFeatured`

#### Scenario: limit parameter is respected

- GIVEN 12 products with `isFeatured: true` exist
- WHEN `getFeaturedProducts(4)` is called
- THEN exactly 4 products are returned

## MODIFIED Requirements

### Requirement: Complete MVP Schema

Define the complete Prisma ORM schema for all MVP entities: Users, Accounts, Sessions, Categories, Subcategories, Products, Orders, and OrderItems with proper relations, indexes, and seed data.

| Entity     | Key Fields                                                        | Relations                                     |
|------------|-------------------------------------------------------------------|-----------------------------------------------|
| User       | id, name, email (unique), passwordHash, role (CLIENT\|ADMIN), timestamps | hasMany Orders, hasMany Accounts, Sessions    |
| Account    | NextAuth.js v5 adapter fields                                     | belongsTo User                                |
| Session    | NextAuth.js v5 adapter fields                                     | belongsTo User                                |
| Category   | id, name, slug (unique), description, image                       | hasMany Subcategories, hasMany Products       |
| Subcategory| id, name, slug, categoryId, description                           | belongsTo Category                            |
| Product    | id, name, slug (unique), description, price, stock, images[], weight, ageGroup, size, brand, **isFeatured (Boolean, default false)**, categoryId, subcategoryId?, timestamps | belongsTo Category, optional belongsTo Subcategory |
| Order      | id, userId, status (OrderStatus), total, shippingName, shippingPhone, shippingProvince, shippingCity, shippingStreet, shippingZip, orderNumber (unique), createdAt | belongsTo User, hasMany OrderItems            |
| OrderItem  | id, orderId, productId, quantity, price                           | belongsTo Order, belongsTo Product            |

(Previously: Product model did not include `isFeatured` field)

#### Scenario: Schema push succeeds

- GIVEN the Prisma schema at `prisma/schema.prisma`
- WHEN `npx prisma db push` is executed
- THEN all 8 tables are created in SQLite without errors
- AND the `Product` table includes the `isFeatured` Boolean column with default `false`

#### Scenario: Relations are correct

- GIVEN the generated Prisma client
- WHEN querying Product with include for category and subcategory
- THEN related data is returned correctly

#### Scenario: Enum and field migration applies

- GIVEN the updated Prisma schema
- WHEN `npx prisma db push` is executed
- THEN the migration succeeds
- AND existing rows receive `isFeatured = false` as default

#### Scenario: Existing rows get defaults

- GIVEN a database with existing Product rows
- WHEN the migration runs
- THEN existing products receive `isFeatured = false`

### Requirement: Database Seed

The seed script SHALL populate one admin user, all MVP categories with subcategories, and full product catalog. The seed MUST be idempotent (safe to re-run).

(Previously: Seed script did not set featured products)

#### Scenario: Seed populates data

- GIVEN an empty database
- WHEN `npx prisma db seed` runs
- THEN the database has one ADMIN user, 7 categories, their subcategories, and all products

#### Scenario: Idempotent re-run

- GIVEN a seeded database
- WHEN the seed runs again
- THEN no duplicate records are created (uses upsert)

#### Scenario: Featured products are seeded

- GIVEN the seed script runs
- WHEN products are created
- THEN 6 products spread across at least 3 categories have `isFeatured: true`
- AND the remaining products have `isFeatured: false`
