# Tasks: Promo Banner Carousel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550-750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Schema + data + actions → PR 2: Carousel + homepage → PR 3: Admin UI |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Schema + data layer + server actions + tests | PR 1 | base: main. Migration, banners.ts, admin-banners.ts, action tests |
| 2 | BannerCarousel + homepage integration | PR 2 | base: main. Component + homepage conditional render + tests |
| 3 | Admin CRUD pages + sidebar | PR 3 | base: main. List, form, create/edit pages, sidebar link, component tests |

## Phase 1: Schema & Data Layer

- [ ] 1.1 Add `Banner` model to `prisma/schema.prisma` (8 cols, no relations) — FR:DAT-01
- [ ] 1.2 Run `npx prisma migrate dev --name add_banner` — FR:DAT-01-SC1
- [ ] 1.3 Run `npx prisma generate`
- [ ] 1.4 Create `src/lib/banners.ts` with `getActiveBanners()` (ordered by displayOrder, filtered isActive) — FR:HOME-01, HOME-03-SC1
- [ ] 1.5 Write tests: returns ordered active banners, excludes inactive — FR:HOME-02-SC1, HOME-03-SC1

## Phase 2: Server Actions

- [ ] 2.1 Create `src/lib/actions/admin-banners.ts`: `createBanner`, `updateBanner`, `toggleBannerActive`, `deleteBanner`, `reorderBanners` — FR:ADM-01–ADM-05
- [ ] 2.2 Write tests: validation, success, requireAdmin guard per action — FR:ADM-01, ADM-02

## Phase 3: BannerCarousel Component

- [ ] 3.1 Create `src/components/ui/BannerCarousel.tsx`: auto-rotate (5s), prev/next, dot nav, wrap, pause-on-hover, fallback gradient, priority on slide 0 — FR:HOME-02-SC1, HOME-03
- [ ] 3.2 Write tests: index changes on click, auto-rotation tick, hover pause, dot nav, fallback gradient, priority prop — FR:HOME-03-SC1–SC5

## Phase 4: Homepage Integration

- [ ] 4.1 Modify `src/app/page.tsx`: call `getActiveBanners()`, conditional carousel vs static fallback — FR:HOME-01, HOME-02
- [ ] 4.2 Write tests: carousel rendered when banners exist, static hero when empty — FR:HOME-02-SC1, HOME-02-SC2

## Phase 5: Admin CRUD UI

- [ ] 5.1 Create `src/components/admin/BannerForm.tsx` (reusable client form) — FR:ADM-04
- [ ] 5.2 Create `src/components/admin/DeleteBannerButton.tsx` (confirm dialog) — FR:ADM-05
- [ ] 5.3 Create `src/app/admin/banners/page.tsx` (table, toggle, delete, up/down reorder) — FR:ADM-03
- [ ] 5.4 Create `src/app/admin/banners/new/page.tsx` — FR:ADM-04-SC1
- [ ] 5.5 Create `src/app/admin/banners/[id]/page.tsx` — FR:ADM-04-SC2
- [ ] 5.6 Add `"Banners"` link to `AdminSidebar.tsx` NAV_LINKS — FR:ADM-06
- [ ] 5.7 Write tests: list renders data + empty state, form validation, sidebar link visible — FR:ADM-03, ADM-04, ADM-06

## Phase 6: Integrity

- [ ] 6.1 `npm run build` — zero errors
- [ ] 6.2 `npm run test` — all pass
