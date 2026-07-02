// ──────────────────────────────────────────────
// PawPets — User Profile Page
// ──────────────────────────────────────────────
// Server component: auth guard with redirect,
// user info card + order history table.
// ──────────────────────────────────────────────

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrdersByUser } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderSummary } from "@/lib/orders";

// ── Status badge colors ───────────────────────

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  const className = statusStyles[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}
    >
      {status}
    </span>
  );
}

// ── Page ──────────────────────────────────────

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, createdAt: true },
  });

  if (!user) redirect("/login");

  const orders: OrderSummary[] = await getOrdersByUser();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <h1 className="mb-6 text-2xl font-extrabold">Mi Perfil</h1>

      {/* ── User Info Card ── */}
      <div className="mb-8 rounded-lg border p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{user.name ?? "Usuario"}</h2>
          <p className="text-sm text-foreground/60">{user.email}</p>
          <p className="text-sm text-foreground/40">
            Miembro desde{" "}
            {user.createdAt.toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── Order History ── */}
      <h2 className="mb-4 text-lg font-bold">Historial de órdenes</h2>

      {orders.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="mb-4 text-foreground/60">
            Todavía no tenés órdenes
          </p>
          <Link
            href="/productos"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-foreground/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Artículos</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.orderNumber} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/orden/${order.orderNumber}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {order.createdAt.toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">{order.itemCount}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
