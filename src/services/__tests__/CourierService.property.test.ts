import * as fc from 'fast-check'
import { CourierService, CourierConfiguration, CourierType } from '../CourierService'

/**
 * Property-Based Tests for Courier Integration Service
 * 
 * Feature: enhanced-order-tracking
 * 
 * These tests validate universal properties that should hold across all possible inputs
 * for the CourierService integration functionality.
 */

// Mock Supabase client for property tests
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: mockCouriersForProperty,
            error: null
          }))
        })),
        order: jest.fn(() => Promise.resolve({
          data: mockCouriersForProperty,
          error: null
        }))
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: '999',
              courier_code: 'test',
              courier_name: 'Test Courier',
              tracking_url_pattern: 'https://test.com/track/{trackingNumber}',
              delivery_timeframe_days: 3,
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          error: null
        }))
      }))
    }))
  }
}))

// Comprehensive mock courier data for property testing
const mockCouriersForProperty: CourierConfiguration[] = [
  {
    id: '1',
    courier_code: 'dtdc',
    courier_name: 'DTDC',
    tracking_url_pattern: 'https://www.dtdc.in/tracking/tracking_results.asp?strCnno={trackingNumber}',
    delivery_timeframe_days: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    courier_code: 'bluedart',
    courier_name: 'Blue Dart',
    tracking_url_pattern: 'https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo={trackingNumber}',
    delivery_timeframe_days: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    courier_code: 'delhivery',
    courier_name: 'Delhivery',
    tracking_url_pattern: 'https://www.delhivery.com/track/package/{trackingNumber}',
    delivery_timeframe_days: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    courier_code: 'ecom',
    courier_name: 'Ecom Express',
    tracking_url_pattern: 'https://ecomexpress.in/tracking/?awb={trackingNumber}',
    delivery_timeframe_days: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    courier_code: 'fedex',
    courier_name: 'FedEx',
    tracking_url_pattern: 'https://www.fedex.com/fedextrack/?tracknum={trackingNumber}',
    delivery_timeframe_days: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    courier_code: 'ups',
    courier_name: 'UPS',
    tracking_url_pattern: 'https://www.ups.com/track?tracknum={trackingNumber}',
    delivery_timeframe_days: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    courier_code: 'dhl',
    courier_name: 'DHL',
    tracking_url_pattern: 'https://www.dhl.com/track?trackingNumber={trackingNumber}',
    delivery_timeframe_days: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    courier_code: 'aramex',
    courier_name: 'Aramex',
    tracking_url_pattern: 'https://www.aramex.com/track/results?ShipmentNumber={trackingNumber}',
    delivery_timeframe_days: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '9',
    courier_code: 'manual',
    courier_name: 'Manual Delivery',
    tracking_url_pattern: '',
    delivery_timeframe_days: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    courier_code: 'instore',
    courier_name: 'In-Store Pickup',
    tracking_url_pattern: '',
    delivery_timeframe_days: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

describe('CourierService Property-Based Tests', () => {
  
  beforeEach(() => {
    // Clear cache before each test
    CourierService.clearCache()
    jest.clearAllMocks()
  })

  // Generators for property testing
  const courierCodeArb = fc.constantFrom<CourierType>(
    'dtdc', 'bluedart', 'delhivery', 'ecom', 'fedex', 'ups', 'dhl', 'aramex', 'manual', 'instore'
  )

  const trackingNumberArb = fc.oneof(
    // Valid tracking numbers for different couriers
    fc.string({ minLength: 6, maxLength: 20 }).filter(s => /^[A-Z0-9\-_]+$/i.test(s)),
    // DTDC style
    fc.string({ minLength: 10, maxLength: 15 }).filter(s => /^[A-Z0-9]+$/i.test(s)),
    // Blue Dart style
    fc.string({ minLength: 6, maxLength: 12 }).filter(s => /^[A-Z0-9]+$/i.test(s)),
    // FedEx style (numeric)
    fc.integer({ min: 100000000000, max: 99999999999999 }).map(n => n.toString()),
    // UPS style
    fc.string({ minLength: 18, maxLength: 18 }).filter(s => s.startsWith('1Z') && /^1Z[A-Z0-9]{16}$/i.test(s)),
    // DHL style (numeric)
    fc.integer({ min: 1000000000, max: 99999999999 }).map(n => n.toString()),
    // Edge cases
    fc.constantFrom('', '   ', 'A', 'AB', 'A'.repeat(50))
  )

  const courierTrackingPairArb = fc.tuple(courierCodeArb, trackingNumberArb)

  /**
   * **Feature: enhanced-order-tracking, Property 3: Tracking Information Completeness**
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   * 
   * For any shipped order, the system should:
   * - Store tracking numbers provided by the courier
   * - Provide direct links to courier tracking pages
   * - Display courier service name and expected delivery timeframe
   * - Ensure all tracking information is complete and accessible
   */
  describe('Property 3: Tracking Information Completeness', () => {
    it('should provide complete courier information for all supported couriers', async () => {
      await fc.assert(fc.asyncProperty(courierCodeArb, async (courierCode) => {
        const courierInfo = await CourierService.getCourierInfo(courierCode)
        
        // All supported couriers must provide complete information
        expect(courierInfo).toBeDefined()
        expect(courierInfo.displayName).toBeTruthy()
        expect(courierInfo.displayName.length).toBeGreaterThan(0)
        
        // Display name should be human-readable and properly formatted
        expect(courierInfo.displayName).not.toMatch(/^[a-z]+$/) // Not all lowercase
        expect(courierInfo.displayName.trim()).toBe(courierInfo.displayName) // No leading/trailing spaces
        
        // Courier information should be consistent
        const secondCall = await CourierService.getCourierInfo(courierCode)
        expect(courierInfo.displayName).toBe(secondCall.displayName)
        expect(courierInfo.supportsTracking).toBe(secondCall.supportsTracking)
        
        // Active couriers should have valid configuration
        if (courierInfo.courier) {
          expect(courierInfo.courier.courier_code).toBe(courierCode)
          expect(courierInfo.courier.courier_name).toBeTruthy()
          expect(courierInfo.courier.is_active).toBe(true)
          
          // Delivery timeframe should be reasonable if provided
          if (courierInfo.courier.delivery_timeframe_days !== null) {
            expect(courierInfo.courier.delivery_timeframe_days).toBeGreaterThan(0)
            expect(courierInfo.courier.delivery_timeframe_days).toBeLessThanOrEqual(30) // Reasonable upper bound
          }
        }
      }))
    })

    it('should correctly identify tracking support capabilities for all couriers', async () => {
      await fc.assert(fc.asyncProperty(courierCodeArb, async (courierCode) => {
        const supportsTracking = await CourierService.supportsTracking(courierCode)
        const courierInfo = await CourierService.getCourierInfo(courierCode)
        
        // Tracking support should be consistent across methods
        expect(supportsTracking).toBe(courierInfo.supportsTracking)
        
        // Manual and instore deliveries should never support tracking
        if (courierCode === 'manual' || courierCode === 'instore') {
          expect(supportsTracking).toBe(false)
          expect(courierInfo.supportsTracking).toBe(false)
        }
        
        // Couriers with tracking URL patterns should support tracking
        if (courierInfo.courier && courierInfo.courier.tracking_url_pattern) {
          expect(supportsTracking).toBe(true)
        }
        
        // Tracking support determination should be deterministic
        const secondCheck = await CourierService.supportsTracking(courierCode)
        expect(supportsTracking).toBe(secondCheck)
      }))
    })

    it('should provide delivery timeframes for all active couriers where applicable', async () => {
      await fc.assert(fc.asyncProperty(courierCodeArb, async (courierCode) => {
        const timeframe = await CourierService.getDeliveryTimeframe(courierCode)
        const courierInfo = await CourierService.getCourierInfo(courierCode)
        
        // Timeframe should be consistent across methods
        if (courierInfo.courier) {
          expect(timeframe).toBe(courierInfo.courier.delivery_timeframe_days)
        }
        
        // Valid timeframes should be positive and reasonable
        if (timeframe !== null) {
          expect(timeframe).toBeGreaterThan(0)
          expect(timeframe).toBeLessThanOrEqual(30) // Reasonable maximum
          expect(Number.isInteger(timeframe)).toBe(true) // Should be whole days
        }
        
        // Manual and instore deliveries may not have timeframes
        if (courierCode === 'manual' || courierCode === 'instore') {
          // These can be null as they don't follow standard delivery patterns
          expect(timeframe === null || timeframe > 0).toBe(true)
        }
        
        // Timeframe retrieval should be deterministic
        const secondTimeframe = await CourierService.getDeliveryTimeframe(courierCode)
        expect(timeframe).toBe(secondTimeframe)
      }))
    })

    it('should maintain data integrity across all courier information operations', async () => {
      await fc.assert(fc.asyncProperty(fc.array(courierCodeArb, { minLength: 1, maxLength: 10 }), async (courierCodes) => {
        const uniqueCouriers = [...new Set(courierCodes)]
        
        // All operations should be idempotent
        for (const courierCode of uniqueCouriers) {
          const info1 = await CourierService.getCourierInfo(courierCode)
          const info2 = await CourierService.getCourierInfo(courierCode)
          
          expect(info1.displayName).toBe(info2.displayName)
          expect(info1.supportsTracking).toBe(info2.supportsTracking)
          
          if (info1.courier && info2.courier) {
            expect(info1.courier.courier_code).toBe(info2.courier.courier_code)
            expect(info1.courier.courier_name).toBe(info2.courier.courier_name)
            expect(info1.courier.delivery_timeframe_days).toBe(info2.courier.delivery_timeframe_days)
          }
        }
        
        // Supported couriers list should be consistent
        const supportedCouriers1 = await CourierService.getSupportedCouriers()
        const supportedCouriers2 = await CourierService.getSupportedCouriers()
        expect(supportedCouriers1).toEqual(supportedCouriers2)
        
        // All supported couriers should be in our test set
        supportedCouriers1.forEach(courierCode => {
          expect(uniqueCouriers.includes(courierCode) || 
                 mockCouriersForProperty.some(c => c.courier_code === courierCode)).toBe(true)
        })
      }))
    })

    it('should handle courier information retrieval without errors for any input', async () => {
      await fc.assert(fc.asyncProperty(fc.string({ minLength: 0, maxLength: 50 }), async (courierCode) => {
        // No courier information operation should throw errors
        await expect(CourierService.getCourierInfo(courierCode)).resolves.toBeDefined()
        await expect(CourierService.supportsTracking(courierCode)).resolves.toBeDefined()
        await expect(CourierService.getDeliveryTimeframe(courierCode)).resolves.toBeDefined()
        await expect(CourierService.getCourierDisplayName(courierCode)).resolves.toBeDefined()
        
        // Invalid courier codes should return sensible defaults
        const info = await CourierService.getCourierInfo(courierCode)
        expect(typeof info.supportsTracking).toBe('boolean')
        
        // Display name should be a string (may be empty for empty input)
        expect(typeof info.displayName).toBe('string')
        
        // For non-empty courier codes, display name should be non-empty
        if (courierCode.trim().length > 0) {
          expect(info.displayName.length).toBeGreaterThan(0)
        }
      }))
    })
  })

  /**
   * **Feature: enhanced-order-tracking, Property 4: Courier Link Format Validation**
   * 
   * **Validates: Requirements 2.5**
   * 
   * For any supported courier service and tracking number combination:
   * - Tracking links should be formatted correctly according to courier URL patterns
   * - URLs should be valid and properly constructed
   * - Tracking numbers should be properly validated before URL generation
   * - Special characters and edge cases should be handled appropriately
   */
  describe('Property 4: Courier Link Format Validation', () => {
    it('should generate correctly formatted tracking URLs for all courier-tracking combinations', async () => {
      await fc.assert(fc.asyncProperty(courierTrackingPairArb, async ([courierCode, trackingNumber]) => {
        const trackingUrl = await CourierService.generateTrackingUrl(courierCode, trackingNumber)
        const supportsTracking = await CourierService.supportsTracking(courierCode)
        
        // URL generation should be consistent with tracking support
        if (!supportsTracking) {
          expect(trackingUrl).toBeNull()
        } else if (trackingUrl !== null) {
          // Valid URLs should be properly formatted
          expect(trackingUrl).toMatch(/^https?:\/\//)
          expect(trackingUrl).toContain(trackingNumber)
          
          // URL should not contain placeholder text
          expect(trackingUrl).not.toContain('{trackingNumber}')
          expect(trackingUrl).not.toContain('{')
          expect(trackingUrl).not.toContain('}')
          
          // URL should be a valid format
          expect(() => new URL(trackingUrl)).not.toThrow()
          
          // URL should contain the tracking number exactly as provided
          const url = new URL(trackingUrl)
          const urlString = url.toString()
          expect(urlString).toContain(trackingNumber)
        }
        
        // URL generation should be deterministic
        const secondUrl = await CourierService.generateTrackingUrl(courierCode, trackingNumber)
        expect(trackingUrl).toBe(secondUrl)
      }))
    })

    it('should validate tracking numbers according to courier-specific rules', () => {
      fc.assert(fc.property(courierTrackingPairArb, ([courierCode, trackingNumber]) => {
        const isValid = CourierService.validateTrackingNumber(courierCode, trackingNumber)
        
        // Validation should be deterministic
        const secondValidation = CourierService.validateTrackingNumber(courierCode, trackingNumber)
        expect(isValid).toBe(secondValidation)
        
        // Empty or whitespace-only tracking numbers should be invalid
        if (!trackingNumber || trackingNumber.trim().length === 0) {
          expect(isValid).toBe(false)
        }
        
        // Very long tracking numbers should be invalid
        if (trackingNumber.length > 30) {
          expect(isValid).toBe(false)
        }
        
        // Very short tracking numbers should be invalid
        if (trackingNumber.trim().length < 3) {
          expect(isValid).toBe(false)
        }
        
        // Tracking numbers with invalid characters should be rejected
        if (/[^A-Z0-9\-_\/\.]/.test(trackingNumber)) {
          expect(isValid).toBe(false)
        }
        
        // Courier-specific validation rules
        if (isValid) {
          const trimmed = trackingNumber.trim()
          
          switch (courierCode.toLowerCase()) {
            case 'dtdc':
              expect(trimmed.length).toBeGreaterThanOrEqual(10)
              expect(trimmed.length).toBeLessThanOrEqual(15)
              expect(/^[A-Z0-9]+$/i.test(trimmed)).toBe(true)
              break
              
            case 'bluedart':
              expect(trimmed.length).toBeGreaterThanOrEqual(6)
              expect(trimmed.length).toBeLessThanOrEqual(12)
              expect(/^[A-Z0-9]+$/i.test(trimmed)).toBe(true)
              break
              
            case 'fedex':
              expect(trimmed.length).toBeGreaterThanOrEqual(12)
              expect(trimmed.length).toBeLessThanOrEqual(14)
              expect(/^[0-9]+$/i.test(trimmed)).toBe(true)
              break
              
            case 'ups':
              expect(trimmed.length).toBe(18)
              expect(trimmed.startsWith('1Z')).toBe(true)
              expect(/^1Z[A-Z0-9]{16}$/i.test(trimmed)).toBe(true)
              break
              
            case 'dhl':
              expect(trimmed.length).toBeGreaterThanOrEqual(10)
              expect(trimmed.length).toBeLessThanOrEqual(11)
              expect(/^[0-9]+$/i.test(trimmed)).toBe(true)
              break
          }
        }
      }))
    })

    it('should handle special characters and edge cases in tracking URLs correctly', async () => {
      await fc.assert(fc.asyncProperty(courierCodeArb, async (courierCode) => {
        const specialTrackingNumbers = [
          'TRACK-123',
          'TRACK_456',
          'TRACK.789',
          'TRACK/ABC',
          'TRACK123-456',
          'A1B2C3D4E5',
          '1234567890123456',
          'ABC123XYZ789'
        ]
        
        for (const trackingNumber of specialTrackingNumbers) {
          const trackingUrl = await CourierService.generateTrackingUrl(courierCode, trackingNumber)
          const supportsTracking = await CourierService.supportsTracking(courierCode)
          
          if (supportsTracking && trackingUrl !== null) {
            // URL should properly encode special characters
            expect(trackingUrl).toMatch(/^https?:\/\//)
            
            // URL should be valid
            expect(() => new URL(trackingUrl)).not.toThrow()
            
            // Tracking number should be present in the URL
            const url = new URL(trackingUrl)
            const urlString = url.toString()
            expect(urlString).toContain(trackingNumber)
            
            // Special characters should be properly handled
            if (trackingNumber.includes('-')) {
              expect(urlString).toContain('-')
            }
            if (trackingNumber.includes('_')) {
              expect(urlString).toContain('_')
            }
            if (trackingNumber.includes('.')) {
              expect(urlString).toContain('.')
            }
            if (trackingNumber.includes('/')) {
              expect(urlString).toContain('/')
            }
          }
        }
      }))
    })

    it('should maintain URL format consistency across all supported couriers', async () => {
      await fc.assert(fc.asyncProperty(fc.array(courierCodeArb, { minLength: 1, maxLength: 10 }), async (courierCodes) => {
        const uniqueCouriers = [...new Set(courierCodes)]
        const testTrackingNumber = 'TEST123456789'
        
        for (const courierCode of uniqueCouriers) {
          const trackingUrl = await CourierService.generateTrackingUrl(courierCode, testTrackingNumber)
          const supportsTracking = await CourierService.supportsTracking(courierCode)
          
          if (supportsTracking && trackingUrl !== null) {
            // All tracking URLs should follow consistent patterns
            expect(trackingUrl).toMatch(/^https?:\/\//)
            expect(trackingUrl).toContain(testTrackingNumber)
            expect(trackingUrl).not.toContain('{')
            expect(trackingUrl).not.toContain('}')
            
            // URL should be valid
            const url = new URL(trackingUrl)
            expect(url.protocol).toMatch(/^https?:$/)
            expect(url.hostname).toBeTruthy()
            expect(url.hostname.length).toBeGreaterThan(0)
            
            // Domain should be reasonable (not localhost, not IP)
            expect(url.hostname).not.toBe('localhost')
            expect(url.hostname).not.toMatch(/^\d+\.\d+\.\d+\.\d+$/)
            expect(url.hostname).toContain('.')
            
            // Path or query should contain the tracking number
            const fullUrl = url.toString()
            expect(fullUrl).toContain(testTrackingNumber)
          }
        }
      }))
    })

    it('should handle URL generation errors gracefully for any input combination', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 0, maxLength: 100 }),
        async (courierCode, trackingNumber) => {
          // URL generation should never throw errors
          await expect(CourierService.generateTrackingUrl(courierCode, trackingNumber))
            .resolves.toBeDefined()
          
          // Result should be either null or a valid URL string
          const result = await CourierService.generateTrackingUrl(courierCode, trackingNumber)
          expect(result === null || typeof result === 'string').toBe(true)
          
          // If result is a string, it should be a valid URL
          if (result !== null) {
            expect(() => new URL(result)).not.toThrow()
            expect(result).toMatch(/^https?:\/\//)
          }
        }
      ))
    })

    it('should ensure tracking number validation is consistent with URL generation', async () => {
      await fc.assert(fc.asyncProperty(courierTrackingPairArb, async ([courierCode, trackingNumber]) => {
        const isValid = CourierService.validateTrackingNumber(courierCode, trackingNumber)
        const trackingUrl = await CourierService.generateTrackingUrl(courierCode, trackingNumber)
        const supportsTracking = await CourierService.supportsTracking(courierCode)
        
        // If courier doesn't support tracking, URL should be null regardless of validation
        if (!supportsTracking) {
          expect(trackingUrl).toBeNull()
        }
        
        // If tracking number is invalid, URL generation should handle gracefully
        if (!isValid && supportsTracking) {
          // URL might still be generated but should be handled appropriately
          if (trackingUrl !== null) {
            expect(trackingUrl).toMatch(/^https?:\/\//)
            expect(() => new URL(trackingUrl)).not.toThrow()
          }
        }
        
        // Valid tracking numbers for supported couriers should generate URLs
        if (isValid && supportsTracking && trackingNumber.trim().length > 0) {
          // Should generate a URL (though it might be null for edge cases)
          if (trackingUrl !== null) {
            expect(trackingUrl).toMatch(/^https?:\/\//)
            expect(trackingUrl).toContain(trackingNumber.trim())
          }
        }
      }))
    })
  })

  /**
   * Additional comprehensive property tests for courier integration
   */
  describe('Comprehensive Courier Integration Properties', () => {
    it('should maintain system stability across all courier operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(courierTrackingPairArb, { minLength: 1, maxLength: 20 }),
        async (courierTrackingPairs) => {
          // All operations should complete without throwing errors
          for (const [courierCode, trackingNumber] of courierTrackingPairs) {
            await expect(CourierService.generateTrackingUrl(courierCode, trackingNumber))
              .resolves.toBeDefined()
            
            expect(() => CourierService.validateTrackingNumber(courierCode, trackingNumber))
              .not.toThrow()
            
            await expect(CourierService.supportsTracking(courierCode))
              .resolves.toBeDefined()
            
            await expect(CourierService.getCourierInfo(courierCode))
              .resolves.toBeDefined()
          }
        }
      ))
    })

    it('should ensure data consistency across all courier service methods', async () => {
      await fc.assert(fc.asyncProperty(courierCodeArb, async (courierCode) => {
        // All methods should return consistent information about the same courier
        const courierInfo = await CourierService.getCourierInfo(courierCode)
        const supportsTracking = await CourierService.supportsTracking(courierCode)
        const displayName = await CourierService.getCourierDisplayName(courierCode)
        const timeframe = await CourierService.getDeliveryTimeframe(courierCode)
        
        // Information should be consistent across methods
        expect(courierInfo.supportsTracking).toBe(supportsTracking)
        expect(courierInfo.displayName).toBe(displayName)
        
        if (courierInfo.courier) {
          expect(courierInfo.courier.delivery_timeframe_days).toBe(timeframe)
        }
        
        // Multiple calls should return identical results
        const courierInfo2 = await CourierService.getCourierInfo(courierCode)
        const supportsTracking2 = await CourierService.supportsTracking(courierCode)
        const displayName2 = await CourierService.getCourierDisplayName(courierCode)
        const timeframe2 = await CourierService.getDeliveryTimeframe(courierCode)
        
        expect(courierInfo.displayName).toBe(courierInfo2.displayName)
        expect(courierInfo.supportsTracking).toBe(courierInfo2.supportsTracking)
        expect(supportsTracking).toBe(supportsTracking2)
        expect(displayName).toBe(displayName2)
        expect(timeframe).toBe(timeframe2)
      }))
    })

    it('should handle edge cases and boundary conditions appropriately', async () => {
      await fc.assert(fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant(null),
          fc.constant(undefined),
          fc.string({ minLength: 100, maxLength: 200 }),
          fc.string().filter(s => /[^A-Za-z0-9\-_]/.test(s))
        ),
        async (edgeCaseInput) => {
          // System should handle edge cases gracefully
          const inputStr = edgeCaseInput?.toString() || ''
          
          await expect(CourierService.getCourierInfo(inputStr))
            .resolves.toBeDefined()
          
          await expect(CourierService.supportsTracking(inputStr))
            .resolves.toBeDefined()
          
          await expect(CourierService.generateTrackingUrl(inputStr, 'TEST123'))
            .resolves.toBeDefined()
          
          expect(() => CourierService.validateTrackingNumber(inputStr, 'TEST123'))
            .not.toThrow()
          
          // Results should be sensible defaults for invalid inputs
          const info = await CourierService.getCourierInfo(inputStr)
          expect(typeof info.displayName).toBe('string')
          expect(typeof info.supportsTracking).toBe('boolean')
          
          // For non-empty inputs, display name should be non-empty
          if (inputStr.trim().length > 0) {
            expect(info.displayName.length).toBeGreaterThan(0)
          }
        }
      ))
    })
  })
})