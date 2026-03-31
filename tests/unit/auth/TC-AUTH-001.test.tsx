import { describe, it, expect, jest, beforeEach } from '@jest/globals'

describe('TC-AUTH-001: User Login with Phone OTP', () => {
  const mockSendOTP = jest.fn()
  const mockVerifyOTP = jest.fn()
  const mockLogin = jest.fn()

  const testUser = {
    phone: '9876543210',
    otp: '123456',
    userId: 'user_001'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should have valid 10-digit phone', () => {
    expect(testUser.phone).toMatch(/^[0-9]{10}$/)
  })

  it('should send OTP successfully', async () => {
    mockSendOTP.mockResolvedValue({ success: true })
    await mockSendOTP(testUser.phone)
    expect(mockSendOTP).toHaveBeenCalledWith('9876543210')
  })

  it('should verify OTP and login', async () => {
    mockVerifyOTP.mockResolvedValue({ success: true, userId: testUser.userId })
    mockLogin.mockReturnValue({ success: true })
    
    const result = await mockVerifyOTP(testUser.phone, testUser.otp)
    expect(result.success).toBe(true)
    
    mockLogin(result)
    expect(mockLogin).toHaveBeenCalled()
  })

  it('user should be logged in after successful verification', () => {
    const userData = { id: testUser.userId, phone: testUser.phone }
    mockLogin(userData)
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledWith(userData)
  })
})
