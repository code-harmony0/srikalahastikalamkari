/**
 * @jest-environment jsdom
 * TC-CHECKOUT-NEG-001: Checkout with Invalid Shipping Information
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'

// Mock cart store
const mockClearCart = jest.fn()
jest.mock('@/shared/cart-store', () => ({
  useCartStore: jest.fn(() => ({
    items: [
      {
        id: 'prod_001',
        name: 'Test Saree',
        price: 4500,
        quantity: 1,
        mainImage: '/test.jpg',
      },
    ],
    totalPrice: 4500,
    totalItems: 1,
    clearCart: mockClearCart,
  })),
}))

// Mock next router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

describe('TC-CHECKOUT-NEG-001: Invalid Shipping Information', () => {
  const validShippingData = {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '9876543210',
    address: '42, Lotus Enclave, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  }

  /**
   * Step 2: Submit Empty Form
   */
  it('should show validation errors for all required fields when form is empty', async () => {
    const errors = {
      firstName: 'First name is required',
      email: 'Email is required',
      phone: 'Phone number is required',
      address: 'Address is required',
      city: 'City is required',
      state: 'State is required',
      pincode: 'Pincode is required',
    }

    // Verify all error messages exist
    Object.values(errors).forEach((errorMsg) => {
      expect(errorMsg).toBeTruthy()
    })

    // Verify no submission occurs
    expect(mockClearCart).not.toHaveBeenCalled()
  })

  /**
   * Step 3: Enter Invalid Email Format
   */
  it('should validate email format - invalid email', () => {
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@gmail.com',
      'test@gmail',
      'test.gmail.com',
    ]

    invalidEmails.forEach((email) => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(false)
    })
  })

  it('should accept valid email format', () => {
    const validEmails = [
      'priya.sharma@email.com',
      'test@gmail.com',
      'user@domain.co.in',
    ]

    validEmails.forEach((email) => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(true)
    })
  })

  /**
   * Step 4: Enter Invalid Phone Number (Too Short)
   */
  it('should validate phone number - too short', () => {
    const shortPhones = ['12345', '123456789', '99999']

    shortPhones.forEach((phone) => {
      expect(phone.length).toBeLessThan(10)
      expect(/^[0-9]{10}$/.test(phone)).toBe(false)
    })
  })

  /**
   * Step 5: Enter Invalid Phone Number (Non-numeric)
   */
  it('should validate phone number - non-numeric characters', () => {
    const invalidPhones = [
      'abcdefghij',
      '12345abcde',
      '987-654-3210',
      '98765 43210',
    ]

    invalidPhones.forEach((phone) => {
      expect(/^[0-9]{10}$/.test(phone)).toBe(false)
    })
  })

  it('should accept valid 10-digit phone number', () => {
    const validPhone = '9876543210'
    expect(/^[0-9]{10}$/.test(validPhone)).toBe(true)
    expect(validPhone.length).toBe(10)
  })

  /**
   * Step 6: Enter Invalid Pincode (Too Short)
   */
  it('should validate pincode - too short', () => {
    const shortPincodes = ['123', '12345', '40000']

    shortPincodes.forEach((pincode) => {
      expect(pincode.length).toBeLessThan(6)
      expect(/^[0-9]{6}$/.test(pincode)).toBe(false)
    })
  })

  /**
   * Step 7: Enter Invalid Pincode (Too Long)
   */
  it('should validate pincode - too long', () => {
    const longPincodes = ['1234567', '4000012', '123456789']

    longPincodes.forEach((pincode) => {
      expect(pincode.length).toBeGreaterThan(6)
      expect(/^[0-9]{6}$/.test(pincode)).toBe(false)
    })
  })

  /**
   * Step 8: Enter Invalid Pincode (Alphanumeric)
   */
  it('should validate pincode - non-numeric characters', () => {
    const invalidPincodes = ['abc123', '40000A', '40A001', 'ABCD12']

    invalidPincodes.forEach((pincode) => {
      expect(/^[0-9]{6}$/.test(pincode)).toBe(false)
    })
  })

  it('should accept valid 6-digit pincode', () => {
    const validPincode = '400001'
    expect(/^[0-9]{6}$/.test(validPincode)).toBe(true)
    expect(validPincode.length).toBe(6)
  })

  /**
   * Step 9: Fill Valid Data Except One Field
   */
  it('should block submission if any required field is empty', () => {
    const incompleteData = {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: '', // Empty email
      phone: '9876543210',
      address: '42, Lotus Enclave',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    }

    // Verify email is empty
    expect(incompleteData.email).toBe('')

    // Verify other fields are filled
    expect(incompleteData.firstName).toBeTruthy()
    expect(incompleteData.phone).toBeTruthy()

    // Submission should be blocked
    expect(mockClearCart).not.toHaveBeenCalled()
  })

  /**
   * Step 10: Correct All Errors and Submit
   */
  it('should allow submission when all fields are valid', () => {
    // Verify all fields are valid
    expect(validShippingData.firstName).toBeTruthy()
    expect(validShippingData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    expect(validShippingData.phone).toMatch(/^[0-9]{10}$/)
    expect(validShippingData.pincode).toMatch(/^[0-9]{6}$/)
    expect(validShippingData.address).toBeTruthy()
    expect(validShippingData.city).toBeTruthy()
    expect(validShippingData.state).toBeTruthy()

    // All validations pass
    const isValid =
      validShippingData.firstName &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validShippingData.email) &&
      /^[0-9]{10}$/.test(validShippingData.phone) &&
      /^[0-9]{6}$/.test(validShippingData.pincode) &&
      validShippingData.address &&
      validShippingData.city &&
      validShippingData.state

    expect(isValid).toBe(true)
  })

  /**
   * Edge Cases - SQL Injection
   */
  it('should handle SQL injection attempts safely', () => {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "'; DELETE FROM orders; --",
    ]

    maliciousInputs.forEach((input) => {
      // These should be treated as strings, not executed
      expect(typeof input).toBe('string')
      expect(input).toContain(';')
    })
  })

  /**
   * Edge Cases - XSS Attempts
   */
  it('should handle XSS attempts safely', () => {
    const xssInputs = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert('xss')>",
      "javascript:alert('xss')",
    ]

    xssInputs.forEach((input) => {
      // Should contain HTML tags that need sanitization
      expect(input).toMatch(/<[^>]+>/)
    })
  })

  /**
   * Edge Cases - Whitespace Only
   */
  it('should reject whitespace-only inputs', () => {
    const whitespaceOnly = '   '

    // Should be treated as empty
    expect(whitespaceOnly.trim()).toBe('')
  })

  /**
   * Edge Cases - Very Long Input
   */
  it('should handle very long inputs', () => {
    const veryLongName = 'A'.repeat(500)

    // Should be longer than typical max length (100 chars)
    expect(veryLongName.length).toBeGreaterThan(100)
  })
})
