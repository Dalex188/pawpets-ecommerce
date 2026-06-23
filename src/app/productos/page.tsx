import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { SearchBar } from "@/components/products/SearchBar";
import { ProductSorter } from "@/components/products/ProductSorter";
import { Pagination } from "@/components/products/Pagination";
import Breadcrumbs from "./Breadcrumbs";

interface Props {
  searchParams: {
    q?: string;
    categoria?: string;
    subcategoria?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ProductosPage({ searchParams }: Props) {
  const { q, categoria, subcategoria, sort, page } = searchParams;

  const currentPage = Math.max(1, Number(page) || 1);

  const [data, categories] = await Promise.all([
    getProducts({
      categoria,
      subcategoria,
      q,
      sort: sort as any,
      page: currentPage,
    }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);
  const pageTitle = activeCategory?.name ?? "Productos";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        categoria={categoria}
        subcategoria={subcategoria}
        categoryName={activeCategory?.name}
      />

      {/* Page title */}
      <h1 className="mb-6 mt-4 text-3xl font-extrabold tracking-tight text-foreground">
        {pageTitle}
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar — ProductFilters */}
        <div className="w-full shrink-0 lg:w-64">
          <Suspense fallback={null}>
            <ProductFilters
              categories={categories}
              activeFilters={{
                categoria: categoria ?? null,
                subcategoria: subcategoria ?? null,
              }}
            />
          </Suspense>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Controls row: SearchBar + ProductSorter */}
          <Suspense
            fallback={
              <div className="mb-6 flex items-center justify-between">
                <div className="h-10 w-56 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-10 w-44 animate-pulse rounded-lg bg-gray-200" />
              </div>
            }
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-xs">
                <SearchBar />
              </div>
              <ProductSorter />
            </div>
          </Suspense>

          {/* Product grid */}
          <ProductGrid products={data.products} />

          {/* Pagination */}
          <Suspense fallback={null}>
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              basePath="/productos"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
