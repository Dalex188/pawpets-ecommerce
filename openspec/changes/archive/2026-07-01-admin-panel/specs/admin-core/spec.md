# Admin Core Specification

## Purpose

Provides the admin layout with role-based access guard, a dashboard with entity overview, and conditional navigation for ADMIN users.

## Requirements

### Requirement: Admin Layout Guard

The `/admin` layout MUST call `auth()`, verify `session.user.role === "ADMIN"`, and redirect non-admin users to `/` using `redirect()` from `next/navigation`.

#### Scenario: Admin user accesses admin layout

- GIVEN a user with role ADMIN is authenticated
- WHEN they navigate to any `/admin/*` page
- THEN the layout passes the guard and renders children normally

#### Scenario: Client user is redirected

- GIVEN a user with role CLIENT is authenticated
- WHEN they navigate to `/admin`
- THEN they are redirected to `/`

#### Scenario: Unauthenticated user is redirected

- GIVEN a user is not authenticated
- WHEN they navigate to `/admin`
- THEN they are redirected to `/`

### Requirement: Dashboard Page

The `/admin` page MUST display the total product count, the count of orders with status PENDING, and a list of the 5 most recent orders.

#### Scenario: Dashboard shows entity counts

- GIVEN the database has products and orders
- WHEN an admin visits `/admin`
- THEN the dashboard shows total products count, pending orders count, and 5 recent orders

#### Scenario: Empty state

- GIVEN the database has no products or orders
- WHEN an admin visits `/admin`
- THEN the dashboard shows 0 for counts and an empty recent orders section

### Requirement: Navbar Admin Link

The navbar MUST render a link to `/admin` only when `session.user.role === "ADMIN"`.

#### Scenario: Admin sees admin link

- GIVEN an authenticated user with role ADMIN
- WHEN the navbar renders
- THEN it includes a link labeled "Admin" pointing to `/admin`

#### Scenario: Client does not see admin link

- GIVEN an authenticated user with role CLIENT
- WHEN the navbar renders
- THEN the admin link is NOT present
