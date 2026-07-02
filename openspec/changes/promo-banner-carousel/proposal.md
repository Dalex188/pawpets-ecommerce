# Proposal: Promo Banner Carousel

## Intent

Homepage hero is static HTML — can't be updated without code deploys. Merchants need to promote seasonal offers, new arrivals, or campaigns without touching the codebase. A data-driven carousel lets admins manage banners dynamically and gives visitors a richer, rotating first impression.

## Scope

### In Scope
- Banner Carousel component replacing the static hero on the homepage
- Admin CRUD (list, create, edit, reorder, toggle active, delete) at `/admin/banners`
- Banner model: title, imageUrl, linkUrl (optional), displayOrder, isActive
- Auto-rotate carousel with prev/next arrows + dot navigation
- "Banners" nav item in admin sidebar

### Out of Scope
- Image upload service (imageUrl is a plain text field — external URL or manual path)
- Scheduling (publish start/end date)
- Analytics (impressions, clicks)
- Multi-language banner titles

## Capabilities

### New Capabilities
- `admin-banners`: Admin CRUD interface for promotional banners

### Modified Capabilities
- `homepage`: Static hero replaced by data-driven `BannerCarousel` component
- `admin-core`: New sidebar nav item pointing to `/admin/banners`
- `data-schema`: Add `Banner` model to Prisma schema

## Approach

**Schema**: New `Banner` model: `id` (cuid), `title`, `imageUrl`, `linkUrl?`, `displayOrder` (int), `isActive` (bool default true), timestamps.

**Data layer**: `src/lib/banners.ts` — `getActiveBanners()` (ordered by `displayOrder`, filtered by `isActive: true`), used by homepage RSC.

**Carousel component**: `src/components/ui/BannerCarousel.tsx` — "use client". Receives banners array as props. Uses `useState` for current index, `useEffect` for auto-rotation (5s interval, pauses on hover). Renders prev/next buttons (absolute positioned) + dot indicators. Images use `<Image>` from Next.js with `fill` and priority loading on first slide. Fallback gradient if image fails.

**Admin CRUD**: `src/lib/actions/admin-banners.ts` — server actions following `admin-products.ts` pattern (`requireAdmin`, `ActionResult<T>`). List page at `src/app/admin/banners/page.tsx` (table with reorder drag handles, toggle, delete). Form at `src/app/admin/banners/[id]/page.tsx` (reuses create form, optional route param for edit; new = `new`).

**Sidebar**: New `{ label: "Banners", href: "/admin/banners" }` entry in `AdminSidebar.tsx` NAV_LINKS.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Large/unsized images break carousel layout | Med | Fixed aspect ratio container, Next.js Image with `fill` + `sizes` |
| Auto-rotate conflicts with manual nav | Low | Manual click resets interval timer |
| No banners configured = empty carousel | Med | Show single fallback hero (current static content) when `getActiveBanners()` returns empty |

## Rollback Plan

- **Schema**: New model only (no destructive migration), rollback = remove Banner model + migration revert
- **Pages**: `git revert <commit>` for home page + admin route changes
- Sidebar nav: single line revert in `AdminSidebar.tsx`

## Dependencies

- Prisma schema migration (`npx prisma migrate dev`)
- Existing admin layout guard (reused, no changes)

## Success Criteria

- [ ] `getActiveBanners()` returns only banners with `isActive: true`, ordered by `displayOrder`
- [ ] Homepage shows carousel with auto-rotation (5s) when banners exist
- [ ] Prev/next arrows and dot indicators navigate correctly
- [ ] Admin can create, edit, reorder, toggle, and delete banners
- [ ] Empty state falls back to static hero (no crash)
- [ ] `npm run build` succeeds with zero errors
