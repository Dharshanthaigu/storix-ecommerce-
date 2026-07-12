import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

const mockProduct: Product = {
  _id: "1",
  name: "Wireless Mouse",
  description: "A mouse",
  price: 799,
  stock: 5,
  images: ["https://example.com/mouse.jpg"],
  category: { _id: "c1", name: "Electronics" },
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ProductCard", () => {
  it("renders product name, category, and price from backend data", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("₹799")).toBeInTheDocument();
  });

  it("shows out of stock badge when stock is 0", () => {
    renderWithRouter(<ProductCard product={{ ...mockProduct, stock: 0 }} />);
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("links to the correct product detail route", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/1");
  });
});