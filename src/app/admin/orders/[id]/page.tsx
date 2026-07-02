// ──────────────────────────────────────────────
// PawPets — Admin Order Detail
// ──────────────────────────────────────────────
// RSC that renders full order details with items
// table, shipping address, status badge, and a
// status update dropdown. Calls notFound() if
// the order does not exist.
// ──────────────────────────────────────────────

import { notFound } from "next/navigation";
import { getOrderDetailAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

interface Props {
  params: { id: string };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status] ?? "bg-gray-100 text-gray-800";
  const label = statusLabels[status] ?? status;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

export default async function AdminOrderDetail({ params }: Props) {
  const { id } = params;
  const order = await getOrderDetailAdmin(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {new Date(order.createdAt).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      {/* Customer info */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Cliente</h2>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Nombre:</span>{" "}
            {order.user?.name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {order.user?.email ?? "—"}
          </p>
        </div>
      </section>

      {/* Shipping address */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Dirección de Envío</h2>
        <div className="space-y-1 text-sm">
          <p>{order.shippingName}</p>
          <p>{order.shippingStreet}</p>
          <p>
            {order.shippingCity}, {order.shippingProvince}
          </p>
          <p>CP {order.shippingZip}</p>
          <p>{order.shippingPhone}</p>
        </div>
      </section>

      {/* Items table */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Productos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Cantidad</th>
                <th className="px-4 py-3 font-medium">Precio Unit.</th>
                <th className="px-4 py-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Total */}
      <div className="text-right text-lg font-bold">
        Total: {formatPrice(order.total)}
      </div>
    </div>
  );
}
