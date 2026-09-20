import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CheckoutPage from '@/features/checkout/CheckoutPage'

// Checkout used to price the cart against the first page of the catalogue — 12
// products — so anything older was charged at ₹0. This product stands in for one
// outside that page: checkout must ask for it by id and charge its full price.
const mockCatalogue = [
  {
    id: 'old-1',
    name: 'Kanchipuram Silk Kalamkari Dupatta',
    slug: 'kanchipuram-silk-kalamkari-dupatta',
    price: 12899,
    images: [],
    stock_quantity: 5,
  },
]

const mockCartState = {
  items: [{ productId: 'old-1', quantity: 1, maxStock: 5 }],
  _hasHydrated: true,
  clearCart: jest.fn(),
  getTotalPrice: (products: Array<{ id: string; price: number }>) =>
    mockCartState.items.reduce(
      (sum, item) =>
        sum + (products.find((p) => p.id === item.productId)?.price || 0) * item.quantity,
      0,
    ),
}

jest.mock('@/shared/cart-store', () => ({
  useCartStore: (selector?: (state: typeof mockCartState) => unknown) =>
    selector ? selector(mockCartState) : mockCartState,
}))

jest.mock('@/shared/hooks/use-products', () => ({
  useProductsByIds: (ids: string[]) => ({
    data: mockCatalogue.filter((product) => ids.includes(product.id)),
    isLoading: false,
  }),
}))

jest.mock('@/shared/hooks/use-coupon', () => ({
  useCoupon: () => ({
    appliedCoupon: null,
    isLoading: false,
    error: null,
    applyCoupon: jest.fn(),
    removeCoupon: jest.fn(),
  }),
  incrementCouponUsage: jest.fn(),
}))

jest.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'u1', phoneNumber: null }, loading: false }),
}))

jest.mock('@/shared/auth-modal-store', () => ({
  useAuthModalStore: () => ({ openModal: jest.fn() }),
}))

jest.mock('@/shared/config/environment', () => ({
  __esModule: true,
  default: { razorpay: { keyId: 'test' } },
}))

// The "Before you go" strip suggests other pieces; these tests are about the total.
jest.mock('@/services/products', () => ({
  productsService: { getFeaturedEfficient: jest.fn().mockResolvedValue([]) },
}))

const renderCheckout = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <CheckoutPage />
    </QueryClientProvider>,
  )

jest.mock('@/lib/image-tiers', () => ({ getImageTier: () => null }))

jest.mock('@/components/shared/OptimizedImage', () => ({
  OptimizedImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

describe('CheckoutPage', () => {
  it('charges the full price of every cart item, looked up by id', () => {
    renderCheckout()

    expect(screen.getByText('Kanchipuram Silk Kalamkari Dupatta')).toBeInTheDocument()

    // desktop order summary and the mobile pay bar
    const totals = screen
      .getAllByText(/^Total( amount)?$/)
      .map((label) => label.nextElementSibling as HTMLElement)
    expect(totals).toHaveLength(2)
    totals.forEach((amount) => {
      expect(amount).toHaveTextContent('₹12,899')
      expect(amount.className).not.toMatch(/font-(serif|playfair|heading)/)
    })
  })

  it('makes no delivery or security promise checkout cannot keep', () => {
    renderCheckout()

    expect(screen.queryByText(/international/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/express/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/256-bit/i)).not.toBeInTheDocument()
  })
})
