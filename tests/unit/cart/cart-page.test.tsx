import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import CartPage from '@/features/cart/CartPage'

const mockCartState = {
  items: [{ productId: 'old-1', quantity: 2, maxStock: 5 }],
  _hasHydrated: true,
  updateQuantity: jest.fn(),
  removeItem: jest.fn(),
}

jest.mock('@/shared/cart-store', () => ({
  useCartStore: (selector?: (state: typeof mockCartState) => unknown) =>
    selector ? selector(mockCartState) : mockCartState,
}))

const mockCatalogue = [
  {
    id: 'old-1',
    name: 'Kanchipuram Silk Kalamkari Dupatta',
    slug: 'kanchipuram-silk-kalamkari-dupatta',
    price: 12899,
    original_price: null,
    images: [],
    stock_quantity: 5,
  },
]

jest.mock('@/shared/hooks/use-products', () => ({
  useProductsByIds: (ids: string[]) => ({
    data: mockCatalogue.filter((product) => ids.includes(product.id)),
    isLoading: false,
    isSuccess: true,
    isFetching: false,
    isPlaceholderData: false,
  }),
}))

jest.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'u1' }, loading: false }),
}))

jest.mock('@/shared/auth-modal-store', () => ({
  useAuthModalStore: () => ({ openModal: jest.fn() }),
}))

jest.mock('@/lib/image-tiers', () => ({ getImageTier: () => null }))

jest.mock('@/components/shared/OptimizedImage', () => ({
  OptimizedImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CartPage', () => {
  it('totals the prices shown, with no tax added on top', () => {
    render(<CartPage />)

    // 2 × ₹12,899 — the line total, subtotal and total all agree
    expect(screen.getAllByText('₹25,798').length).toBeGreaterThanOrEqual(3)
    expect(screen.queryByText(/GST/)).not.toBeInTheDocument()
  })

  it('keeps items whose product was found', () => {
    render(<CartPage />)

    expect(screen.getByText('Kanchipuram Silk Kalamkari Dupatta')).toBeInTheDocument()
    expect(mockCartState.removeItem).not.toHaveBeenCalled()
  })

  it('never sets the total in the display serif', () => {
    render(<CartPage />)

    const amount = screen.getByText('Total').nextElementSibling as HTMLElement
    expect(amount).toHaveTextContent('₹25,798')
    expect(amount.className).not.toMatch(/font-(serif|playfair|heading)/)
  })
})
