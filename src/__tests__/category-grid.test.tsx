import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockGetCategories = vi.hoisted(() => vi.fn());
vi.mock("@/lib/categories", () => ({
  getCategories: mockGetCategories,
}));

// ── Import after mocks ────────────────────────

import { CategoryGrid } from "@/components/home/CategoryGrid";

beforeEach(() => {
  vi.clearAllMocks();
});

const MOCK_CATEGORIES = [
  { id: "1", name: "Perros", slug: "perros", description: "Todo para tu perro", image: null },
  { id: "2", name: "Gatos", slug: "gatos", description: "Todo para tu gato", image: null },
  { id: "3", name: "Aves", slug: "aves", description: "Todo para tus aves", image: null },
  { id: "4", name: "Peces", slug: "peces", description: "Todo para tu acuario", image: null },
  { id: "5", name: "Roedores", slug: "roedores", description: "Todo para tus roedores", image: null },
  { id: "6", name: "Salud General", slug: "salud-general", description: "Medicamentos y cuidado", image: null },
  { id: "7", name: "Accesorios Generales", slug: "accesorios-generales", description: "Accesorios", image: null },
];

describe("CategoryGrid", () => {
  it("renders the section title", async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES);

    render(await CategoryGrid());

    expect(screen.getByText("Categorías")).toBeInTheDocument();
  });

  it("renders all 7 category cards", async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES);

    render(await CategoryGrid());

    for (const cat of MOCK_CATEGORIES) {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
    }
  });

  it("renders emoji icons for each category", async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES);

    render(await CategoryGrid());

    // The spec mandates specific emojis per slug
    expect(screen.getByText("\u{1F415}")).toBeInTheDocument(); // perros
    expect(screen.getByText("\u{1F431}")).toBeInTheDocument(); // gatos
    expect(screen.getByText("\u{1F426}")).toBeInTheDocument(); // aves
    expect(screen.getByText("\u{1F41F}")).toBeInTheDocument(); // peces
    expect(screen.getByText("\u{1F439}")).toBeInTheDocument(); // roedores
    expect(screen.getByText("\u{1FA7A}")).toBeInTheDocument(); // salud-general
    expect(screen.getByText("\u{1F392}")).toBeInTheDocument(); // accesorios-generales
  });

  it("links each card to the correct filtered URL", async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES);

    render(await CategoryGrid());

    const perrosLink = screen.getByRole("link", { name: /perros/i });
    expect(perrosLink).toHaveAttribute("href", "/productos?categoria=perros");

    const gatosLink = screen.getByRole("link", { name: /gatos/i });
    expect(gatosLink).toHaveAttribute("href", "/productos?categoria=gatos");
  });

  it("calls getCategories once", async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES);

    await CategoryGrid();

    expect(mockGetCategories).toHaveBeenCalledTimes(1);
  });
});
