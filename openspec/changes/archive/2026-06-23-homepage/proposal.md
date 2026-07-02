# Proposal: Homepage Redesign

## Intent

Current homepage is too minimal — text hero + 6 newest products don't showcase catalog breadth or drive conversion. This builds a real landing page that guides visitors to browse and buy.

## Scope

### In Scope
- Schema: `isFeatured Boolean @default(false)` on Product + migration
- Query: `getFeaturedProducts(limit?)` in `src/lib/products.ts`
- Seed: Mark ~6 products as featured in `prisma/seed.ts`
- Hero: background image, headline, subheadline, CTA → /productos
- Category grid: 7 cards with emoji icons → `/productos?categoria=...`
- Featured products: replace "newest" slice with `getFeaturedProducts()`, fallback to newest

### Out of Scope
- Newsletter, testimonials, trust badges, animations library, search in hero, admin panel for featured management, new Category model fields

## Capabilities

### New Capabilities
- `homepage`: Page layout — hero section, category grid, featured products

### Modified Capabilities
- `data-schema`: Add `isFeatured` to Product model; update seed with featured products

## Approach

- **Schema**: Add field to `schema.prisma`, run `db push`
- **Data**: `getFeaturedProducts(limit=6)` — `findMany` with `where: { isFeatured: true }`, fallback to newest
- **Seed**: Pick ~6 diverse products, set `isFeatured: true`
- **Hero**: `src/components/home/Hero.tsx` — picsum.photos bg (existing pattern), gradient overlay, headline, CTA
- **Categories**: `CategoryGrid.tsx` — map all categories, hardcoded emoji map per slug
- **Featured**: `FeaturedProducts.tsx` — call `getFeaturedProducts()`, render via `ProductGrid`
- **Page**: `src/app/page.tsx` orchestrates three sections
- **Responsive**: Hero stacks on mobile, grid goes 2-column

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Add `isFeatured` to Product |
| `prisma/seed.ts` | Modified | Mark featured products |
| `src/lib/products.ts` | Modified | Add `getFeaturedProducts()` |
| `src/app/page.tsx` | Modified | Replace layout with 3 sections |
| `src/components/home/` | New | Hero, CategoryGrid, FeaturedProducts |
| `prisma/migrations/` | New | Migration file |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hero image slow/fails | Low | picsum.photos + fallback bg color, lazy loading |

## Rollback Plan

1. Revert `page.tsx` to current layout
2. Revert `schema.prisma`, re-run `db push`
3. Revert `products.ts` and `seed.ts`

No data loss — `isFeatured` only affects display logic.

## Dependencies

- ProductCard, ProductGrid, SearchBar (existing)
- Prisma + Category model (existing)

## Success Criteria

- [ ] Hero renders with image, headline, subheadline, CTA button
- [ ] All 7 categories display as clickable cards
- [ ] Featured products section shows marked products
- [ ] Fallback to newest when no featured products exist
- [ ] Responsive on mobile (hero stacks, grid 2-col)
- [ ] `npm run build` passes
