import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockGetAllOrders = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin", () => ({
  getAllOrders: mockGetAllOrders,
}));

// ── Import after mocks ────────────────────────

import AdminOrdersList from "@/app/admin/orders/page";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock data ─────────────────────────────────

const mockOrders = {
  orders: [
    {
      id: "ord-1",
      orderNumber: 1001,
      status: "PENDING",
      total: 5000,
      createdAt: new Date("2026-06-23T12:00:00Z"),
      itemCount: 2,
      user: { name: "Juan Pérez", email: "juan@example.com" },
    },
    {
      id: "ord-2",
      orderNumber: 1002,
      status: "CONFIRMED",
      total: 3000,
      createdAt: new Date("2026-06-22T10:00:00Z"),
      itemCount: 1,
      user: { name: "María García", email: "maria@example.com" },
    },
    {
      id: "ord-3",
      orderNumber: 1003,
      status: "CANCELLED",
      total: 1500,
      createdAt: new Date("2026-06-21T08:00:00Z"),
      itemCount: 3,
      user: null,
    },
  ],
  total: 3,
  totalPages: 1,
  currentPage: 1,
};

const emptyResult = {
  orders: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
};

// ── Tests ─────────────────────────────────────

describe("AdminOrdersList", () => {
  it("renders table with order numbers as links", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    expect(screen.getByText("#1001")).toBeInTheDocument();
    expect(screen.getByText("#1002")).toBeInTheDocument();
    expect(screen.getByText("#1003")).toBeInTheDocument();

    const orderLink = screen.getByRole("link", { name: /#1001/i });
    expect(orderLink).toHaveAttribute("href", "/admin/orders/ord-1");
  });

  it("renders customer name and email", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText("María García")).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
  });

  it("renders formatted totals", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    expect(screen.getByText((c) => c.includes("5.000"))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("3.000"))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("1.500"))).toBeInTheDocument();
  });

  it("renders status badges with correct text", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
  });

  it("renders empty state when no orders", async () => {
    mockGetAllOrders.mockResolvedValue(emptyResult);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    expect(screen.getByText(/no hay pedidos/i)).toBeInTheDocument();
  });

  it("renders status filter dropdown", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Todos los estados")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Confirmados")).toBeInTheDocument();
    expect(screen.getByText("Cancelados")).toBeInTheDocument();
  });

  it("passes status filter to getAllOrders", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    await AdminOrdersList({ searchParams: { status: "PENDING" } });

    expect(mockGetAllOrders).toHaveBeenCalledWith(
      expect.objectContaining({ status: "PENDING" }),
    );
  });

  it("renders total order count", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    expect(screen.getByText(/3 pedidos/i)).toBeInTheDocument();
  });

  it("renders view detail links for each order", async () => {
    mockGetAllOrders.mockResolvedValue(mockOrders);

    const element = await AdminOrdersList({ searchParams: {} });
    render(element);

    const detailLinks = screen.getAllByRole("link", { name: /ver detalle/i });
    expect(detailLinks).toHaveLength(3);
    expect(detailLinks[0]).toHaveAttribute("href", "/admin/orders/ord-1");
    expect(detailLinks[1]).toHaveAttribute("href", "/admin/orders/ord-2");
    expect(detailLinks[2]).toHaveAttribute("href", "/admin/orders/ord-3");
  });
});
