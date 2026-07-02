# Tasks: Homepage Redesign

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

| Field | Value |
|-------|-------|
| Estimated changed lines | ~310–350 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Schema + seed + query + all components | Single PR | All phases together under 400 lines |

## Phase 1: Schema & Data

- [x] 1.1 Add `isFeatured Boolean @default(false)` to Product model in `prisma/schema.prisma`
- [x] 1.2 Run `npx prisma migrate dev --name add-isFeatured`
- [x] 1.3 Mark 6 products across ≥3 categories as `isFeatured: true` in `prisma/seed.ts`
- [x] 1.4 Add `getFeaturedProducts(limit?: number)` to `src/lib/products.ts` — featured first, fallback to newest

## Phase 2: Hero Section

- [x] 2.1 Create `src/components/home/HeroSection.tsx` — server component, full-width bg image (picsum.photos), dark overlay, headline "Todo para tu mascota", subheadline, CTA "Ver productos" → `/productos`, responsive text sizing

## Phase 3: Category Grid

- [x] 3.1 Create `src/components/home/CategoryGrid.tsx` — server component, reads via `getCategories()`, renders 7 cards with hardcoded emoji map by slug, responsive grid (2→4→7 cols)
- [x] 3.2 Each category card links to `/productos?categoria={slug}`

## Phase 4: Featured Products

- [x] 4.1 Create `src/components/home/FeaturedProducts.tsx` — server component, calls `getFeaturedProducts(6)`, renders via `ProductGrid`, handles empty state gracefully

## Phase 5: Page Composition

- [x] 5.1 Update `src/app/page.tsx` — compose HeroSection + CategoryGrid + FeaturedProducts, remove old inline hero text and newest-products grid

## Phase 6: Testing

- [x] 6.1 Test `getFeaturedProducts()` returns featured products correctly (featured-first order)
- [x] 6.2 Test fallback to newest when no featured products exist
- [x] 6.3 Test HeroSection renders heading and CTA link
- [x] 6.4 Test CategoryGrid renders all 7 cards with emojis and category links
- [x] 6.5 Test FeaturedProducts renders products or empty state
- [x] 6.6 Test homepage (`page.tsx`) composes all three sections
