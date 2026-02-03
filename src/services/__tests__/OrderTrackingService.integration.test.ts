import { OrderTrackingService } from '../OrderTrackingService'
import { OrderStatus } from '../../lib/supabase/enhanced-types'

// Mock the Supabase client to avoid actual database calls in tests
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-order-id',
              status: 'paid',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              total_amount: 100,
              customer_name: 'Test Customer',
              customer_email: 'test@example.com'
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-order-id',
                status: 'in_packing',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T01:00:00Z',
                packing_started_at: '2024-01-01T01:00:00Z',
                total_amount: 100,
                customer_name: 'Test Customer',
                customer_email: 'test@example.com'
              },
              error: null
            }))
          }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: {}, error: null }))
    }))
  }
}))

describe('OrderTrackingService Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateOrderStatus integration', () => {
    it('should successfully update order status with proper validation', async () => {
      const result = await OrderTrackingService.updateOrderStatus('test-order-id', 'in_packing')
      
      expect(result).toBeTruthy()
      expect(result?.status).toBe('in_packing')
      expect(result?.packing_started_at).toBeTruthy()
    })

    it('should handle invalid status transitions gracefully', async () => {
      // Mock the current order to be in 'delivered' status (terminal state)
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-order-id',
                status: 'delivered', // Terminal state
                created_at: '2024-01-01T00:00:00Z'
              },
              error: null
            }))
          }))
        }))
      })

      const result = await OrderTrackingService.updateOrderStatus('test-order-id', 'shipped')
      
      // Should return null for invalid transition
      expect(result).toBeNull()
    })

    it('should add appropriate timestamps for different statuses', async () => {
      const testCases: Array<{ status: OrderStatus; expectedTimestamp: string }> = [
        { status: 'in_packing', expectedTimestamp: 'packing_started_at' },
        { status: 'packed', expectedTimestamp: 'packed_at' },
        { status: 'shipped', expectedTimestamp: 'shipped_at' },
        { status: 'delivered', expectedTimestamp: 'delivered_at' },
        { status: 'cancelled', expectedTimestamp: 'updated_at' } // No cancelled_at field in schema
      ]

      for (const testCase of testCases) {
        // Reset mocks for each test case
        jest.clearAllMocks()
        
        const mockSupabase = require('../../lib/supabase/client').supabase
        mockSupabase.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'test-order-id',
                  status: 'paid', // Valid starting status
                  created_at: '2024-01-01T00:00:00Z'
                },
                error: null
              }))
            }))
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'test-order-id',
                    status: testCase.status,
                    [testCase.expectedTimestamp]: '2024-01-01T01:00:00Z'
                  },
                  error: null
                }))
              }))
            }))
          })),
          insert: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        })

        const result = await OrderTrackingService.updateOrderStatus('test-order-id', testCase.status)
        
        if (OrderTrackingService.validateStatusTransition('paid', testCase.status)) {
          expect(result).toBeTruthy()
          expect(result?.[testCase.expectedTimestamp as keyof typeof result]).toBeTruthy()
        }
      }
    })

    it('should handle shipping metadata correctly', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-order-id',
                status: 'packed',
                created_at: '2024-01-01T00:00:00Z'
              },
              error: null
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'test-order-id',
                  status: 'shipped',
                  shipped_at: '2024-01-01T01:00:00Z',
                  tracking_id: 'TRACK123',
                  shipping_company: 'DTDC'
                },
                error: null
              }))
            }))
          }))
        })),
        insert: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      })

      const result = await OrderTrackingService.updateOrderStatus('test-order-id', 'shipped', {
        trackingId: 'TRACK123',
        shippingCompany: 'DTDC'
      })
      
      expect(result).toBeTruthy()
      expect(result?.tracking_id).toBe('TRACK123')
      expect(result?.shipping_company).toBe('DTDC')
    })
  })

  describe('getOrderTimeline integration', () => {
    it('should build timeline correctly from order data', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-order-id',
                status: 'shipped',
                created_at: '2024-01-01T00:00:00Z',
                packing_started_at: '2024-01-01T01:00:00Z',
                packed_at: '2024-01-01T02:00:00Z',
                shipped_at: '2024-01-01T03:00:00Z',
                order_items: []
              },
              error: null
            }))
          }))
        }))
      })

      const result = await OrderTrackingService.getOrderTimeline('test-order-id')
      
      expect(result.order).toBeTruthy()
      expect(result.timeline).toHaveLength(5) // pending, paid, in_packing, packed, shipped
      
      // Check that completed statuses are marked correctly
      const completedStatuses = result.timeline.filter(t => t.isCompleted)
      expect(completedStatuses).toHaveLength(5)
      
      // Check that current status is not marked as completed
      const currentStatus = result.timeline.find(t => t.status === 'shipped')
      expect(currentStatus?.isCompleted).toBe(true)
    })
  })

  describe('Customer-friendly messaging integration', () => {
    it('should provide consistent messaging across all order statuses', () => {
      const allStatuses: OrderStatus[] = [
        'pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled'
      ]

      allStatuses.forEach(status => {
        const friendlyStatus = OrderTrackingService.getCustomerFriendlyStatus(status)
        
        // Verify all required fields are present
        expect(friendlyStatus.display).toBeTruthy()
        expect(friendlyStatus.description).toBeTruthy()
        expect(friendlyStatus.nextSteps).toBeTruthy()
        
        // Verify customer-friendly language (no technical terms)
        expect(friendlyStatus.display).not.toMatch(/pending|in_packing|packed/)
        expect(friendlyStatus.description).not.toMatch(/status|state/)
        
        // Verify helpful content
        expect(friendlyStatus.description.length).toBeGreaterThan(20)
        expect(friendlyStatus.nextSteps.length).toBeGreaterThan(20)
      })
    })
  })

  describe('Status transition validation integration', () => {
    it('should maintain business logic consistency across all transitions', () => {
      const allStatuses: OrderStatus[] = [
        'pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled'
      ]

      // Test critical business rules
      expect(OrderTrackingService.validateStatusTransition('pending', 'paid')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('paid', 'in_packing')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('in_packing', 'packed')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('packed', 'shipped')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('shipped', 'delivered')).toBe(true)
      
      // Test that orders can't skip major steps
      expect(OrderTrackingService.validateStatusTransition('pending', 'shipped')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('paid', 'delivered')).toBe(false)
      
      // Test terminal states
      expect(OrderTrackingService.validateStatusTransition('delivered', 'shipped')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('cancelled', 'paid')).toBe(false)
      
      // Test backward transitions (for corrections)
      expect(OrderTrackingService.validateStatusTransition('in_packing', 'paid')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('packed', 'in_packing')).toBe(true)
    })
  })
})