# Tasks: Scaffold and Schema

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~745 (23 files, all new) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Schema + Seed) → PR 3 (Auth + UI Shell + Tests) |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

**Note**: ~745 lines far exceeds the 400-line review budget. The main driver is `prisma/schema.prisma` (~180 lines) and `prisma/seed.ts` (~80 lines). A `size:exception` or chained PRs is required before apply.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: scaffold configs + types + utils + db singleton + vitest | PR 1 | ~140 lines — base for everything; merges to main |
| 2 | Data Schema: Prisma schema + seed | PR 2 | ~260 lines — standalone schema definition + seed; base = main |
| 3 | Auth + UI Shell + Tests: auth config, tailwind, Navbar/Footer, layout, smoke test | PR 3 | ~345 lines — the largest but all components depend on PR 1 & 2; base = main |

Decision needed: **Yes** — 3× over the review budget. Choose `size:exception` (single PR with maintainer approval) or `stacked-to-main` (3 sequential PRs).

---

## Phase 1: Foundation — Project Configs & Folder Structure

- [x] 1.1 Create `package.json` with all deps (next, react, prisma, next-auth, zustand, tailwind, vitest, clsx, tw-merge) and scripts (dev, build, test, prisma:gen, prisma:push, prisma:seed)
- [x] 1.2 Create `tsconfig.json` with strict mode, `@/*` → `./src/*` path alias
- [x] 1.3 Create `next.config.ts` (minimal)
- [x] 1.4 Create `postcss.config.js` (tailwind + autoprefixer)
- [x] 1.5 Create `.gitignore` + `.env.example` (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [x] 1.6 Create `src/` subdirs: `app`, `components/layout`, `components/ui`, `lib`, `types`, `__tests__`

## Phase 2: Core Types & Library Utilities

- [x] 2.1 Create `src/types/index.ts` — `UserRole` enum, `NavLink` interface, shared type exports
- [x] 2.2 Create `src/lib/db.ts` — Prisma client singleton (`globalThis` pattern for hot-reload)
- [x] 2.3 Create `src/lib/utils.ts` — `cn()` helper (clsx + twMerge)

## Phase 3: Data Schema & Seed

- [x] 3.1 Create `prisma/schema.prisma` — all 8 models (User, Account, Session, Category, Subcategory, Product, Order, OrderItem) with enums (`UserRole`, `OrderStatus`), relations, indexes
- [x] 3.2 Create `prisma/seed.ts` — idempotent seed: admin user (upsert) + 7 categories with subcategories (createMany skipDuplicates)

## Phase 4: Auth Core

- [ ] 4.1 Create `src/lib/auth.ts` — AuthOptions with PrismaAdapter, JWT callback (inject role), session callback
- [ ] 4.2 Create `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler (GET/POST)
- [ ] 4.3 Create `src/components/ui/ClientSessionProvider.tsx` — `"use client"` wrapping SessionProvider

## Phase 5: Design System & Layout Shell

- [ ] 5.1 Create `tailwind.config.ts` — brand palette (`#1573B6`, `#57C2D1`, `#E28A37`, `#FFFFFF`, `#1F2937`), Nunito via `next/font`
- [ ] 5.2 Create `src/app/globals.css` — `@tailwind base/components/utilities` directives
- [ ] 5.3 Create `src/app/layout.tsx` — root layout: Nunito font class, ClientSessionProvider, Navbar, Footer, children
- [ ] 5.4 Create `src/app/page.tsx` — home placeholder with centered heading
- [ ] 5.5 Create `src/components/layout/Navbar.tsx` — responsive nav: logo, search, cart icon, login link, admin link
- [ ] 5.6 Create `src/components/layout/NavbarMobile.tsx` — client component: hamburger toggle, slide-out menu
- [ ] 5.7 Create `src/components/layout/Footer.tsx` — multi-column footer: sitemap links, social placeholders, copyright

## Phase 6: Testing Configuration

- [ ] 6.1 Create `vitest.config.ts` — `@vitejs/plugin-react`, resolve alias for `@/`, glob `**/__tests__/**/*.test.ts`
- [ ] 6.2 Create `src/__tests__/setup.test.ts` — smoke test (`true === true`) + alias import test via `@/lib/utils`
- [ ] 6.3 Run `npm install && npx prisma generate && npx vitest run` to validate end-to-end
