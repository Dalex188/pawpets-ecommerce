// ──────────────────────────────────────────────
// PawPets — Admin Dashboard
// ──────────────────────────────────────────────
// RSC that renders summary cards with entity
// counts and the 5 most recent orders.
// ──────────────────────────────────────────────

import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

async function getDashboardData() {
  const [totalProducts, featuredProducts, pendingOrders, totalOrders, recentOrders] =
    await Promise.all([
      db.product.count(),
      db.product.count({ where: { isFeatured: true } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count(),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: { select: { quantity: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

  return { totalProducts, featuredProducts, pendingOrders, totalOrders, recentOrders };
}

export default async function AdminDashboard() {
  const { totalProducts, featuredProducts, pendingOrders, totalOrders, recentOrders } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>

      {/* Summary cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-foreground/60">Total Productos</p>
            <p className="text-3xl font-bold text-primary">{totalProducts}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-foreground/60">Productos Destacados</p>
            <p className="text-3xl font-bold text-secondary">{featuredProducts}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-foreground/60">Pedidos Pendientes</p>
            <p className="text-3xl font-bold text-accent">{pendingOrders}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-foreground/60">Pedidos Totales</p>
            <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
          </div>
        </div>
      </section>

      {/* Recent orders */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Pedidos Recientes</h2>
        {recentOrders.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-foreground/60">
            No hay pedidos recientes.
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
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {order.user?.name ?? order.user?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground/60">
                      {order.createdAt.toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status === "PENDING"
                          ? "Pendiente"
                          : order.status === "CONFIRMED"
                            ? "Confirmado"
                            : "Cancelado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
