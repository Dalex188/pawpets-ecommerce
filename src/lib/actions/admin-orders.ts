"use server";

// ──────────────────────────────────────────────
// PawPets — Admin Order Server Actions
// ──────────────────────────────────────────────
// Order status update action. Requires ADMIN role.
// ──────────────────────────────────────────────

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ── Types ─────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// ── Constants ─────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
};

// ── Actions ───────────────────────────────────

/**
 * Update order status.
 * Only allows PENDING → CONFIRMED | CANCELLED transitions.
 * Requires ADMIN role — re-verifies at the server level.
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<ActionResult<{ id: string; status: string; total: number }>> {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { success: false, error: "Pedido no encontrado" };
  }

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(status)) {
    return { success: false, error: "Transición de estado no válida" };
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data: { status },
  });

  return {
    success: true,
    data: {
      id: updated.id,
      status: updated.status,
      total: Number(updated.total),
    },
  };
}
