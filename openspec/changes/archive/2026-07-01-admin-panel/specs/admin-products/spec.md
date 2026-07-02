# Admin Products Specification

## Purpose

Enable admins to manage the product catalog: list, create, edit, and delete products.

## Requirements

### Requirement: Product List Page

The system MUST display a table at `/admin/products` with columns: image thumbnail, name, category, stock, price, and actions (edit/delete).

#### Scenario: Admin views product list

- GIVEN the database contains products
- WHEN an admin navigates to `/admin/products`
- THEN the page renders a table with image thumbnail, name, category name, stock quantity, formatted price, and edit/delete action buttons

#### Scenario: Empty catalog

- GIVEN no products exist
- WHEN an admin visits `/admin/products`
- THEN the table shows an empty state message

### Requirement: Create Product

The system MUST provide a form at `/admin/products/new` that accepts: name, slug, description, brand, price, stock, category, subcategory, images (JSON URL textarea), and featured toggle. On submission, the system MUST create the product via a server action and redirect to the product list.

#### Scenario: Admin creates a product

- GIVEN an admin is on `/admin/products/new`
- WHEN they submit the form with valid data for all required fields
- THEN the product is created in the database and the admin is redirected to `/admin/products`

#### Scenario: Duplicate slug rejected

- GIVEN a product with slug "dog-food" exists
- WHEN an admin submits a new product with slug "dog-food"
- THEN the server action returns a validation error

### Requirement: Edit Product

The system MUST pre-fill the product form at `/admin/products/[id]/edit` with existing product data fetched by Prisma cuid.

#### Scenario: Admin edits a product

- GIVEN a product with ID "abc123" exists
- WHEN an admin navigates to `/admin/products/abc123/edit`
- THEN the form is pre-filled with the product's current name, slug, description, brand, price, stock, category, subcategory, images, and featured status

#### Scenario: Non-existent product

- GIVEN no product with ID "invalid-id" exists
- WHEN an admin navigates to `/admin/products/invalid-id/edit`
- THEN the page calls `notFound()`

### Requirement: Delete Product

The system MUST delete a product via server action after confirmation. The action MUST check for existing OrderItems and reject deletion if the product is referenced.

#### Scenario: Admin deletes a product

- GIVEN a product with no order items exists
- WHEN an admin confirms deletion
- THEN the product is deleted from the database and the list refreshes

#### Scenario: Product has existing orders

- GIVEN a product referenced by at least one OrderItem
- WHEN an admin attempts to delete it
- THEN the server action returns an error and the product is not deleted
