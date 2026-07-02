"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface AddToCartButtonProps {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  image,
  inStock,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = () => {
    if (!inStock) return;

    addItem({ id: productId, slug, name, price, image });

    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 1500);
  };

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={handleClick}
      className={cn(
        "mt-2 w-full rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors",
        !inStock
          ? "cursor-not-allowed bg-gray-200 text-gray-500"
          : confirmed
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
      )}
    >
      {!inStock ? "Sin stock" : confirmed ? "✓ Agregado" : "Agregar al carrito"}
    </button>
  );
}
