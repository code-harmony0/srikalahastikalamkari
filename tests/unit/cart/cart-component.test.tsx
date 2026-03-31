import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { ProductCard } from "@/features/products/ProductCard"
import { useCartStore } from "@/shared/cart-store"

// Mock the cart store
jest.mock("@/shared/cart-store", () => ({
  useCartStore: jest.fn(),
}))

describe("TC-CART-001: Add Product to Cart", () => {
  const mockAddItem = jest.fn()
  const mockProduct = {
    id: "prod_kalamkari_001",
    name: "Peacock Paradise Kalamkari Saree",
    price: 4500,
    original_price: 5000,
    description: "Hand-painted Kalamkari saree with peacock motifs",
    mainImage: "/images/products/saree-1.jpg",
    slug: "peacock-paradise-kalamkari-saree",
    stock: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCartStore as jest.Mock).mockReturnValue({
      items: [],
      addItem: mockAddItem,
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      totalItems: 0,
      totalPrice: 0,
    })
  })

  it("should render product card with add to cart button", () => {
    render(<ProductCard product={mockProduct} />)

    expect(
      screen.getByText("Peacock Paradise Kalamkari Saree"),
    ).toBeInTheDocument()
    expect(screen.getByText("₹4,500")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeEnabled()
  })

  it("should add product to cart when button is clicked", async () => {
    render(<ProductCard product={mockProduct} />)

    const addButton = screen.getByRole("button", { name: /add to cart/i })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith({
        id: "prod_kalamkari_001",
        name: "Peacock Paradise Kalalamkari Saree",
        price: 4500,
        mainImage: "/images/products/saree-1.jpg",
        quantity: 1,
      })
    })
  })

  it("should show success toast after adding to cart", async () => {
    render(<ProductCard product={mockProduct} />)

    const addButton = screen.getByRole("button", { name: /add to cart/i })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/added to cart/i)).toBeInTheDocument()
    })
  })

  it("should disable button when product is out of stock", () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)

    const addButton = screen.getByRole("button", { name: /out of stock/i })
    expect(addButton).toBeDisabled()
  })
})
