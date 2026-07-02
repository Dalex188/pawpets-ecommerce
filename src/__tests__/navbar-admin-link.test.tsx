import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockSearchBar = vi.hoisted(() => vi.fn());
vi.mock("@/components/products/SearchBar", () => ({
  SearchBar: () => <div data-testid="search-bar">Search</div>,
}));

// Mock NavbarMobile to verify role is passed
const mockNavbarMobile = vi.hoisted(() => vi.fn());
vi.mock("@/components/layout/NavbarMobile", () => ({
  NavbarMobile: (props: { userRole?: string }) => {
    mockNavbarMobile(props);
    return <div data-testid="navbar-mobile">Mobile</div>;
  },
}));

// ── Import after mocks ────────────────────────

import { Navbar } from "@/components/layout/Navbar";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Navbar", () => {
  it("renders admin link when user role is ADMIN", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", name: "Admin", email: "admin@example.com" },
    });

    const element = await Navbar();
    render(element);

    expect(screen.getByRole("link", { name: /panel admin/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /panel admin/i })).toHaveAttribute("href", "/admin");
  });

  it("does NOT render admin link when user role is CLIENT", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT", name: "Client", email: "client@example.com" },
    });

    const element = await Navbar();
    render(element);

    expect(screen.queryByRole("link", { name: /panel admin/i })).not.toBeInTheDocument();
  });

  it("does NOT render admin link when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const element = await Navbar();
    render(element);

    expect(screen.queryByRole("link", { name: /panel admin/i })).not.toBeInTheDocument();
  });

  it("renders Mi Perfil link for authenticated users", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT", name: "Client", email: "client@example.com" },
    });

    const element = await Navbar();
    render(element);

    expect(screen.getByRole("link", { name: /mi perfil/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mi perfil/i })).toHaveAttribute("href", "/perfil");
  });

  it("renders Iniciar sesión for unauthenticated users", async () => {
    mockAuth.mockResolvedValue(null);

    const element = await Navbar();
    render(element);

    expect(screen.getByRole("link", { name: /iniciar sesi[oó]n/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iniciar sesi[oó]n/i })).toHaveAttribute("href", "/login");
  });

  it("passes userRole to NavbarMobile", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", name: "Admin", email: "admin@example.com" },
    });

    const element = await Navbar();
    render(element);

    expect(mockNavbarMobile).toHaveBeenCalledWith(
      expect.objectContaining({ userRole: "ADMIN" }),
    );
  });

  it("passes undefined userRole to NavbarMobile when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const element = await Navbar();
    render(element);

    expect(mockNavbarMobile).toHaveBeenCalledWith(
      expect.objectContaining({ userRole: undefined }),
    );
  });
});
