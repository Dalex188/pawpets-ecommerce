# Design: Promo Banner Carousel

## Technical Approach

Data-driven banner carousel that replaces the static hero on the homepage. Admin CRUD via server actions (same pattern as `admin-products.ts`). RSC fetches banners → passes array as props to `"use client"` carousel with auto-rotation. Fallback to static hero when no banners exist.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Carousel state in RSC vs client | RSC would lose interactivity (hover pause, instant nav) | Client `useState`+`useEffect` — carousel MUST be interactive |
| Third-party carousel lib vs hand-rolled | Lib saves time but adds dep + bundle weight | Hand-rolled — <50 LOC, zero deps, full control over fallback behavior |
| Image upload vs plain URL field | Upload adds S3 complexity, out of scope per proposal | Plain `imageUrl` text field — external URLs only |
| Reorder via drag-and-drop vs up/down buttons | DnD lib is heavy for a simple ordering | Up/down buttons in the list — simpler, accessible, matches MVP scope |
| Single form page vs separate create/edit routes | Products use `new/` + `[id]/` pattern | Follow products pattern: `/admin/banners/new` + `/admin/banners/[id]` |

## Data Flow

```
Homepage RSC (page.tsx)
  │
  ├─ getActiveBanners()  →  db.banner.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } })
  │
  ├─ [banners.length > 0] ──→  <BannerCarousel banners={banners} />
  │                                  │
  │                                  └─ useState(currentIndex)
  │                                  └─ useEffect(autoRotate, pauseOnHover)
  │                                  └─ prev/next buttons → setIndex()
  │                                  └─ dot indicators → setIndex()
  │
  └─ [banners.length === 0] ──→  <StaticHero /> (current fallback)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `Banner` model (8 columns, no relations) |
| `src/lib/banners.ts` | Create | `getActiveBanners()` query function |
| `src/lib/actions/admin-banners.ts` | Create | Server actions: create, update, toggle, delete, reorder |
| `src/components/ui/BannerCarousel.tsx` | Create | Client carousel with auto-rotate, nav, fallback gradient |
| `src/components/admin/BannerForm.tsx` | Create | Reusable form client component (match ProductForm pattern) |
| `src/components/admin/DeleteBannerButton.tsx` | Create | Delete with confirmation modal |
| `src/app/admin/banners/page.tsx` | Create | List page with table, toggle, delete, up/down reorder |
| `src/app/admin/banners/new/page.tsx` | Create | Create banner page |
| `src/app/admin/banners/[id]/page.tsx` | Create | Edit banner page |
| `src/components/admin/AdminSidebar.tsx` | Modify | Add `{ label: "Banners", href: "/admin/banners" }` to NAV_LINKS |
| `src/app/page.tsx` | Modify | Replace static hero section with conditional carousel/fallback |

## Server Actions API

```typescript
// src/lib/actions/admin-banners.ts
"use server";

export interface ActionResult<T> { success: boolean; error?: string; data?: T; }

// All server actions call requireAdmin() internally

export async function createBanner(formData: FormData): Promise<ActionResult<Banner>>
  // Validate: title, imageUrl required. displayOrder defaults to max+1.
  // Returns { success: true, data: banner }

export async function updateBanner(id: string, formData: FormData): Promise<ActionResult<Banner>>
  // Validate same fields, re-fetch to confirm exists

export async function toggleBannerActive(id: string): Promise<ActionResult<Banner>>
  // Flips isActive boolean. No validation needed.

export async function deleteBanner(id: string): Promise<ActionResult<void>>
  // Deletes by id. No referential integrity concerns.

export async function reorderBanners(ids: string[]): Promise<ActionResult<void>>
  // Accepts ordered array of banner IDs, updates each displayOrder to its index.
```

## Carousel Behavior

```
States: IDLE → ROTATING → PAUSED (on hover) → ROTATING (on leave)

useState:
  currentIndex: number = 0

useEffect(autoRotate):
  - Set 5s interval
  - Clear + reset on manual nav (prev/next/dot click)
  - Clear entirely when isPaused=true (onMouseEnter)
  - Resume with new interval onMouseLeave

Slide wrapping:
  - next: (prev + 1) % banners.length
  - prev: (prev - 1 + banners.length) % banners.length

Image behavior:
  - Slide 0: <Image priority loading />
  - Slides 1..N: <Image loading="lazy" />
  - onError: swap src to fallback gradient CSS class

Empty state:
  - Parent RSC checks banners.length === 0 → renders static hero
  - Carousel never receives empty array
```

## Route Design

| Route | Role |
|-------|------|
| `/admin/banners` | Table list with toggle/delete/reorder actions |
| `/admin/banners/new` | Create form (no default values) |
| `/admin/banners/[id]` | Edit form (pre-populated from DB) |

All routes guarded by existing admin layout (`layout.tsx` → `requireAdmin`).

## Interfaces / Contracts

```typescript
// Banner (Prisma model generated type)
interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// BannerCarousel props
interface BannerCarouselProps {
  banners: Pick<Banner, "title" | "imageUrl" | "linkUrl">[];
}

// BannerForm props (matches ProductForm pattern)
interface BannerFormProps {
  defaultValues?: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder?: number;
    isActive?: boolean;
  };
  action: (formData: FormData) => Promise<ActionResult<Banner>>;
  submitLabel: string;
  submitLoadingLabel: string;
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `getActiveBanners()` | Mock Prisma, assert order + isActive filter |
| Unit | Server actions | Mock `auth()` + `db`, test validation + success paths |
| Unit | Carousel state | Render with 3 banners, assert index changes on click, auto-rotation tick |
| Unit | Fallback gradient | Mock image `onError`, assert CSS class swap |
| Integration | Admin page renders | Render `/admin/banners` with one banner, assert table row |

## Migration / Rollout

1. `npx prisma migrate dev --name add_banner` — additive only (new table, no destructive changes)
2. Feature is additive — no migration of existing data required
3. Deploy alongside: old homepage unaffected until the code change lands

## Open Questions

None — all decisions are resolved against specs and existing patterns.
