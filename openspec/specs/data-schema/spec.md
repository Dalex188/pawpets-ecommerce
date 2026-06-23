# Data Schema Specification

## Purpose

Define the complete Prisma ORM schema for all MVP entities: Users, Accounts, Sessions, Categories, Subcategories, Products, Orders, and OrderItems with proper relations, indexes, and seed data.

## Requirements

### Requirement: Complete MVP Schema

The Prisma schema MUST model these entities with all specified fields and relations:

| Entity     | Key Fields                                                        | Relations                                     |
|------------|-------------------------------------------------------------------|-----------------------------------------------|
| User       | id, name, email (unique), passwordHash, role (CLIENT\|ADMIN), timestamps | hasMany Orders, hasMany Accounts, Sessions    |
| Account    | NextAuth.js v5 adapter fields                                     | belongsTo User                                |
| Session    | NextAuth.js v5 adapter fields                                     | belongsTo User                                |
| Category   | id, name, slug (unique), description, image                       | hasMany Subcategories, hasMany Products       |
| Subcategory| id, name, slug, categoryId, description                           | belongsTo Category                            |
| Product    | id, name, slug (unique), description, price, stock, images[], weight, ageGroup, size, brand, categoryId, subcategoryId?, timestamps | belongsTo Category, optional belongsTo Subcategory |
| Order      | id, userId, status, total, shippingAddress, createdAt             | belongsTo User, hasMany OrderItems            |
| OrderItem  | id, orderId, productId, quantity, price                           | belongsTo Order, belongsTo Product            |

#### Scenario: Schema push succeeds

- GIVEN the Prisma schema at `prisma/schema.prisma`
- WHEN `npx prisma db push` is executed
- THEN all 8 tables are created in PostgreSQL without errors

#### Scenario: Relations are correct

- GIVEN the generated Prisma client
- WHEN querying Product with include for category and subcategory
- THEN related data is returned correctly

### Requirement: Database Seed

The seed script SHALL populate one admin user and all MVP categories with subcategories. The seed MUST be idempotent (safe to re-run).

#### Scenario: Seed populates data

- GIVEN an empty database
- WHEN `npx prisma db seed` runs
- THEN the database has one ADMIN user, 7 categories, and their subcategories

#### Scenario: Idempotent re-run

- GIVEN a seeded database
- WHEN the seed runs again
- THEN no duplicate records are created (uses upsert)
