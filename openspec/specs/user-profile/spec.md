# User Profile Specification

## Purpose

Provide authenticated users with a profile page displaying account information and order history. Users can view past orders and navigate to individual order details.

## Requirements

### Requirement: Auth Guard

The `/perfil` page MUST check auth state on every request and redirect unauthenticated users to `/login`.

#### Scenario: Authenticated user accesses profile

- GIVEN the user is signed in with a valid session
- WHEN they navigate to `/perfil`
- THEN the page renders user info and order history

#### Scenario: Unauthenticated user redirected

- GIVEN the user has no active session
- WHEN they navigate to `/perfil`
- THEN they are redirected to `/login`

### Requirement: Profile Page Display

The `/perfil` page MUST display the authenticated user's name, email, and "Miembro desde" date (formatted from `createdAt`).

#### Scenario: User info section renders

- GIVEN an authenticated user with name "Juan", email "juan@test.com", and createdAt `2026-01-15`
- WHEN `/perfil` loads
- THEN the page shows "Juan", "juan@test.com", and "Miembro desde 15 de enero de 2026"

### Requirement: Order History Query

The system MUST provide `getOrdersByUser()` returning the current user's orders sorted by `createdAt` descending with a computed `itemCount` per order (sum of item quantities). When no session exists, it MUST return an empty array.

#### Scenario: User with orders

- GIVEN a user with 3 orders, the latest from yesterday
- WHEN `getOrdersByUser()` is called
- THEN it returns orders with the most recent first, each including `itemCount`

#### Scenario: User with no orders

- GIVEN a user with zero orders
- WHEN `getOrdersByUser()` is called
- THEN it returns an empty array

### Requirement: Order History Table

The order history table MUST show: order number (linked to `/orden/{orderNumber}`), date, item count, colored status badge, and formatted total.

#### Scenario: Table renders with order data

- GIVEN an authenticated user with at least one order
- WHEN `/perfil` renders the order history
- THEN each row contains a linked order number, date, item count, status badge, and total

### Requirement: Order Status Badge

The system MUST render status badges with distinct colors: PENDING (yellow background), CONFIRMED (green background), CANCELLED (red background).

#### Scenario: Pending order badge

- GIVEN an order with status "PENDING"
- WHEN the badge renders
- THEN it uses yellow-100 background and yellow-800 text

#### Scenario: Confirmed order badge

- GIVEN an order with status "CONFIRMED"
- WHEN the badge renders
- THEN it uses green-100 background and green-800 text

#### Scenario: Cancelled order badge

- GIVEN an order with status "CANCELLED"
- WHEN the badge renders
- THEN it uses red-100 background and red-800 text

### Requirement: Empty State

When a user has no orders, the page MUST show a friendly message ("Todavía no tenés órdenes") and a CTA button linking to `/productos`.

#### Scenario: No orders yet

- GIVEN an authenticated user with zero orders
- WHEN `/perfil` renders
- THEN it shows the empty state message and a "Ver productos" CTA
