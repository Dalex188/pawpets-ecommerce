// ──────────────────────────────────────────────
// PawPets — Edit Product Page
// ──────────────────────────────────────────────
// RSC that pre-fills the product form via
// getProductById(id). Calls notFound() if
// the product does not exist. On submit, calls
// updateProduct(id, formData) and redirects
// to /admin/products on success.
// ──────────────────────────────────────────────

import { notFound } from "next/navigation";
import { getProductById, getCategoriesForSelect } from "@/lib/admin";
import { updateProduct } from "@/lib/actions/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const categories = await getCategoriesForSelect();

  const defaultValues = {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    brand: product.brand ?? "",
    price: Number(product.price),
    stock: product.stock,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    images: product.images
      ? JSON.stringify(
          Array.isArray(product.images)
            ? product.images
            : JSON.parse(product.images),
        )
      : "",
    isFeatured: product.isFeatured,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Editar Producto</h1>
      <ProductForm
        categories={categories}
        defaultValues={defaultValues}
        action={(formData: FormData) => updateProduct(id, formData)}
        submitLabel="Actualizar Producto"
        submitLoadingLabel="Actualizando..."
      />
    </div>
  );
}
