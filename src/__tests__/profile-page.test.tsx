import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockUserFindUnique = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: mockUserFindUnique,
    },
  },
}));

const mockGetOrdersByUser = vi.hoisted(() => vi.fn());
vi.mock("@/lib/orders", () => ({
  getOrdersByUser: mockGetOrdersByUser,
}));

const mockRedirect = vi.hoisted(
  () => vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
const mockUseRouter = vi.hoisted(() => vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })));
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    redirect: mockRedirect,
    useRouter: mockUseRouter,
    useSearchParams: vi.fn(() => new URLSearchParams()),
  };
});

// ── Import after mocks ───────────────────────

import ProfilePage from "@/app/perfil/page";
import { Navbar } from "@/components/layout/Navbar";

// ── Test Data ─────────────────────────────────

const mockUser = {
  name: "Juan",
  email: "juan@test.com",
  createdAt: new Date("2026-01-15T10:00:00Z"),
};

const mockOrders = [
  {
    orderNumber: 1001,
    status: "PENDING",
    total: 3800,
    createdAt: new Date("2026-06-20"),
    itemCount: 2,
  },
  {
    orderNumber: 1002,
    status: "CONFIRMED",
    total: 1500,
    createdAt: new Date("2026-06-15"),
    itemCount: 1,
  },
  {
    orderNumber: 1003,
    status: "CANCELLED",
    total: 2500,
    createdAt: new Date("2026-06-10"),
    itemCount: 3,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Profile Page Tests ────────────────────────

describe("Profile page", () => {
  it("redirects to /login when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(ProfilePage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login when user not found in db", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUserFindUnique.mockResolvedValue(null);

    await expect(ProfilePage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("renders user name and email", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUserFindUnique.mockResolvedValue(mockUser);
    mockGetOrdersByUser.mockResolvedValue(mockOrders);

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("juan@test.com")).toBeInTheDocument();
    expect(
      screen.getByText(/miembro desde/i),
    ).toBeInTheDocument();
  });

  it("renders order table with all orders", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUserFindUnique.mockResolvedValue(mockUser);
    mockGetOrdersByUser.mockResolvedValue(mockOrders);

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByText("#1001")).toBeInTheDocument();
    expect(screen.getByText("#1002")).toBeInTheDocument();
    expect(screen.getByText("#1003")).toBeInTheDocument();
  });

  it("renders status badges with correct text", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUserFindUnique.mockResolvedValue(mockUser);
    mockGetOrdersByUser.mockResolvedValue(mockOrders);

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("CANCELLED")).toBeInTheDocument();
  });

  it("shows empty state when no orders", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUserFindUnique.mockResolvedValue(mockUser);
    mockGetOrdersByUser.mockResolvedValue([]);

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByText("Todavía no tenés órdenes")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ver productos/i }),
    ).toHaveAttribute("href", "/productos");
  });
});

// ── Navbar Auth Tests ─────────────────────────

describe("Navbar auth links", () => {
  it("shows Mi Perfil link when authenticated", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Juan", email: "juan@test.com", role: "CLIENT" },
    });

    const component = await Navbar();
    render(component);

    // Appears in both desktop nav and mobile nav
    const links = screen.getAllByRole("link", { name: /mi perfil/i });
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/perfil"));
  });

  it("shows Iniciar sesión link when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const component = await Navbar();
    render(component);

    const links = screen.getAllByRole("link", { name: /iniciar sesión/i });
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
  });

  it("shows Iniciar sesión link when session has no user", async () => {
    mockAuth.mockResolvedValue({});

    const component = await Navbar();
    render(component);

    const links = screen.getAllByRole("link", { name: /iniciar sesión/i });
    expect(links).toHaveLength(2);
  });
});
