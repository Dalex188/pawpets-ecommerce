import Link from "next/link";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  brand: string | null;
  stock: number;
}

interface ProductCardProps {
  product: ProductCardProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { name, slug, price, images, brand, stock } = product;
  const imageUrl = images[0] ?? "/placeholder.svg";
  const inStock = stock > 0;

  return (
    <Link
      href={`/productos/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white",
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Brand badge */}
        {brand && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">
            {brand}
          </span>
        )}

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {name}
        </h3>

        {/* Price & Stock */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(price)}
          </span>

          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              inStock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700",
            )}
          >
            {inStock ? "En stock" : "Sin stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
