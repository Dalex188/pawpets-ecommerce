# Design: Scaffold and Schema

## Technical Approach

Schema-first monolithic Prisma model for all 8 MVP entities upfront to avoid migration churn. Next.js 14 App Router scaffold with path aliases, responsive layout shell (Navbar + Footer), NextAuth.js v5 skeleton with JWT strategy, and Vitest smoke test. Execute strictly bottom-up: deps → schema → lib → components → configs.

## Architecture Decisions

### Decision: JWT Session Strategy over Database Sessions

**Choice**: JWT strategy with role embedded in token
**Alternatives considered**: Database sessions (NextAuth default with PrismaAdapter)
**Rationale**: Database sessions add latency on every page load. JWT with the `role` field injected in the `jwt` callback gives us zero-latency role checks via `session` callback. The Session table in Prisma exists only for PrismaAdapter compatibility — it will not be queried at runtime.

### Decision: Single Root Layout with Client/Server Split

**Choice**: Root `layout.tsx` is a server component wrapping a client `SessionProvider`
**Alternatives considered**: All-client layout, all-server with getServerSession
**Rationale**: `SessionProvider` requires client context. Isolate it to a thin `<ClientSessionProvider>` wrapper, keep the root layout server-renderable for SEO. `<Navbar>` and `<Footer>` are server components receiving session data; only the hamburger toggle and cart badge use client interactivity (`"use client"` scoped to sub-components).

### Decision: Flat Component Tree (No Atomic Design)

**Choice**: `components/ui/` for primitives, `components/layout/` for shells
**Alternatives considered**: Atomic Design (atoms/molecules/organisms)
**Rationale**: MVP has < 20 components. Flat structure with two directories is navigable and avoids premature abstraction. Atomic Design can be introduced when component count exceeds ~40.

## Data Flow

    Browser ──→ Next.js App Router ──→ Server Component (layout.tsx)
                 │                          │
                 │                    ClientSessionProvider
                 │                    (SessionContext)
                 │                          │
                 ├── Navbar ←── session ────┘
                 │     └── MobileMenu (client)
                 ├── page.tsx (children slot)
                 └── Footer

    Auth Flow:
    Login (deferred) ──→ [...nextauth]/route.ts ──→ PrismaAdapter ──→ PostgreSQL
         │                                                    │
         └── JWT (role: ADMIN) ←── jwt callback ←── database ──┘
              │
              └── session callback → session.user.role available app-wide

    Seed Flow:
    npx prisma db seed ──→ prisma/seed.ts ──→ prisma.user.upsert({ where: {email} })
                                                   │
                                                   └── prisma.category.createMany({ skipDuplicates: true })

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | Project metadata, all deps, scripts (dev, build, test, prisma cmds) |
| `tsconfig.json` | Create | Strict TS, `@/*` → `./src/*`, path aliases |
| `next.config.ts` | Create | Next.js config (currently minimal, extensible for images later) |
| `tailwind.config.ts` | Create | Brand palette extended, Nunito via next/font plugin |
| `postcss.config.js` | Create | Tailwind + autoprefixer |
| `vitest.config.ts` | Create | React plugin, path alias resolver, test glob `**/__tests__/**/*.test.ts` |
| `prisma/schema.prisma` | Create | All 8 MVP models with enums, relations, indexes |
| `prisma/seed.ts` | Create | Admin user + 7 categories + subcategories, idempotent via upsert |
| `src/app/globals.css` | Create | Tailwind directives `@tailwind base/components/utilities` |
| `src/app/layout.tsx` | Create | Root layout: Nunito font, ClientSessionProvider, Navbar, Footer |
| `src/app/page.tsx` | Create | Home placeholder with heading |
| `src/app/api/auth/[...nextauth]/route.ts` | Create | NextAuth route handler (GET/POST) |
| `src/lib/db.ts` | Create | Prisma client singleton (globalThis pattern for hot reload) |
| `src/lib/auth.ts` | Create | AuthOptions config: PrismaAdapter, JWT callback, role injection |
| `src/lib/utils.ts` | Create | `cn()` helper (clsx + twMerge), formatters |
| `src/components/layout/Navbar.tsx` | Create | Responsive nav: logo, search, cart icon, login link, admin link |
| `src/components/layout/NavbarMobile.tsx` | Create | Client component: hamburger toggle, slide-out menu |
| `src/components/layout/Footer.tsx` | Create | Multi-column footer: links, social placeholders, copyright |
| `src/components/ui/ClientSessionProvider.tsx` | Create | `"use client"` — wraps SessionProvider from next-auth/react |
| `src/types/index.ts` | Create | Shared TS interfaces/enums (UserRole, NavLink, etc.) |
| `src/__tests__/setup.test.ts` | Create | Smoke test: `true === true`, alias import test |
| `.env.example` | Create | Template for DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL |
| `.gitignore` | Create | node_modules, .next, .env, prisma shadow db |

## Interfaces / Contracts

```typescript
// src/types/index.ts
export enum UserRole {
  CLIENT = "CLIENT",
  ADMIN = "ADMIN",
}

export interface NavLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
  requiredRole?: UserRole;
}
```

```prisma
// prisma/schema.prisma — core entities
enum UserRole { CLIENT ADMIN }
enum OrderStatus { PENDING COMPLETED CANCELLED }

model User {
  id           String    @id @default(cuid())
  name         String?
  email        String    @unique
  emailVerified DateTime?
  passwordHash String?
  image        String?
  role         UserRole  @default(CLIENT)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  orders       Order[]
  accounts     Account[]
  sessions     Session[]
}

model Category { /* see spec */ }
model Subcategory { /* see spec */ }
model Product { /* see spec */ }
model Order { /* see spec */ }
model OrderItem { /* see spec */ }

// NextAuth adapter models
model Account  { /* providerId, providerAccountId compound unique */ }
model Session  { /* sessionToken unique */ }
// VerificationToken model (optional for email auth — include for completeness)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Smoke: runner works, aliases resolve | Direct assertion in `__tests__/setup.test.ts` |
| Unit | `cn()` utility | Import via `@/lib/utils`, test conditional class merging |
| Unit | Seed idempotency | Mock Prisma client, call seed logic twice |

Vitest resolves `@/` via `resolve.alias` in config. Tests co-located in `src/__tests__/` (top-level `__tests__/` is a valid convention for Vitest with React).

## Migration / Rollout

No migration required — this is the first scaffold. `prisma db push` creates the schema directly. For production: `prisma migrate dev --name init` to generate migration files. Rollback = `git clean -fd && git checkout -- .` and re-install deps.

## Open Questions

- None — all design decisions covered by specs and proposal.
