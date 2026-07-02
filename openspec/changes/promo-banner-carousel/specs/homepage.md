# Delta for Homepage

## MODIFIED Requirements

### Requirement: Hero Section

The homepage MUST render a full-width hero section. When active banners exist, it SHALL render the `BannerCarousel` component. When no banners are active, it MUST render the static hero with headline, subheadline, and CTA as fallback.
(Previously: Always renders static hero with hardcoded headline and content)

#### Scenario: Banners exist → carousel renders

- GIVEN banners with `isActive: true` exist in the database
- WHEN the homepage loads
- THEN the `BannerCarousel` component renders with those banners
- AND the static fallback hero content is NOT displayed

#### Scenario: No banners → static fallback

- GIVEN no banners have `isActive: true`
- WHEN the homepage loads
- THEN the static hero renders with "Bienvenido a PawPets" headline and description
- AND no carousel UI elements are visible

#### Scenario: Fallback gradient on broken image

- GIVEN a banner has an unreachable `imageUrl`
- WHEN the carousel renders that slide
- THEN a fallback gradient background is shown instead of the broken image
- AND the slide title and link remain visible

#### Scenario: Carousel auto-rotation resets on manual nav

- GIVEN the carousel is auto-rotating (5s interval)
- WHEN the user clicks prev/next or a dot indicator
- THEN the auto-rotation timer resets
- AND the selected slide is displayed immediately

## ADDED Requirements

### Requirement: BannerCarousel Component

The `BannerCarousel` client component MUST receive a `banners` array prop and render an auto-rotating slideshow with prev/next arrows and dot indicators. It MUST use `useState` for current index and `useEffect` for auto-rotation (5s, pauses on hover).

#### Scenario: Auto-rotation advances slides

- GIVEN the carousel is displaying slide N
- WHEN 5 seconds elapse without user interaction
- THEN the carousel advances to slide N+1
- AND the corresponding dot indicator highlights

#### Scenario: Wraps to first slide

- GIVEN the carousel is displaying the last slide
- WHEN auto-rotation ticks or user clicks "next"
- THEN the carousel wraps to the first slide
- AND the first dot indicator highlights

#### Scenario: Pause on hover

- GIVEN the carousel is auto-rotating
- WHEN the user hovers over the carousel area
- THEN auto-rotation pauses
- WHEN the user moves the cursor away
- THEN auto-rotation resumes after reset interval

#### Scenario: Dot navigation

- GIVEN the carousel displays 3 slides
- WHEN the user clicks the third dot
- THEN the third slide is displayed
- AND the third dot is highlighted as active

#### Scenario: Priority loading on first slide

- GIVEN the carousel renders
- THEN the first slide's image uses `priority` loading
- AND subsequent slides use lazy loading

### Requirement: Banner Data Query

The homepage server component MUST call `getActiveBanners()` to fetch banners ordered by `displayOrder` with `isActive: true`.

#### Scenario: Query returns ordered results

- GIVEN banners with displayOrder 2, 1, 3 (all active)
- WHEN `getActiveBanners()` executes
- THEN banners are returned in order 1, 2, 3
