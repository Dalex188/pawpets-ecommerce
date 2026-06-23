# Design System Specification

## Purpose

Configure the Tailwind theme with the brand color palette and Nunito font family. Provide core layout components — Navbar (responsive) and Footer — rendered on every page via the root layout.

## Requirements

### Requirement: Tailwind Brand Theme

The Tailwind config MUST extend colors to match the brand palette and SHALL configure Nunito as the default sans-serif font via `next/font`.

#### Scenario: Brand colors available as Tailwind utilities

- GIVEN a component using `bg-primary`, `bg-secondary`, `bg-accent`, `bg-background`, and `text-text`
- WHEN rendered in the browser
- THEN computed colors are #1573B6, #57C2D1, #E28A37, #FFFFFF, and #1F2937 respectively

#### Scenario: Nunito loads as default font

- GIVEN the root layout loads Nunito via next/font
- WHEN the page renders
- THEN the computed `font-family` includes Nunito

### Requirement: Core Layout Components

The system MUST provide a Navbar and Footer rendered on all pages via the root layout. The Navbar MUST include logo, search placeholder, cart icon, login link, and a responsive hamburger menu below 768px.

#### Scenario: Navbar renders at desktop

- GIVEN the root layout includes the Navbar
- WHEN the home page loads on viewport ≥ 768px
- THEN the Navbar displays logo, search field, cart icon, and login link horizontally

#### Scenario: Responsive hamburger menu

- GIVEN the Navbar renders on viewport < 768px
- WHEN the hamburger icon is clicked
- THEN navigation links toggle visibility

#### Scenario: Footer renders on all pages

- GIVEN the root layout includes the Footer
- WHEN any page loads
- THEN the Footer shows sitemap links, social media placeholder icons, and copyright text
