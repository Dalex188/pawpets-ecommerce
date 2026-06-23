"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "newest", label: "Más nuevos" },
] as const;

export function ProductSorter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "newest";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const next = new URLSearchParams(searchParams.toString());
    next.delete("page");

    if (value && value !== "newest") {
      next.set("sort", value);
    } else {
      next.delete("sort");
    }

    const qs = next.toString();
    router.push(`/productos${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="whitespace-nowrap text-sm text-foreground/60">
        Ordenar por:
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleChange}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
