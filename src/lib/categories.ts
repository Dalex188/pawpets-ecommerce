// ──────────────────────────────────────────────
// PawPets — Categories Data Layer
// ──────────────────────────────────────────────
// Lightweight queries for categories.
// ──────────────────────────────────────────────

import { db } from "@/lib/db";

export interface CategoryBasic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

/**
 * All categories ordered by name — used by CategoryGrid and filter sidebar.
 */
export async function getCategories(): Promise<CategoryBasic[]> {
  return db.category.findMany({
    select: { id: true, name: true, slug: true, description: true, image: true },
    orderBy: { name: "asc" },
  });
}
