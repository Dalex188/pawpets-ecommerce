// ──────────────────────────────────────────────
// PawPets — Admin Queries
// ──────────────────────────────────────────────
// Server-only queries for admin-only CRUD
// operations. No ownership guard - admin sees all.
// ──────────────────────────────────────────────

import { db } from "@/lib/db";
import { Product, Category, Subcategory, Order, Prisma } from "@prisma/client";

// ── Types ─────────────────────────────────────

export interface ProductAdmin {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  weight: string | null;
  ageGroup: string | null;
  size: string | null;
  brand: string | null;
  isFeatured: boolean;
  categoryId: string;
  subcategoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
}

export interface CategorySelect {
  id: string;
  name: string;
}

export interface SubcategorySelect {
  id: string;
  name: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  createdAt: Date;
  itemCount: number;
  user: { name: string | null; email: string } | null;
}

export interface OrderItemDetail {
  id: string;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  createdAt: Date;
  shippingName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingCity: string;
  shippingStreet: string;
  shippingZip: string;
  items: OrderItemDetail[];
  user: { name: string | null; email: string } | null;
}

// ── Constants ─────────────────────────────────

const PAGE_SIZE = 15;

// ── Queries ───────────────────────────────────

const productInclude = {
  category: { select: { name: true, slug: true } },
  subcategory: { select: { name: true, slug: true } },
} as const;

/**
 * Paginated product listing for admin.
 * Returns all products with category/subcategory names.
 * Supports pagination and optional search.
 */
export async function getProductsAdmin(
  params: { page?: number; search?: string; limit?: number } = {},
): Promise<{ products: ProductAdmin[]; total: number; totalPages: number; currentPage: number }> {
  const { page = 1, search, limit = PAGE_SIZE } = params;

  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { brand: { contains: search } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: productInclude,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      price: Number(p.price),
    })),
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/**
 * Single product by ID for edit form.
 * Returns full product with category and subcategory relations.
 */
export async function getProductById(id: string): Promise<Product | null> {
  return db.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

/**
 * All categories for dropdown selection.
 * Returns { id, name } pairs ordered by name.
 */
export async function getCategoriesForSelect(): Promise<CategorySelect[]> {
  const categories = await db.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return categories;
}

/**
 * Subcategories for a given category, for dropdown selection.
 * Returns { id, name } pairs ordered by name.
 */
export async function getSubcategoriesForSelect(
  categoryId: string,
): Promise<SubcategorySelect[]> {
  const subcategories = await db.subcategory.findMany({
    where: { categoryId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return subcategories;
}

/**
 * Paginated order listing for admin.
 * No ownership guard — admin sees all orders.
 * Supports pagination and optional status filter.
 */
export async function getAllOrders(
  params: { page?: number; status?: string; limit?: number } = {},
): Promise<{ orders: OrderSummary[]; total: number; totalPages: number; currentPage: number }> {
  const { page = 1, status, limit = PAGE_SIZE } = params;

  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: { select: { quantity: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({
      ...o,
      total: Number(o.total),
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      user: o.user
        ? {
            name: o.user.name,
            email: o.user.email,
          }
        : null,
    })),
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/**
 * Single order detail for admin.
 * No ownership guard — admin sees any order.
 * Includes items with product names and user info.
 */
export async function getOrderDetailAdmin(
  orderId: string,
): Promise<OrderDetail | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) return null;

  return {
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      quantity: item.quantity,
      price: Number(item.price),
      lineTotal: Number(item.price) * item.quantity,
    })),
    user: order.user
      ? {
          name: order.user.name,
          email: order.user.email,
        }
      : null,
  };
}
