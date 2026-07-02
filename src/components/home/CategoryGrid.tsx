// ──────────────────────────────────────────────
// PawPets — Category Grid (RSC)
// ──────────────────────────────────────────────
// Responsive grid of 7 category cards with emoji
// icons, linking to /productos?categoria={slug}.
// ──────────────────────────────────────────────

import Link from "next/link";
import { getCategories } from "@/lib/categories";

const CATEGORY_EMOJI: Record<string, string> = {
  perros: "\u{1F415}",
  gatos: "\u{1F431}",
  aves: "\u{1F426}",
  peces: "\u{1F41F}",
  roedores: "\u{1F439}",
  "salud-general": "\u{1FA7A}",
  "accesorios-generales": "\u{1F392}",
};

export async function CategoryGrid() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold">Categorías</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/productos?categoria=${category.slug}`}
            className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="mb-2 text-3xl">
              {CATEGORY_EMOJI[category.slug] ?? "\u{1F436}"}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
