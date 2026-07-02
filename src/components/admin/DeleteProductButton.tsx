"use client";

// ──────────────────────────────────────────────
// PawPets — Delete Product Button with Confirmation
// ──────────────────────────────────────────────
// Client component that shows a confirmation modal
// and calls deleteProduct server action on confirm.
// ──────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/actions/admin-products";

interface Props {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const result = await deleteProduct(productId);

    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "Error al eliminar el producto");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
      >
        Eliminar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Confirmar eliminación</h3>
            <p className="mb-4 text-sm text-foreground/70">
              ¿Estás seguro de que querés eliminar <strong>{productName}</strong>?
              Esta acción no se puede deshacer.
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                disabled={deleting}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
