// Test utilities and helpers for consistent testing
import { render as rtlRender, RenderOptions } from "@testing-library/react"
import { ReactElement } from "react"

// Custom render function with providers if needed
export function render(ui: ReactElement, options: RenderOptions = {}) {
  return rtlRender(ui, options)
}

// Mock data generators
export const generateMockProduct = (overrides = {}) => ({
  id: "prod_test_001",
  name: "Test Kalamkari Saree",
  price: 4500,
  original_price: 5000,
  description: "Hand-painted test product",
  mainImage: "/images/products/test.jpg",
  slug: "test-kalamkari-saree",
  stock: 10,
  category: "sarees",
  ...overrides,
})

export const generateMockCartItem = (overrides = {}) => ({
  id: "prod_test_001",
  name: "Test Kalamkari Saree",
  price: 4500,
  quantity: 1,
  mainImage: "/images/products/test.jpg",
  ...overrides,
})

export const generateMockOrder = (overrides = {}) => ({
  id: "SKK-2024-001",
  customer_name: "Priya Sharma",
  customer_email: "priya@test.com",
  customer_phone: "9876543210",
  total_amount: 4500,
  status: "pending",
  created_at: new Date().toISOString(),
  order_items: [
    {
      id: "item_001",
      order_id: "SKK-2024-001",
      product_id: "prod_001",
      quantity: 1,
      price_at_purchase: 4500,
    },
  ],
  ...overrides,
})

// Test IDs for consistent querying
export const TEST_IDS = {
  ADD_TO_CART: "add-to-cart-btn",
  CART_BADGE: "cart-badge",
  CHECKOUT_FORM: "checkout-form",
  PLACE_ORDER: "place-order-btn",
  PRODUCT_CARD: "product-card",
  LOADING: "loading-spinner",
  ERROR_MESSAGE: "error-message",
} as const

// Async helpers
export const waitForElement = async (
  callback: () => unknown,
  timeout = 1000,
) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const result = callback()
      if (result) return result
    } catch {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error("Element not found within timeout")
}

// Local storage mock
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
  }
}
