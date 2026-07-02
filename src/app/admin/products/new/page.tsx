// ──────────────────────────────────────────────
// PawPets — Create Product Page
// ──────────────────────────────────────────────
// RSC shell that provides categories data and
// delegates form rendering to ProductForm client
// component. The form calls createProduct on
// submit and redirects on success.
// ──────────────────────────────────────────────

import { getCategoriesForSelect } from "@/lib/admin";
import { createProduct } from "@/lib/actions/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getCategoriesForSelect();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      <ProductForm
        categories={categories}
        action={createProduct}
        submitLabel="Crear Producto"
        submitLoadingLabel="Creando..."
      />
    </div>
  );
}
