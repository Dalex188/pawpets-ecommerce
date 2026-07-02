# Delta for data-schema

## MODIFIED Requirements

### Requirement: Complete MVP Schema

The Prisma schema MUST model all MVP entities as specified. The Order entity is updated as follows:

**Order — changed fields:**
- `status String @default("PENDING")` → `status OrderStatus @default(PENDING)` where `OrderStatus` is an enum: `PENDING`, `CONFIRMED`, `CANCELLED`
- `shippingAddress String?` → structured shipping fields: `shippingName String`, `shippingPhone String`, `shippingProvince String`, `shippingCity String`, `shippingStreet String`, `shippingZip String`
- `orderNumber Int @unique @default(autoincrement())` added

(Previously: Order had `status String @default("PENDING")`, single `shippingAddress String?`, no `orderNumber`)

All other entities (User, Account, Session, VerificationToken, Category, Subcategory, Product, OrderItem) remain unchanged.

#### Scenario: Migration applies without errors

- GIVEN the updated Prisma schema with OrderStatus enum and new Order fields
- WHEN `npx prisma db push` is executed
- THEN the migration succeeds with the new enum type and columns

#### Scenario: Existing rows get defaults

- GIVEN a database with existing Order rows using the old String status
- WHEN the migration runs
- THEN existing orders receive `PENDING` as their OrderStatus value
- AND `orderNumber` is auto-assigned via autoincrement
- AND the six shipping fields are empty strings for rows that had null shippingAddress

## ADDED Requirements

### Requirement: OrderStatus Enum

The system SHALL define a Prisma enum `OrderStatus` with values `PENDING`, `CONFIRMED`, and `CANCELLED`. The enum MUST replace the previous `String` type on `Order.status`. The default value MUST be `PENDING`.

#### Scenario: New orders default to PENDING

- GIVEN a new Order is created
- WHEN no explicit status is provided
- THEN `status` defaults to `PENDING`

## REMOVED Requirements

### Requirement: Old Order schema (implicit)

(Reason: The Order entity is enhanced — `status` becomes a type-safe enum, `shippingAddress` is replaced by structured fields, and `orderNumber` is added for customer-facing reference)
(Migration: Existing String status values are coerced to `PENDING` on migration; `shippingAddress` text is not preserved into structured fields — manual data migration required if needed)
