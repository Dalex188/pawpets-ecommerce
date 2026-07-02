# Admin Orders Specification

## Purpose

Enable admins to view all orders, inspect order details, and update order status.

## Requirements

### Requirement: Orders List Page

The system MUST display a table at `/admin/orders` with columns: order number, customer name, customer email, date, total, status, and an actions link to view details.

#### Scenario: Admin views all orders

- GIVEN the database has orders from multiple users
- WHEN an admin navigates to `/admin/orders`
- THEN the table shows all orders regardless of ownership, ordered by newest first

#### Scenario: No orders exist

- GIVEN no orders in the database
- WHEN an admin visits `/admin/orders`
- THEN the table shows an empty state message

### Requirement: Order Detail Page

The system MUST render order details at `/admin/orders/[id]` including: order items (name, quantity, price, line total), shipping info, current status badge, and a status update dropdown.

#### Scenario: Admin views order detail

- GIVEN an order with ID "ord-001" exists with items and shipping data
- WHEN an admin navigates to `/admin/orders/ord-001`
- THEN the page displays items table, shipping address, status badge, and a status dropdown

#### Scenario: Order not found

- GIVEN no order with the given ID
- WHEN an admin navigates to `/admin/orders/invalid-id`
- THEN the page calls `notFound()`

### Requirement: Update Order Status

The system MUST provide a server action that updates order status. Only transitions from PENDING to CONFIRMED or CANCELLED SHALL be allowed. The action MUST re-verify the caller has role ADMIN.

#### Scenario: Admin confirms an order

- GIVEN an order with status PENDING
- WHEN an admin selects CONFIRMED from the status dropdown
- THEN the order status updates to CONFIRMED and the detail page reflects the change

#### Scenario: Admin cancels an order

- GIVEN an order with status PENDING
- WHEN an admin selects CANCELLED from the status dropdown
- THEN the order status updates to CANCELLED

#### Scenario: Non-admin cannot update status

- GIVEN a CLIENT user
- WHEN they call the update-order-status server action directly
- THEN the action returns an authorization error and the status is unchanged

### Requirement: Admin Order Queries

Admin order queries MUST NOT enforce the ownership guard used in customer-facing queries. Admins SHALL see all orders in the system.

#### Scenario: Admin sees all users' orders

- GIVEN orders belonging to user A and user B
- WHEN the admin order list query executes
- THEN both user A's and user B's orders are returned
