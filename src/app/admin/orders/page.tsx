// ──────────────────────────────────────────────
// PawPets — Admin Orders List
// ──────────────────────────────────────────────
// RSC that renders a paginated orders table
// with order number, customer info, date, total,
// status badge, and status filter.
// ──────────────────────────────────────────────

import Link from "next/link";
import { getAllOrders } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";

interface Props {
  searchParams: { status?: string };
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

export default async function AdminOrdersList({ searchParams }: Props) {
  const status =
    typeof searchParams.status === "string" && searchParams.status !== ""
      ? searchParams.status
      : undefined;
  const { orders, total } = await getAllOrders({ status });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      {/* Status filter */}
      <form method="GET" className="flex gap-2">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="w-full max-w-xs rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="CONFIRMED">Confirmados</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Filtrar
        </button>
      </form>

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-foreground/60">
          No hay pedidos.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground/90">
                      {order.user?.name ?? "—"}
                    </div>
                    <div className="text-xs text-foreground/50">
                      {order.user?.email ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-foreground/50">
        {total} pedido{total !== 1 ? "s" : ""} en total
      </p>
    </div>
  );
}
