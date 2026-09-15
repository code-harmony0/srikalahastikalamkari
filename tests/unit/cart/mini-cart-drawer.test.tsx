import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import MiniCartDrawer from '@/features/cart/MiniCartDrawer'
import { useMiniCartStore } from '@/shared/mini-cart-store'

const mockUpdateQuantity = jest.fn()
const mockRemoveItem = jest.fn()

let cartItems: any[] = []

jest.mock('@/shared/cart-store', () => ({
  useCartStore: () => ({
    items: cartItems,
    updateQuantity: mockUpdateQuantity,
    removeItem: mockRemoveItem,
  }),
}))

// The drawer now asks only for the products in the cart, so the mock answers
// the same way the real hook does: with the requested ids that exist.
const mockCatalogue = [
  { id: 'p1', name: 'Kalamkari Saree', slug: 'kalamkari-saree', price: 8500, images: [] },
  { id: 'p2', name: 'Cotton Dupatta', slug: 'cotton-dupatta', price: 1500, images: [] },
]

jest.mock('@/shared/hooks/use-products', () => ({
  useProductsByIds: (ids: string[]) => ({
    data: mockCatalogue.filter((product) => ids.includes(product.id)),
  }),
}))

jest.mock('@/lib/image-tiers', () => ({ getImageTier: () => null }))

beforeEach(() => {
  jest.clearAllMocks()
  cartItems = [{ productId: 'p1', quantity: 2, maxStock: 5 }]
  useMiniCartStore.setState({ isOpen: false, lastAddedId: null })
})

describe('MiniCartDrawer', () => {
  it('stays hidden until something is added', () => {
    render(<MiniCartDrawer />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens showing what was added, with both onward paths', () => {
    useMiniCartStore.setState({ isOpen: true, lastAddedId: 'p1' })
    render(<MiniCartDrawer />)

    expect(screen.getByRole('dialog', { name: /shopping cart/i })).toBeInTheDocument()
    expect(screen.getByText('Kalamkari Saree')).toBeInTheDocument()
    // Issue 08 requires both "continue shopping" and "checkout"
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to checkout/i })).toBeInTheDocument()
  })

  it('shows the subtotal for the quantity held', () => {
    useMiniCartStore.setState({ isOpen: true })
    render(<MiniCartDrawer />)
    expect(screen.getByText(/17,000/)).toBeInTheDocument() // 8500 x 2
  })

  it('updates quantity in place', () => {
    useMiniCartStore.setState({ isOpen: true })
    render(<MiniCartDrawer />)

    fireEvent.click(screen.getByLabelText(/increase quantity/i))
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 3)

    fireEvent.click(screen.getByLabelText(/decrease quantity/i))
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 1)
  })

  it('caps the increase at available stock', () => {
    cartItems = [{ productId: 'p1', quantity: 5, maxStock: 5 }]
    useMiniCartStore.setState({ isOpen: true })
    render(<MiniCartDrawer />)
    expect(screen.getByLabelText(/increase quantity/i)).toBeDisabled()
  })

  it('removes a line', () => {
    useMiniCartStore.setState({ isOpen: true })
    render(<MiniCartDrawer />)
    fireEvent.click(screen.getByLabelText(/remove .* from cart/i))
    expect(mockRemoveItem).toHaveBeenCalledWith('p1')
  })

  it('closes on Continue Shopping', () => {
    useMiniCartStore.setState({ isOpen: true })
    render(<MiniCartDrawer />)
    fireEvent.click(screen.getByRole('button', { name: /continue shopping/i }))
    expect(useMiniCartStore.getState().isOpen).toBe(false)
  })

  it('ignores cart lines whose product no longer exists', () => {
    cartItems = [{ productId: 'gone', quantity: 1 }]
    useMiniCartStore.setState({ isOpen: true })
    render(<MiniCartDrawer />)
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })
})
