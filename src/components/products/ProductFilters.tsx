"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryWithSubs {
  id: string;
  name: string;
  slug: string;
  subcategories: SubcategoryItem[];
}

interface ActiveFilters {
  categoria: string | null;
  subcategoria: string | null;
}

interface ProductFiltersProps {
  categories: CategoryWithSubs[];
  activeFilters: ActiveFilters;
}

export function ProductFilters({
  categories,
  activeFilters,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Track which categories are expanded (start with active category)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (activeFilters.categoria) return new Set([activeFilters.categoria]);
    return new Set<string>();
  });

  function toggleExpand(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function buildHref(params: Record<string, string | null>): string {
    const next = new URLSearchParams(searchParams.toString());
    // Always reset to page 1 when filters change
    next.delete("page");

    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    const qs = next.toString();
    return `/productos${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium",
          "mb-4 lg:hidden",
          isOpen
            ? "border-primary bg-primary/5 text-primary"
            : "border-gray-200 text-foreground/70",
        )}
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </span>
        <svg
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Sidebar panel */}
      <aside
        className={cn(
          "overflow-hidden rounded-xl border border-gray-200 bg-white lg:block",
          isOpen ? "block" : "hidden",
        )}
      >
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/60">
            Categorías
          </h2>
        </div>

        <ul className="divide-y divide-gray-100">
          {/* "All products" link */}
          <li>
            <a
              href={buildHref({ categoria: null, subcategoria: null })}
              onClick={(e) => {
                e.preventDefault();
                router.push(buildHref({ categoria: null, subcategoria: null }));
              }}
              className={cn(
                "block px-4 py-2.5 text-sm transition-colors hover:text-primary",
                !activeFilters.categoria
                  ? "font-semibold text-primary"
                  : "text-foreground/70",
              )}
            >
              Todos los productos
            </a>
          </li>

          {categories.map((cat) => {
            const isActive = activeFilters.categoria === cat.slug;
            const isExpanded = expanded.has(cat.slug);

            return (
              <li key={cat.id}>
                {/* Category row */}
                <div className="flex items-center justify-between px-4 py-2.5">
                  <a
                    href={buildHref({ categoria: cat.slug, subcategoria: null })}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(
                        buildHref({ categoria: cat.slug, subcategoria: null }),
                      );
                    }}
                    className={cn(
                      "text-sm transition-colors hover:text-primary",
                      isActive && !activeFilters.subcategoria
                        ? "font-semibold text-primary"
                        : "text-foreground/70",
                    )}
                  >
                    {cat.name}
                  </a>

                  {cat.subcategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(cat.slug)}
                      className="rounded p-1 text-foreground/40 transition-colors hover:bg-gray-100 hover:text-foreground/70"
                      aria-label={isExpanded ? "Contraer" : "Expandir"}
                    >
                      <svg
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-90",
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && cat.subcategories.length > 0 && (
                  <ul className="border-t border-gray-50 bg-gray-50/50">
                    {cat.subcategories.map((sub) => {
                      const isSubActive =
                        isActive && activeFilters.subcategoria === sub.slug;

                      return (
                        <li key={sub.id}>
                          <a
                            href={buildHref({
                              categoria: cat.slug,
                              subcategoria: sub.slug,
                            })}
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(
                                buildHref({
                                  categoria: cat.slug,
                                  subcategoria: sub.slug,
                                }),
                              );
                            }}
                            className={cn(
                              "block px-6 py-2 text-sm transition-colors hover:text-primary",
                              isSubActive
                                ? "font-semibold text-primary"
                                : "text-foreground/60",
                            )}
                          >
                            {sub.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
