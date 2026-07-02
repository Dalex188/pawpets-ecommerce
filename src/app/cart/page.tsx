"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, subtotal } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <svg
            className="h-16 w-16 text-foreground/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          <h1 className="text-xl font-bold">Tu carrito está vacío</h1>
          <p className="text-sm text-foreground/60">
            Agregá productos para empezar a comprar
          </p>
          <Link
            href="/productos"
            className="mt-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary/90"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold">Carrito de compras</h1>

      {/* Items */}
      <div className="divide-y rounded-lg border">
        {items.map((item) => {
          const lineTotal = item.price * item.quantity;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 sm:gap-6"
            >
              {/* Image */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/productos/${item.slug}`}
                  className="text-sm font-semibold hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-foreground/60">
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors hover:bg-gray-100"
                  aria-label="Disminuir cantidad"
                >
                  -
                </button>
                <span className="flex h-8 w-10 items-center justify-center rounded border bg-gray-50 text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors hover:bg-gray-100"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <div className="w-24 text-right">
                <p className="text-sm font-bold">{formatPrice(lineTotal)}</p>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-foreground/40 transition-colors hover:text-red-500"
                aria-label={`Eliminar ${item.name}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart summary */}
      <div className="mt-8 rounded-lg border p-6">
        <div className="mb-1 flex items-center justify-between text-sm text-foreground/60">
          <span>Productos ({totalItems()})</span>
          <span>{formatPrice(subtotal())}</span>
        </div>
        <div className="mb-4 flex items-center justify-between border-t pt-4">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-extrabold text-primary">
            {formatPrice(subtotal())}
          </span>
        </div>

        <Link
          href="/checkout"
          className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary/90"
        >
          Proceder al pago
        </Link>

        <Link
          href="/productos"
          className="mt-4 block w-full rounded-lg border border-primary py-2.5 text-center text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary/5"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
