import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockGetCategoriesForSelect = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin", () => ({
  getCategoriesForSelect: mockGetCategoriesForSelect,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/admin-products", () => ({
  createProduct: vi.fn(),
}));

// ── Import after mocks ────────────────────────

import NewProductPage from "@/app/admin/products/new/page";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock data ─────────────────────────────────

const mockCategories = [
  { id: "cat-1", name: "Perros" },
  { id: "cat-2", name: "Gatos" },
];

// ── Tests ─────────────────────────────────────

describe("NewProductPage", () => {
  it("renders the form title", async () => {
    mockGetCategoriesForSelect.mockResolvedValue(mockCategories);

    const element = await NewProductPage();
    render(element);

    expect(screen.getByText("Nuevo Producto")).toBeInTheDocument();
  });

  it("renders all required form fields", async () => {
    mockGetCategoriesForSelect.mockResolvedValue(mockCategories);

    const element = await NewProductPage();
    render(element);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripci[oó]n/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/marca/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
    // Anchored regex to match "Categoría" but NOT "Subcategoría"
    expect(screen.getByLabelText(/^categor[íi]a$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/im[áa]genes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destacado/i)).toBeInTheDocument();
  });

  it("renders category select options", async () => {
    mockGetCategoriesForSelect.mockResolvedValue(mockCategories);

    const element = await NewProductPage();
    render(element);

    expect(screen.getByText("Perros")).toBeInTheDocument();
    expect(screen.getByText("Gatos")).toBeInTheDocument();
  });

  it("renders a submit button", async () => {
    mockGetCategoriesForSelect.mockResolvedValue(mockCategories);

    const element = await NewProductPage();
    render(element);

    const submitButton = screen.getByRole("button", { name: /crear/i });
    expect(submitButton).toBeInTheDocument();
  });
});
