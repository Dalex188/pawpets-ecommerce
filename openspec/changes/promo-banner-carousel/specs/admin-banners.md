# Admin Banners Specification

## Purpose

Admin CRUD interface for managing promotional banners: list, create, edit, reorder, toggle active, and delete. Follows the existing `admin-products` pattern for server actions and route structure.

## Requirements

### Requirement: Admin Guard on All Actions

Every banner server action MUST call `requireAdmin()` and reject non-admin users.

#### Scenario: Admin creates a banner

- GIVEN the user has role ADMIN
- WHEN `createBanner(formData)` is called with valid title, imageUrl, displayOrder
- THEN a new Banner record is created
- AND `{ success: true, data: Banner }` is returned

#### Scenario: Non-admin is redirected

- GIVEN the user has role CLIENT or is unauthenticated
- WHEN any banner action is invoked
- THEN the response redirects to `/`

### Requirement: Banner List Page

`/admin/banners` MUST render a table with all banners showing title, active status, display order, and action buttons (edit, toggle, delete). Reordering SHALL use drag handles or up/down buttons.

#### Scenario: List renders with data

- GIVEN banners exist in the database
- WHEN an admin visits `/admin/banners`
- THEN a table displays all banners ordered by `displayOrder`
- AND each row shows title, active badge, and action buttons

#### Scenario: Empty list

- GIVEN no banners exist
- WHEN an admin visits `/admin/banners`
- THEN a message "No banners configured" is shown
- AND a "Create banner" button is displayed

### Requirement: Create/Edit Banner Form

`/admin/banners/[id]` MUST render a form for creating (id=`new`) or editing (existing id) a banner. Fields: title, imageUrl, linkUrl, displayOrder, isActive toggle.

#### Scenario: Create new banner

- GIVEN an admin navigates to `/admin/banners/new`
- WHEN they submit the form
- THEN the banner is created
- AND they are redirected to `/admin/banners`

#### Scenario: Edit existing banner

- GIVEN a banner with id exists
- WHEN an admin navigates to `/admin/banners/{id}`
- THEN the form is pre-populated with the banner's current values

#### Scenario: Form validation fails

- GIVEN an admin submits the form with empty title
- WHEN `createBanner` or `updateBanner` runs
- THEN `{ success: false, error: "Title is required" }` is returned
- AND no database mutation occurs

### Requirement: Toggle and Delete

The list page MUST support toggling `isActive` and deleting banners via server actions.

#### Scenario: Toggle active state

- GIVEN a banner with `isActive: true`
- WHEN `toggleBannerActive(id)` is called
- THEN the banner's `isActive` flips to `false`

#### Scenario: Delete banner

- GIVEN a banner exists
- WHEN `deleteBanner(id)` is called
- THEN the banner record is removed from the database
- AND `{ success: true }` is returned

### Requirement: Sidebar Navigation

The admin sidebar (`AdminSidebar.tsx`) MUST include a "Banners" link pointing to `/admin/banners`.

#### Scenario: Banner link visible

- GIVEN an admin is viewing any `/admin/*` page
- WHEN the sidebar renders
- THEN the NAV_LINKS array includes `{ label: "Banners", href: "/admin/banners" }`
