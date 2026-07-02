"use client";

// ──────────────────────────────────────────────
// PawPets — Order Status Select
// ──────────────────────────────────────────────
// Client component that renders a status dropdown
// and calls updateOrderStatus on change.
// ──────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/admin-orders";

interface Props {
  orderId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      router.refresh();
    }
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
