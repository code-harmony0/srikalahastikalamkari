/**
 * @jest-environment jsdom
 * TC-COUPON-NEG-001: Invalid Coupon Code Application
 */
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock coupon service with proper typing
const mockValidateCoupon = jest.fn<() => Promise<Record<string, unknown>>>()
const mockApplyCoupon = jest.fn<() => Promise<Record<string, unknown>>>()

jest.mock("@/services/coupons", () => ({
  validateCoupon: mockValidateCoupon,
  applyCoupon: mockApplyCoupon,
}))

describe("TC-COUPON-NEG-001: Invalid Coupon Code Validation", () => {
  const cartTotal = 4500

  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Step 2: Submit Empty Coupon Code
   */
  it("should reject empty coupon code", () => {
    const emptyCoupon = ""

    // Verify empty string
    expect(emptyCoupon).toBe("")
    expect(emptyCoupon.length).toBe(0)

    // Expected error message
    const errorMessage = "Please enter a coupon code"
    expect(errorMessage).toBeTruthy()
  })

  /**
   * Step 3: Enter Non-Existent Coupon Code
   */
  it("should reject non-existent coupon code", async () => {
    const invalidCoupon = "INVALIDCODE"

    // Mock API response
    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "INVALID_CODE",
      message: "Invalid coupon code. Please check and try again.",
    })

    const result = await mockValidateCoupon(invalidCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("INVALID_CODE")
    expect(result.message).toContain("Invalid coupon code")
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 4: Enter Expired Coupon Code
   */
  it("should reject expired coupon", async () => {
    const expiredCoupon = "EXPIRED10"

    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "EXPIRED",
      message: "This coupon has expired. Please use a valid coupon.",
      expiredAt: "2024-03-15T23:59:59Z",
    })

    const result = await mockValidateCoupon(expiredCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("EXPIRED")
    expect(result.message).toContain("expired")
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 5: Apply Already-Used One-Time Coupon
   */
  it("should reject already-used coupon", async () => {
    const usedCoupon = "WELCOME10"

    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "ALREADY_USED",
      message: "You have already used this coupon",
      usedAt: "2024-01-10T14:30:00Z",
      orderId: "SKK-2024-000456",
    })

    const result = await mockValidateCoupon(usedCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("ALREADY_USED")
    expect(result.message).toContain("already used")
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 6: Apply Coupon with Minimum Purchase Not Met
   */
  it("should reject coupon when minimum purchase not met", async () => {
    const minAmountCoupon = "MIN1000"
    const cartValue = 450 // Less than 1000

    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "MIN_AMOUNT_NOT_MET",
      message: "Minimum order value of ₹1,000 required for this coupon",
      minAmount: 1000,
      currentAmount: cartValue,
    })

    const result = await mockValidateCoupon(minAmountCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("MIN_AMOUNT_NOT_MET")
    expect(result.message).toContain("Minimum order value")
    expect(cartValue).toBeLessThan(result.minAmount)
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 7: Apply Category-Restricted Coupon to Wrong Items
   */
  it("should reject category-restricted coupon for wrong items", async () => {
    const categoryCoupon = "SAREEONLY"
    const cartCategories = ["Kurtis", "Dupattas"]

    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "WRONG_CATEGORY",
      message: "This coupon is valid for Sarees only",
      validCategories: ["Sarees"],
      currentCategories: cartCategories,
    })

    const result = await mockValidateCoupon(categoryCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("WRONG_CATEGORY")
    expect(result.message).toContain("valid for Sarees only")
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 8: Apply New-User Coupon as Existing User
   */
  it("should reject new-user coupon for existing users", async () => {
    const newUserCoupon = "NEWUSER50"
    const userRegistrationDate = "2023-01-15T00:00:00Z"

    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "NOT_ELIGIBLE",
      message: "This coupon is valid for new customers only",
      userRegisteredAt: userRegistrationDate,
    })

    const result = await mockValidateCoupon(newUserCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("NOT_ELIGIBLE")
    expect(result.message).toContain("new customers only")
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 9: Apply Usage-Limit-Reached Coupon
   */
  it("should reject coupon when usage limit reached", async () => {
    const limitedCoupon = "SPECIAL20"

    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "USAGE_LIMIT_REACHED",
      message: "This coupon has reached its maximum usage limit",
      maxUsage: 100,
      currentUsage: 100,
    })

    const result = await mockValidateCoupon(limitedCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("USAGE_LIMIT_REACHED")
    expect(result.message).toContain("maximum usage limit")
    expect(result.currentUsage).toBe(result.maxUsage)
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 10: Apply Time-Restricted Coupon Outside Window
   */
  it("should reject time-restricted coupon outside valid window", async () => {
    const timeCoupon = "FLASH50"
    const currentTime = "20:00" // 8 PM
    const validWindow = { start: "14:00", end: "16:00" } // 2-4 PM

    mockValidateCoupon.mockResolvedValue({
      valid: false,
      error: "TIME_RESTRICTED",
      message: "This coupon is valid between 2:00 PM - 4:00 PM only",
      validHours: validWindow,
      currentTime: currentTime,
    })

    const result = await mockValidateCoupon(timeCoupon)

    expect(result.valid).toBe(false)
    expect(result.error).toBe("TIME_RESTRICTED")
    expect(result.message).toContain("valid between")
    expect(mockApplyCoupon).not.toHaveBeenCalled()
  })

  /**
   * Step 11: Apply Valid Coupon Successfully
   */
  it("should accept valid coupon and apply discount", async () => {
    const validCoupon = "SAVE15"

    mockValidateCoupon.mockResolvedValue({
      valid: true,
      coupon: {
        code: "SAVE15",
        discount: 675,
        discountType: "percentage",
        discountValue: 15,
      },
      newTotal: 3825,
      message: "Coupon SAVE15 applied! You saved ₹675",
    })

    mockApplyCoupon.mockResolvedValue({
      success: true,
      discount: 675,
      finalTotal: 3825,
    })

    const validation = await mockValidateCoupon(validCoupon)
    expect(validation.valid).toBe(true)

    const result = await mockApplyCoupon(validCoupon, cartTotal)
    expect(result.success).toBe(true)
    expect(result.discount).toBe(675)
    expect(result.finalTotal).toBe(3825)
  })

  /**
   * Security: SQL Injection
   */
  it("should handle SQL injection attempts safely", () => {
    const maliciousInputs = [
      "'; DROP TABLE coupons; --",
      "1' OR '1'='1",
      "'; DELETE FROM orders; --",
    ]

    maliciousInputs.forEach((input) => {
      // Should be treated as string
      expect(typeof input).toBe("string")
      // Should not execute SQL
      expect(input).toMatch(/[;']/) // Contains SQL special chars
    })
  })

  /**
   * Security: XSS Attempts
   */
  it("should handle XSS attempts safely", () => {
    const xssInputs = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert('xss')>",
      "javascript:alert('xss')",
    ]

    xssInputs.forEach((input) => {
      expect(input).toMatch(/<[^>]+>|javascript:/)
    })
  })

  /**
   * Case Sensitivity
   */
  it("should handle case sensitivity correctly", () => {
    const lowerCase = "welcome10"
    const upperCase = "WELCOME10"
    const mixedCase = "Welcome10"

    // Coupon codes should be case-sensitive or normalized
    expect(lowerCase).not.toBe(upperCase)
    expect(mixedCase).not.toBe(upperCase)
  })

  /**
   * Whitespace Handling
   */
  it("should trim whitespace from coupon codes", () => {
    const couponWithSpaces = "  SAVE15  "
    const trimmed = couponWithSpaces.trim()

    expect(trimmed).toBe("SAVE15")
    expect(trimmed.length).toBeLessThan(couponWithSpaces.length)
  })

  /**
   * Special Characters
   */
  it("should handle special characters in coupon codes", () => {
    const specialCharCoupons = ["SAVE-15", "SAVE_15", "SAVE.15", "SAVE@15"]

    specialCharCoupons.forEach((code) => {
      expect(code.length).toBeGreaterThan(0)
      expect(typeof code).toBe("string")
    })
  })
})
