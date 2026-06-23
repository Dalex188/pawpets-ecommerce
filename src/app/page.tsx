import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch latest 6 products (getProducts returns 12 per page, we take the first 6)
  const { products } = await getProducts({ sort: "newest", page: 1 });
  const featured = products.slice(0, 6);

  return (
    <div>
      {/* Hero section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Bienvenido a PawPets
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/70 sm:text-xl">
          Todo lo que tu mascota necesita en un solo lugar. Encuentra los mejores
          productos para perros, gatos, aves, peces y más.
        </p>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          {/* Star icon */}
          <svg
            className="h-7 w-7 text-secondary"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Productos Destacados
          </h2>
        </div>

        <ProductGrid
          products={featured}
          emptyMessage="Próximamente encontrarás nuestros productos destacados aquí."
        />

        {/* View all link */}
        {products.length > 0 && (
          <div className="mt-10 text-center">
            <a
              href="/productos"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Ver todos los productos
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
