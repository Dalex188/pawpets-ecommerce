// ──────────────────────────────────────────────
// PawPets — Featured Products (RSC)
// ──────────────────────────────────────────────
// Fetches up to 6 featured products and renders
// them via ProductGrid. Hides entirely when the
// catalog is empty.
// ──────────────────────────────────────────────

import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(6);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold">Productos Destacados</h2>
      <ProductGrid products={products} />
      <div className="mt-8 text-center">
        <Link
          href="/productos"
          className="inline-block rounded-lg bg-primary px-8 py-3 text-white transition-colors hover:bg-primary/90"
        >
          Ver todos los productos
        </Link>
      </div>
    </section>
  );
}
