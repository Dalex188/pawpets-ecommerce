// ──────────────────────────────────────────────
// PawPets — Admin Server Actions
// ──────────────────────────────────────────────
// Product CRUD actions. All require ADMIN role.
// ──────────────────────────────────────────────

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Product } from "@prisma/client";

// ── Types ─────────────────────────────────────

export interface ActionResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export type ProductActionInput = Pick<
  Product,
  | "name"
  | "slug"
  | "description"
  | "price"
  | "stock"
  | "images"
  | "weight"
  | "ageGroup"
  | "size"
  | "brand"
  | "isFeatured"
  | "categoryId"
  | "subcategoryId"
>;

// ── Helper Functions ──────────────────────────

/**
 * Check if current user has ADMIN role.
 * Redirects to home if not admin.
 */
function requireAdmin() {
  const session = auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

/**
 * Normalize images field: parse JSON array or return empty array.
 */
function normalizeImages(images: string): string[] {
  if (!images || images.trim() === "") return [];
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

// ── Product CRUD Actions ──────────────────────

/**
 * Create a new product.
 * Validates required fields, checks unique slug, parses images JSON.
 */
export async function createProduct(
  formData: FormData,
): Promise<ActionResult<Product>> {
  requireAdmin();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const priceStr = formData.get("price") as string;
  const stockStr = formData.get("stock") as string;
  const imagesStr = formData.get("images") as string;
  const weight = formData.get("weight") as string;
  const ageGroup = formData.get("ageGroup") as string;
  const size = formData.get("size") as string;
  const brand = formData.get("brand") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const categoryId = formData.get("categoryId") as string;
  const subcategoryId = formData.get("subcategoryId") as string;

  // Validation
  if (!name || !slug || !priceStr) {
    return { success: false, error: "Name, slug, and price are required" };
  }

  const price = Number(priceStr);
  if (isNaN(price) || price <= 0) {
    return { success: false, error: "Valid price is required" };
  }

  const stock = Number(stockStr || "0");

  // Check unique slug
  const existingSlug = await db.product.findUnique({ where: { slug } });
  if (existingSlug) {
    return { success: false, error: "Slug already exists" };
  }

  const product = await db.product.create({
    data: {
      name,
      slug,
      description: description || null,
      price: price.toFixed(2),
      stock,
      images: JSON.stringify(normalizeImages(imagesStr)),
      weight: weight || null,
      ageGroup: ageGroup || null,
      size: size || null,
      brand: brand || null,
      isFeatured,
      categoryId,
      subcategoryId: subcategoryId || null,
    },
  });

  return { success: true, data: product };
}

/**
 * Update an existing product.
 * Validates, parses images JSON, checks unique slug (excluding current).
 */
export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionResult<Product>> {
  requireAdmin();

  const currentProduct = await db.product.findUnique({ where: { id } });
  if (!currentProduct) {
    return { success: false, error: "Product not found" };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const priceStr = formData.get("price") as string;
  const stockStr = formData.get("stock") as string;
  const imagesStr = formData.get("images") as string;
  const weight = formData.get("weight") as string;
  const ageGroup = formData.get("ageGroup") as string;
  const size = formData.get("size") as string;
  const brand = formData.get("brand") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const categoryId = formData.get("categoryId") as string;
  const subcategoryId = formData.get("subcategoryId") as string;

  // Validation
  if (!name || !slug || !priceStr) {
    return { success: false, error: "Name, slug, and price are required" };
  }

  const price = Number(priceStr);
  if (isNaN(price) || price <= 0) {
    return { success: false, error: "Valid price is required" };
  }

  const stock = Number(stockStr || "0");

  // Check unique slug (excluding current product)
  if (slug !== currentProduct.slug) {
    const existingSlug = await db.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return { success: false, error: "Slug already exists" };
    }
  }

  const product = await db.product.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
      price: price.toFixed(2),
      stock,
      images: JSON.stringify(normalizeImages(imagesStr)),
      weight: weight || null,
      ageGroup: ageGroup || null,
      size: size || null,
      brand: brand || null,
      isFeatured,
      categoryId,
      subcategoryId: subcategoryId || null,
    },
  });

  return { success: true, data: product };
}

/**
 * Delete a product.
 * Rejects if product has been ordered (orderItems count > 0).
 */
export async function deleteProduct(
  id: string,
): Promise<ActionResult<void>> {
  requireAdmin();

  // Check if product has been ordered
  const orderItems = await db.orderItem.count({ where: { productId: id } });
  if (orderItems > 0) {
    return { success: false, error: "Cannot delete a product that has been ordered" };
  }

  try {
    await db.product.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}
