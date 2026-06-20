# Proposal: Scaffold and Schema

## Intent

Foundation for all 7 modules. Establishes project init, DB schema, core layout, auth skeleton, and testing setup in one focused pass.

## Scope

### In Scope
- Next.js 14+ App Router, TypeScript, Tailwind CSS, all dependencies
- Folder structure + path aliases (`@/`)
- PostgreSQL + Prisma: full MVP schema (Users, Accounts/Sessions, Categories, Subcategories, Products, Orders, OrderItems)
- Seed: fixed admin user + all 7 categories with subcategories
- Layout: Navbar (responsive, mobile hamburger), Footer
- Tailwind config with brand palette + Nunito via `next/font`
- Shared types + Prisma client singleton
- NextAuth.js skeleton (AuthOptions + PrismaAdapter + SessionProvider)
- Vitest config + one passing test

### Out of Scope
- Auth routes (login, register — next module)
- Catalog pages, product detail, cart, checkout
- Admin dashboard, API routes, image upload

## Capabilities

### New Capabilities
- `project-scaffold`: Project init, folder structure, aliases, deps
- `data-schema`: Prisma schema (all MVP tables), migrations, seed
- `auth-core`: NextAuth.js config with PrismaAdapter + SessionProvider
- `design-system`: Tailwind theme, Nunito, Navbar, Footer, shared types

### Modified Capabilities
- None (first change)

## Approach

Schema-first Prisma model all entities upfront to avoid migration churn. NextAuth.js v5 skeleton with PrismaAdapter — route handlers deferred. Root `layout.tsx` wraps Navbar/Footer and SessionProvider. Vitest with `@vitejs/plugin-react`. Seed via `prisma/seed.ts`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `/` | New | Next.js project root |
| `prisma/schema.prisma` | New | All MVP database models |
| `prisma/seed.ts` | New | Admin + categories seed |
| `src/lib/prisma.ts` | New | Prisma client singleton |
| `src/lib/auth.ts` | New | NextAuth.js config |
| `src/components/layout/` | New | Navbar, Footer |
| `tailwind.config.ts` | New | Brand palette + Nunito |
| `vitest.config.ts` | New | Vitest setup |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Schema changes later | Medium | Schema-first design, extensible models |
| Next.js breaking changes | Low | Pin exact version |
| Vitest misconfig | Low | Run `vitest run` immediately |

## Rollback Plan

Delete project + re-init, or `prisma migrate reset` for schema issues only. Git: `git reset --hard`.

## Dependencies

Node.js 18+ LTS, PostgreSQL (local/Docker), npm.

## Success Criteria

- [ ] `npm run dev` starts without errors
- [ ] `npx prisma generate` + `npx prisma db push` succeed
- [ ] Seed populates admin user + 7 categories with subcategories
- [ ] Navbar (responsive, hamburger) and Footer render
- [ ] `npx vitest run` passes at least one test
- [ ] SessionProvider wraps the app without errors
