// ──────────────────────────────────────────────
// PawPets — Admin Products List
// ──────────────────────────────────────────────
// RSC that renders a paginated products table
// with image thumbnail, name, category, stock,
// price, and actions (edit/delete).
// ──────────────────────────────────────────────

import Link from "next/link";
import { getProductsAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

interface Props {
  searchParams: { search?: string };
}

export default async function AdminProductsList({ searchParams }: Props) {
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const { products, total } = await getProductsAdmin({ search: search || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Buscar productos..."
          className="w-full max-w-sm rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Buscar
        </button>
      </form>

      {/* Products table */}
      {products.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-foreground/60">
          No hay productos{search ? ` para "${search}"` : ""}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 font-medium">Imagen</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs text-foreground/40">
                        Sin img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-foreground/50">
        {total} producto{total !== 1 ? "s" : ""} en total
      </p>
    </div>
  );
}
