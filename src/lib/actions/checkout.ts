"use server";

// ──────────────────────────────────────────────
// PawPets — Order Creation Server Action
// ──────────────────────────────────────────────
// Handles order creation with DB-price recalculation,
// stock validation, and atomic transactional writes.
// ──────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface CartItemData {
  id: string;
  quantity: number;
}

// ── Server Action ─────────────────────────────

/**
 * Creates an order from the current user's cart.
 *
 * Expected FormData fields:
 *   - cartItems  : JSON string of `{id, quantity}[]`
 *   - shippingName, shippingPhone, shippingProvince,
 *     shippingCity, shippingStreet, shippingZip
 *
 * Returns `{ orderNumber }` on success or `{ error }` on failure.
 * Errors prefixed with `redirect:` indicate the client should
 * navigate to the given path.
 */
export async function createOrder(
  _prevState: unknown,
  formData: FormData,
): Promise<{ orderNumber?: number; error?: string }> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "redirect:/login" };
    }

    // 2. Parse cart items from hidden form field
    const cartRaw = formData.get("cartItems");
    if (!cartRaw || typeof cartRaw !== "string") {
      return { error: "El carrito está vacío" };
    }

    let cartItems: CartItemData[];
    try {
      cartItems = JSON.parse(cartRaw);
    } catch {
      return { error: "Error al procesar el carrito" };
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { error: "El carrito está vacío" };
    }

    // 3. Validate shipping fields
    const shippingFields = [
      "shippingName",
      "shippingPhone",
      "shippingProvince",
      "shippingCity",
      "shippingStreet",
      "shippingZip",
    ] as const;

    const shipping: Record<string, string> = {};
    for (const field of shippingFields) {
      const value = formData.get(field);
      if (!value || typeof value !== "string" || value.trim().length === 0) {
        return { error: "Todos los campos de envío son obligatorios" };
      }
      shipping[field] = value.trim();
    }

    // 4. Atomic transaction: validate stock, create order, decrement stock
    const order = await db.$transaction(async (tx) => {
      // 4a. For each cart item, verify existence + stock from DB
      const itemsData = await Promise.all(
        cartItems.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.id },
            select: { id: true, name: true, price: true, stock: true },
          });

          if (!product) {
            throw new Error("Producto no encontrado");
          }

          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${product.name}`);
          }

          // 4b. Decrement stock
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });

          return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price, // DB price — client prices are NEVER trusted
          };
        }),
      );

      // 4c. Generate next order number atomically inside the transaction
      const lastOrder = await tx.order.findFirst({
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true },
      });
      const orderNumber = (lastOrder?.orderNumber ?? 0) + 1;

      // 4d. Calculate total from DB prices only
      const total = itemsData.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );

      // 4e. Create order with items
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          total,
          orderNumber,
          shippingName: shipping.shippingName,
          shippingPhone: shipping.shippingPhone,
          shippingProvince: shipping.shippingProvince,
          shippingCity: shipping.shippingCity,
          shippingStreet: shipping.shippingStreet,
          shippingZip: shipping.shippingZip,
          items: {
            create: itemsData,
          },
        },
      });

      return newOrder;
    });

    return { orderNumber: order.orderNumber };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al procesar el pedido" };
  }
}
