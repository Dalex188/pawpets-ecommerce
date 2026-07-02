# Design: Homepage Redesign

## Technical Approach

Server-driven homepage composed of three server components stacked vertically: Hero, CategoryGrid, FeaturedProducts. Adds `isFeatured` to Product schema, a new query function, and seed updates. All sections are RSC — zero client JS for rendering.

## Architecture Decisions

### Decision: Three co-located components under `src/components/home/`
| Option | Tradeoff | Decision |
|--------|----------|----------|
| One monolithic page.tsx | Simple now, harder to test/maintain | Rejected |
| **Separate components per section** | Testable independently, clear responsibility | Chosen |
| Use existing `page.tsx` as orchestrator | Keeps current pattern | Chosen |

### Decision: getFeaturedProducts() with fallback
| Option | Tradeoff | Decision |
|--------|----------|----------|
| `where: { isFeatured: true }` only | Empty DB = blank section | Rejected |
| **Featured first, fallback to newest** | Always shows content | Chosen |

### Decision: Hardcoded emoji map vs DB field
| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add `emoji` column to Category | Migration overhead, MVP scope creep | Rejected |
| **Hardcoded `CATEGORY_EMOJI` map in component** | Zero schema change, trivial to update | Chosen |

### Decision: picsum.photos for hero (existing pattern)
Reuses the same image service already used for product images. Fallback CSS background color ensures the section is never blank.

## Data Flow

```
page.tsx (RSC)
 ├── Hero                → static content only
 ├── CategoryGrid        → db.category.findMany() → 7 cards with emoji map
 └── FeaturedProducts    → getFeaturedProducts(6)
                              │
                              ├─ db.product.findMany({ where: { isFeatured: true }, orderBy: { createdAt: "desc" }, take: limit, include })
                              │
                              └─ FALLBACK → db.product.findMany({ orderBy: { createdAt: "desc" }, take: limit, include })
                                   │
                                   └─ ProductGrid → ProductCard (existing)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `isFeatured Boolean @default(false)` to Product model |
| `prisma/seed.ts` | Modify | Set `isFeatured: true` on 6 diverse products |
| `src/lib/products.ts` | Modify | Add `getFeaturedProducts(limit?)` with fallback |
| `src/app/page.tsx` | Modify | Orchestrate 3 sections as server components |
| `src/components/home/Hero.tsx` | Create | Full-width hero with background image, overlay, CTA |
| `src/components/home/CategoryGrid.tsx` | Create | 7 category cards with emoji icons, responsive grid |
| `src/components/home/FeaturedProducts.tsx` | Create | Calls getFeaturedProducts, renders via ProductGrid |

## Interfaces / Contracts

### getFeaturedProducts()
```typescript
export async function getFeaturedProducts(
  limit: number = 6,
): Promise<{ products: ProductCardProduct[] }>
```
Returns products with `price` as number (same shape as `getProducts`). Falls back to newest N products when zero featured exist.

### CategoryGrid emoji map
```typescript
const CATEGORY_EMOJI: Record<string, string> = {
  perros: "🐕", gatos: "🐱", aves: "🐦", peces: "🐟",
  roedores: "🐹", "salud-general": "🩺", "accesorios-generales": "🎒",
};
```

### Hero props
None — fully static. Image URL: `https://picsum.photos/seed/pawpets-hero/1920/600`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getFeaturedProducts` logic | Mock db, test featured-first and fallback paths |
| Unit | `formatPrice`, `cn` | Already covered; no changes needed |
| Component | Hero renders with CTA link | Render test: check text and href |
| Component | CategoryGrid renders 7 cards | Mock `getCategories`, assert 7 links with emojis |
| Component | FeaturedProducts empty state | Mock `getFeaturedProducts` returning 0, assert ProductGrid empty message |

## Migration / Rollout

`npx prisma db push` adds the column. No migration tooling needed (SQLite + push workflow). Existing rows get `isFeatured = false` automatically.

## Open Questions

- [ ] None — spec covers all scenarios, design is straightforward.
