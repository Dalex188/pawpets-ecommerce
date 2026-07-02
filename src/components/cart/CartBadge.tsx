"use client";

import { useCartStore } from "@/store/cart-store";

export function CartBadge() {
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <span
      data-testid="cart-badge"
      className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
    >
      {totalItems}
    </span>
  );
}
