"use client";

// ──────────────────────────────────────────────
// PawPets — Product Form (Client Component)
// ──────────────────────────────────────────────
// Reusable form for create/edit product pages.
// Handles server action submission, error display,
// and redirect on success.
// ──────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  defaultValues?: {
    name?: string;
    slug?: string;
    description?: string;
    brand?: string;
    price?: number;
    stock?: number;
    categoryId?: string;
    subcategoryId?: string | null;
    images?: string;
    isFeatured?: boolean;
  };
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  submitLabel: string;
  submitLoadingLabel: string;
}

export function ProductForm({
  categories,
  defaultValues = {},
  action,
  submitLabel,
  submitLoadingLabel,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await action(formData);

    setIsSubmitting(false);

    if (result.success) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(result.error ?? "Error inesperado");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues.name ?? ""}
          className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          defaultValue={defaultValues.slug ?? ""}
          className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues.description ?? ""}
          className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Brand */}
      <div>
        <label htmlFor="brand" className="mb-1 block text-sm font-medium">
          Marca
        </label>
        <input
          id="brand"
          name="brand"
          type="text"
          defaultValue={defaultValues.brand ?? ""}
          className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Price + Stock side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Precio
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={defaultValues.price ?? ""}
            className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={defaultValues.stock ?? "0"}
            className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={defaultValues.categoryId ?? ""}
          className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      <div>
        <label htmlFor="subcategoryId" className="mb-1 block text-sm font-medium">
          Subcategoría
        </label>
        <select
          id="subcategoryId"
          name="subcategoryId"
          defaultValue={defaultValues.subcategoryId ?? ""}
          className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Sin subcategoría</option>
        </select>
      </div>

      {/* Images */}
      <div>
        <label htmlFor="images" className="mb-1 block text-sm font-medium">
          Imágenes (JSON)
        </label>
        <textarea
          id="images"
          name="images"
          rows={2}
          placeholder='["https://example.com/img.jpg"]'
          defaultValue={defaultValues.images ?? ""}
          className="w-full rounded-lg border px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Is Featured */}
      <div className="flex items-center gap-2">
        <input
          id="isFeatured"
          name="isFeatured"
          type="checkbox"
          defaultChecked={defaultValues.isFeatured ?? false}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium">
          Producto destacado
        </label>
      </div>

      {/* Hidden fields for weight, ageGroup, size */}
      <input type="hidden" name="weight" value="" />
      <input type="hidden" name="ageGroup" value="" />
      <input type="hidden" name="size" value="" />

      {/* Error display */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? submitLoadingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
