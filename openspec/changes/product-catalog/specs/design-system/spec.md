# Delta for Design System

## MODIFIED Requirements

### Requirement: Core Layout Components

The system MUST provide a Navbar and Footer rendered on all pages via the root layout. The Navbar MUST include logo, **SearchBar component**, cart icon, login link, **category links using query-param format**, and a responsive hamburger menu below 768px.
(Previously: Navbar had raw `<input>` search and path-based category links)

#### Scenario: Navbar renders at desktop (unchanged)

- GIVEN the root layout includes the Navbar
- WHEN the home page loads on viewport ≥ 768px
- THEN the Navbar displays logo, search field, cart icon, and login link horizontally

#### Scenario: Category links use query params

- GIVEN the Navbar or Footer renders a category link for Perros
- WHEN inspected
- THEN the href MUST be `/productos?categoria=perros` (not `/productos/perros`)

#### Scenario: SearchBar navigates on submit

- GIVEN a visitor types "alimento" in the SearchBar
- WHEN they press Enter
- THEN the browser navigates to `/productos?q=alimento`

#### Scenario: Responsive hamburger menu (unchanged)

- GIVEN the Navbar renders on viewport < 768px
- WHEN the hamburger icon is clicked
- THEN navigation links toggle visibility

#### Scenario: Footer renders on all pages (unchanged)

- GIVEN the root layout includes the Footer
- WHEN any page loads
- THEN the Footer shows sitemap links, social media placeholder icons, and copyright text

## Technical Notes

- SearchBar: Client component wrapping `<form>` that navigates via `useRouter().push()`
- Import path: `@/components/ui/SearchBar`
- Search input styling: same visual appearance as current raw `<input>` (border, padding, focus ring)
- Navbar category links to update: Perros, Gatos, Aves, Peces, Roedores (5 links)
- Footer category links to update: Perros, Gatos, Aves, Peces, Roedores (5 links)
