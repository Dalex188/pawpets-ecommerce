import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks: Server actions ─────────────────────

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockOrderFindUnique = vi.hoisted(() => vi.fn());
const mockOrderUpdate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findUnique: mockOrderFindUnique,
      update: mockOrderUpdate,
    },
  },
}));

// ── Mocks: Admin queries ──────────────────────

const mockGetAllOrders = vi.hoisted(() => vi.fn());
const mockGetOrderDetailAdmin = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin", () => ({
  getAllOrders: mockGetAllOrders,
  getOrderDetailAdmin: mockGetOrderDetailAdmin,
}));

// ── Mocks: Next.js navigation ─────────────────

const mockNotFound = vi.hoisted(() => vi.fn());
const mockRefresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
  useRouter: () => ({ refresh: mockRefresh }),
}));

// ── Mocks: Client component (OrderStatusSelect) ─

vi.mock("@/components/admin/OrderStatusSelect", () => ({
  OrderStatusSelect: ({
    orderId,
    currentStatus,
  }: {
    orderId: string;
    currentStatus: string;
  }) => (
    <select
      data-testid="order-status-select"
      data-order-id={orderId}
      value={currentStatus}
      onChange={() => {}}
    >
      <option value="PENDING">Pendiente</option>
      <option value="CONFIRMED">Confirmado</option>
      <option value="CANCELLED">Cancelado</option>
    </select>
  ),
}));

// ── Import after mocks ────────────────────────

import AdminOrdersList from "@/app/admin/orders/page";
import AdminOrderDetail from "@/app/admin/orders/[id]/page";
import { updateOrderStatus } from "@/lib/actions/admin-orders";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock data ─────────────────────────────────

const mockOrdersResult = {
  orders: [
    {
      id: "ord-1",
      orderNumber: 1001,
      status: "PENDING",
      total: 5000,
      createdAt: new Date("2026-06-23T12:00:00Z"),
      itemCount: 3,
      user: { name: "Juan Pérez", email: "juan@example.com" },
    },
    {
      id: "ord-2",
      orderNumber: 1002,
      status: "CONFIRMED",
      total: 3200,
      createdAt: new Date("2026-06-22T10:00:00Z"),
      itemCount: 2,
      user: { name: "María García", email: "maria@example.com" },
    },
  ],
  total: 2,
  totalPages: 1,
  currentPage: 1,
};

const mockOrderDetail = {
  id: "ord-1",
  orderNumber: 1001,
  status: "PENDING",
  total: 5000,
  createdAt: new Date("2026-06-23T12:00:00Z"),
  shippingName: "Juan Pérez",
  shippingPhone: "11 1234-5678",
  shippingProvince: "Buenos Aires",
  shippingCity: "La Plata",
  shippingStreet: "Calle 123",
  shippingZip: "1900",
  items: [
    {
      id: "item-1",
      name: "Dog Food Premium",
      quantity: 2,
      price: 2000,
      lineTotal: 4000,
    },
  ],
  user: { name: "Juan Pérez", email: "juan@example.com" },
};

// ── Tests ─────────────────────────────────────

describe("Admin order status integration", () => {
  it("admin views all orders — list renders status badges", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    mockGetAllOrders.mockResolvedValue(mockOrdersResult);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    // Both orders visible — use function matcher since #1001 is split across text nodes
    expect(screen.getByText((c) => c.includes("#1001"))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("#1002"))).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("María García")).toBeInTheDocument();

    // Status badges present
    const pendienteLabels = screen.getAllByText("Pendiente");
    expect(pendienteLabels.length).toBeGreaterThanOrEqual(1);
    const confirmadoLabels = screen.getAllByText("Confirmado");
    expect(confirmadoLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("admin updates PENDING → CONFIRMED via detail page", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    mockGetOrderDetailAdmin.mockResolvedValue(mockOrderDetail);
    mockOrderFindUnique.mockResolvedValue({ id: "ord-1", status: "PENDING" });
    mockOrderUpdate.mockResolvedValue({
      id: "ord-1",
      status: "CONFIRMED",
      total: "5000",
    });

    // Step 1: Render detail page with PENDING status
    const element = await AdminOrderDetail({ params: { id: "ord-1" } });
    render(element);

    const select = screen.getByTestId("order-status-select");
    expect(select).toHaveValue("PENDING");

    // Step 2: Update status via server action directly
    const updateResult = await updateOrderStatus("ord-1", "CONFIRMED");
    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.status).toBe("CONFIRMED");
    expect(mockOrderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ord-1" },
        data: { status: "CONFIRMED" },
      }),
    );
  });

  it("non-admin calling updateOrderStatus directly returns auth error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", role: "CLIENT" } });

    const result = await updateOrderStatus("ord-1", "CONFIRMED");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });

  it("unauthenticated user calling updateOrderStatus directly returns auth error", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateOrderStatus("ord-1", "CONFIRMED");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });
});
