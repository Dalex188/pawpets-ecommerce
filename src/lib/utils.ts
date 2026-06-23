import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric price to USD currency string (Argentine locale).
 * Accepts numbers or Decimal strings from Prisma.
 */
export function formatPrice(price: number | string): string {
  const numeric = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
}
