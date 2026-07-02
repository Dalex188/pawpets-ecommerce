import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ─────────────────────────────────────

const mockGetOrderDetailAdmin = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin", () => ({
  getOrderDetailAdmin: mockGetOrderDetailAdmin,
}));

const mockUpdateOrderStatus = vi.hoisted(() => vi.fn());
vi.mock("@/lib/actions/admin-orders", () => ({
  updateOrderStatus: mockUpdateOrderStatus,
}));

const mockNotFound = vi.hoisted(() => vi.fn());
const mockRefresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
  useRouter: () => ({ refresh: mockRefresh }),
}));

// ── Import after mocks ────────────────────────

import AdminOrderDetail from "@/app/admin/orders/[id]/page";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock data ─────────────────────────────────

const mockOrder = {
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
    {
      id: "item-2",
      name: "Dog Toy Bone",
      quantity: 1,
      price: 1000,
      lineTotal: 1000,
    },
  ],
  user: { name: "Juan Pérez", email: "juan@example.com" },
};

// ── Tests ─────────────────────────────────────

describe("AdminOrderDetail", () => {
  it("renders order header info", async () => {
    mockGetOrderDetailAdmin.mockResolvedValue(mockOrder);

    const element = await AdminOrderDetail({ params: { id: "ord-1" } });
    render(element);

    expect(screen.getByText(/pedido #1001/i)).toBeInTheDocument();
    const pendientes = screen.getAllByText("Pendiente");
    expect(pendientes.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText((c) => c.includes("5.000"))).toBeInTheDocument();
    expect(pendientes[0]).toBeInTheDocument();
  });

  it("renders customer info", async () => {
    mockGetOrderDetailAdmin.mockResolvedValue(mockOrder);

    const element = await AdminOrderDetail({ params: { id: "ord-1" } });
    render(element);

    const juanElements = screen.getAllByText("Juan Pérez");
    expect(juanElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
  });

  it("renders shipping address", async () => {
    mockGetOrderDetailAdmin.mockResolvedValue(mockOrder);

    const element = await AdminOrderDetail({ params: { id: "ord-1" } });
    render(element);

    expect(screen.getByText("Calle 123")).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("La Plata"))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("Buenos Aires"))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("1900"))).toBeInTheDocument();
    expect(screen.getByText("11 1234-5678")).toBeInTheDocument();
  });

  it("renders items table with product names, quantities and prices", async () => {
    mockGetOrderDetailAdmin.mockResolvedValue(mockOrder);

    const element = await AdminOrderDetail({ params: { id: "ord-1" } });
    render(element);

    expect(screen.getByText("Dog Food Premium")).toBeInTheDocument();
    expect(screen.getByText("Dog Toy Bone")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("4.000"))).toBeInTheDocument();
    const milElements = screen.getAllByText((c) => c.includes("1.000"));
    expect(milElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders status dropdown with current status selected", async () => {
    mockGetOrderDetailAdmin.mockResolvedValue(mockOrder);

    const element = await AdminOrderDetail({ params: { id: "ord-1" } });
    render(element);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("PENDING");
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
  });

  it("calls updateOrderStatus when status dropdown changes", async () => {
    mockUpdateOrderStatus.mockResolvedValue({ success: true, data: { id: "ord-1", status: "CONFIRMED", total: 5000 } });
    mockGetOrderDetailAdmin.mockResolvedValue(mockOrder);

    const element = await AdminOrderDetail({ params: { id: "ord-1" } });
    render(element);

    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "CONFIRMED");

    expect(mockUpdateOrderStatus).toHaveBeenCalledWith("ord-1", "CONFIRMED");
  });

  it("calls notFound when order does not exist", async () => {
    mockGetOrderDetailAdmin.mockResolvedValue(null);

    mockNotFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      AdminOrderDetail({ params: { id: "invalid-id" } }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
