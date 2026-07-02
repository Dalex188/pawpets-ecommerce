"use client";

// ──────────────────────────────────────────────
// PawPets — Checkout Page
// ──────────────────────────────────────────────
// Client component: reads cart from Zustand,
// displays order summary + shipping form,
// calls createOrder on submit, handles success/error.
// ──────────────────────────────────────────────

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { createOrder } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-foreground/60">Redirigiendo al carrito...</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Embed cart items so the server action can read them
    formData.set(
      "cartItems",
      JSON.stringify(items.map((i) => ({ id: i.id, quantity: i.quantity }))),
    );

    startTransition(async () => {
      const result = await createOrder(null, formData);

      if (result.error?.startsWith("redirect:")) {
        router.push(result.error.replace("redirect:", ""));
      } else if (result.error) {
        setError(result.error);
      } else if (result.orderNumber) {
        clearCart();
        router.push(`/orden/${result.orderNumber}`);
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── Order Summary ── */}
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold">Resumen del pedido</h2>
          <div className="divide-y rounded-lg border">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 sm:gap-6"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="w-24 text-right text-sm font-bold">
                    {formatPrice(lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-extrabold text-primary">
              {formatPrice(subtotal())}
            </span>
          </div>
        </div>

        {/* ── Shipping Form ── */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Datos de envío</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="shippingName"
                className="mb-1 block text-sm font-medium"
              >
                Nombre completo
              </label>
              <input
                id="shippingName"
                name="shippingName"
                type="text"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label
                htmlFor="shippingPhone"
                className="mb-1 block text-sm font-medium"
              >
                Teléfono
              </label>
              <input
                id="shippingPhone"
                name="shippingPhone"
                type="tel"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="11 1234-5678"
              />
            </div>

            <div>
              <label
                htmlFor="shippingProvince"
                className="mb-1 block text-sm font-medium"
              >
                Provincia
              </label>
              <input
                id="shippingProvince"
                name="shippingProvince"
                type="text"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Buenos Aires"
              />
            </div>

            <div>
              <label
                htmlFor="shippingCity"
                className="mb-1 block text-sm font-medium"
              >
                Ciudad
              </label>
              <input
                id="shippingCity"
                name="shippingCity"
                type="text"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="La Plata"
              />
            </div>

            <div>
              <label
                htmlFor="shippingStreet"
                className="mb-1 block text-sm font-medium"
              >
                Dirección
              </label>
              <input
                id="shippingStreet"
                name="shippingStreet"
                type="text"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Calle 123, Piso 4"
              />
            </div>

            <div>
              <label
                htmlFor="shippingZip"
                className="mb-1 block text-sm font-medium"
              >
                Código postal
              </label>
              <input
                id="shippingZip"
                name="shippingZip"
                type="text"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="1900"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isPending ? "Procesando..." : "Confirmar compra"}
            </button>

            <Link
              href="/cart"
              className="mt-2 block w-full text-center text-xs text-foreground/60 underline underline-offset-2 hover:text-primary"
            >
              Volver al carrito
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
