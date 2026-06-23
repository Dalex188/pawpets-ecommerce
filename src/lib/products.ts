// ──────────────────────────────────────────────
// PawPets — Product Catalog Data Layer
// ──────────────────────────────────────────────
// Typed Prisma queries for listing, detail,
// and filter sidebar.
// ──────────────────────────────────────────────

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ── Types ─────────────────────────────────────

export interface ProductQueryParams {
  categoria?: string;
  subcategoria?: string;
  q?: string;
  sort?: SortOption;
  page?: number;
}

export type SortOption =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "newest";

export interface ProductsResponse {
  products: Awaited<ReturnType<typeof getProducts>>["products"];
  total: number;
  totalPages: number;
  currentPage: number;
}

// ── Constants ─────────────────────────────────

const PAGE_SIZE = 12;

// ── Sort map ──────────────────────────────────

function getSortOrder(sort: SortOption): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "name_asc":
      return { name: "asc" };
    case "name_desc":
      return { name: "desc" };
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

// ── Queries ───────────────────────────────────

const productInclude = {
  category: { select: { name: true, slug: true } },
  subcategory: { select: { name: true, slug: true } },
} as const;

/**
 * Paginated product listing with search, filter, and sort.
 * Reads URL-friendly params; returns products + pagination metadata.
 */
export async function getProducts(params: ProductQueryParams = {}) {
  const { categoria, subcategoria, q, sort = "newest", page = 1 } = params;

  const skip = (page - 1) * PAGE_SIZE;

  // Build dynamic where clause
  const where: Prisma.ProductWhereInput = {};

  if (categoria) {
    where.category = { slug: categoria };
  }

  if (subcategoria) {
    where.subcategory = { slug: subcategoria };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy = getSortOrder(sort);

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: productInclude,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
    })),
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    currentPage: page,
  };
}

/**
 * Single product by slug, with category + subcategory.
 * Returns `null` when not found (caller uses `notFound()`).
 */
export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: productInclude,
  });

  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
  };
}

/**
 * All categories with subcategories — for the filter sidebar.
 */
export async function getCategories() {
  return db.category.findMany({
    include: {
      subcategories: {
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}
