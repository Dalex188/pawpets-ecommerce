// ──────────────────────────────────────────────
// PawPets — Order Confirmation Page
// ──────────────────────────────────────────────
// Server component: fetches order by number,
// validates ownership, renders order details.
// Returns 404 for missing / non-owned orders.
// ──────────────────────────────────────────────

import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

interface OrderPageProps {
  params: { orderNumber: string };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const orderNumber = Number(params.orderNumber);

  // Fetch with ownership guard built in
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <h1 className="mb-2 text-2xl font-extrabold">Orden #{order.orderNumber}</h1>
      <div className="mb-8 flex items-center gap-3 text-sm text-foreground/60">
        <span>
          {order.createdAt.toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">
          {order.status}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── Items ── */}
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold">Productos</h2>
          <div className="divide-y rounded-lg border">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-foreground/60">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="w-24 text-right text-sm font-bold">
                  {formatPrice(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-extrabold text-primary">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* ── Shipping Details ── */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Datos de envío</h2>
          <div className="rounded-lg border p-4 space-y-3 text-sm">
            <div>
              <span className="block text-xs text-foreground/40">Nombre</span>
              <span>{order.shippingName}</span>
            </div>
            <div>
              <span className="block text-xs text-foreground/40">Teléfono</span>
              <span>{order.shippingPhone}</span>
            </div>
            <div>
              <span className="block text-xs text-foreground/40">Dirección</span>
              <span>
                {order.shippingStreet}, {order.shippingCity},{" "}
                {order.shippingProvince} — CP {order.shippingZip}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
