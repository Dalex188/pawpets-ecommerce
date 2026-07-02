// ──────────────────────────────────────────────
// PawPets — Order Queries
// ──────────────────────────────────────────────
// Server-only queries for order retrieval with
// ownership guard.
// ──────────────────────────────────────────────

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ── Types ─────────────────────────────────────

export interface OrderSummary {
  orderNumber: number;
  status: string;
  total: number;
  createdAt: Date;
  itemCount: number;
}

export interface OrderItemDetail {
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface OrderDetail {
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
}

// ── Queries ───────────────────────────────────

/**
 * Fetch an order by its customer-facing order number.
 * Enforces ownership — returns `null` if the order does not
 * belong to the currently authenticated user.
 *
 * Also returns `null` when the user is not authenticated
 * or the order does not exist (caller uses `notFound()`).
 */
export async function getOrderByNumber(
  orderNumber: number,
): Promise<OrderDetail | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!order) return null;
  if (order.userId !== session.user.id) return null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt,
    shippingName: order.shippingName,
    shippingPhone: order.shippingPhone,
    shippingProvince: order.shippingProvince,
    shippingCity: order.shippingCity,
    shippingStreet: order.shippingStreet,
    shippingZip: order.shippingZip,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: Number(item.price),
      lineTotal: Number(item.price) * item.quantity,
    })),
  };
}

/**
 * Fetch all orders for the currently authenticated user,
 * sorted by newest first. Returns empty array if not authenticated.
 */
export async function getOrdersByUser(): Promise<OrderSummary[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return orders.map((order) => ({
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}
