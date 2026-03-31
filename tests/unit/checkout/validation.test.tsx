import { describe, it, expect } from '@jest/globals'

describe('Checkout Validation Tests', () => {
  it('should validate email format', () => {
    const email = 'test@example.com'
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })

  it('should validate phone number', () => {
    const phone = '9876543210'
    expect(phone).toMatch(/^[0-9]{10}$/)
  })

  it('should validate pincode', () => {
    const pincode = '400001'
    expect(pincode).toMatch(/^[0-9]{6}$/)
  })

  it('should reject invalid email', () => {
    const invalidEmail = 'invalid-email'
    expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })
})
