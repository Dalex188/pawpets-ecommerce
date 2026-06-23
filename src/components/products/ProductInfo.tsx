import { cn, formatPrice } from "@/lib/utils";

export interface ProductInfoProduct {
  name: string;
  price: number;
  description: string | null;
  brand: string | null;
  stock: number;
  weight: string | null;
  size: string | null;
  ageGroup: string | null;
  category: { name: string; slug: string };
  subcategory: { name: string; slug: string } | null;
}

interface ProductInfoProps {
  product: ProductInfoProduct;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { name, price, description, brand, stock, weight, size, ageGroup } =
    product;
  const inStock = stock > 0;

  // Build specs table rows (skip null values)
  const specs: { label: string; value: string }[] = [];
  if (brand) specs.push({ label: "Marca", value: brand });
  if (weight) specs.push({ label: "Peso", value: weight });
  if (size) specs.push({ label: "Tamaño", value: size });
  if (ageGroup) specs.push({ label: "Edad recomendada", value: ageGroup });

  return (
    <div className="flex flex-col gap-6">
      {/* Name */}
      <h1 className="text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
        {name}
      </h1>

      {/* Brand */}
      {brand && (
        <p className="text-sm font-semibold uppercase tracking-wider text-primary/70">
          {brand}
        </p>
      )}

      {/* Price & Stock */}
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold text-primary">
          {formatPrice(price)}
        </span>
        <span className="text-sm text-foreground/50">(IVA incluido)</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            inStock
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700",
          )}
        >
          {inStock ? "En stock" : "Sin stock"}
        </span>
      </div>

      {/* Description */}
      {description && (
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground/60">
            Descripción
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            {description}
          </p>
        </div>
      )}

      {/* Specs table */}
      {specs.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground/60">
            Especificaciones
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {specs.map((spec) => (
                <tr key={spec.label} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-foreground/60">
                    {spec.label}
                  </td>
                  <td className="py-2 text-foreground">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add to cart button */}
      <button
        type="button"
        disabled={!inStock}
        className={cn(
          "mt-2 w-full rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors",
          inStock
            ? "bg-primary text-white hover:bg-primary/90 active:bg-primary/80"
            : "cursor-not-allowed bg-gray-200 text-gray-500",
        )}
      >
        {inStock ? "Agregar al carrito" : "Sin stock"}
      </button>
    </div>
  );
}
