# Delta for Design System

## MODIFIED Requirements

### Requirement: Core Layout Components

The system MUST provide a Navbar and Footer rendered on all pages via the root layout. The Navbar MUST include logo, category links, search bar, cart icon, and a responsive hamburger menu below 768px. The Navbar MUST detect auth state and conditionally render a profile link (with user icon) when authenticated, or an "Iniciar sesión" button when not.
(Previously: Navbar had a static login link with no auth awareness)

#### Scenario: Navbar renders for authenticated user

- GIVEN the user is signed in
- WHEN the Navbar renders on viewport ≥ 768px
- THEN it displays logo, category links, search, cart, and a profile link (user icon + name)

#### Scenario: Navbar renders for anonymous user

- GIVEN the user is not signed in
- WHEN the Navbar renders on viewport ≥ 768px
- THEN it displays logo, category links, search, cart, and an "Iniciar sesión" button

#### Scenario: Responsive hamburger menu

- GIVEN the Navbar renders on viewport < 768px
- WHEN the hamburger icon is clicked
- THEN navigation links toggle visibility

#### Scenario: Footer renders on all pages

- GIVEN the root layout includes the Footer
- WHEN any page loads
- THEN the Footer shows sitemap links, social media placeholder icons, and copyright text
