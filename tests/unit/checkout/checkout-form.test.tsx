import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { useRouter } from 'next/navigation'
import CheckoutPage from '@/features/checkout/CheckoutPage'
import { useCartStore } from '@/shared/cart-store'

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/shared/cart-store', () => ({
  useCartStore: jest.fn()
}))

jest.mock('@/shared/hooks/use-products', () => ({
  useProducts: jest.fn()
}))

describe('TC-CHECKOUT-001: Complete Purchase Checkout Flow', () => {
  const mockPush = jest.fn()
  const mockClearCart = jest.fn()
  
  const mockCartItems = [
    {
      id: 'prod_001',
      name: 'Peacock Paradise Kalamkari Saree',
      price: 4500,
      quantity: 1,
      mainImage: '/images/products/saree-1.jpg'
    }
  ]

  const validShippingData = {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '9876543210',
    address: '42, Lotus Enclave, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: mockCartItems,
      totalPrice: 4500,
      totalItems: 1,
      clearCart: mockClearCart
    })
  })

  it('should render checkout form with all required fields', () => {
    render(<CheckoutPage />)
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pincode/i)).toBeInTheDocument()
  })

  it('should show order summary with cart items', () => {
    render(<CheckoutPage />)
    
    expect(screen.getByText('Peacock Paradise Kalamkari Saree')).toBeInTheDocument()
    expect(screen.getByText(/order total/i)).toBeInTheDocument()
  })

  it('should validate required fields before submission', async () => {
    render(<CheckoutPage />)
    
    const placeOrderButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(placeOrderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(<CheckoutPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)
    
    const placeOrderButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(placeOrderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('should validate phone number format', async () => {
    render(<CheckoutPage />)
    
    const phoneInput = screen.getByLabelText(/phone/i)
    fireEvent.change(phoneInput, { target: { value: '12345' } })
    fireEvent.blur(phoneInput)
    
    const placeOrderButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(placeOrderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/phone number must be 10 digits/i)).toBeInTheDocument()
    })
  })
})
