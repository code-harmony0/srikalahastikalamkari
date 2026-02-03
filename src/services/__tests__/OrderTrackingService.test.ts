import { OrderTrackingService } from '../OrderTrackingService'
import { OrderStatus } from '../../lib/supabase/enhanced-types'

describe('OrderTrackingService', () => {
  describe('validateStatusTransition', () => {
    it('should allow valid transitions from pending', () => {
      expect(OrderTrackingService.validateStatusTransition('pending', 'paid')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('pending', 'cancelled')).toBe(true)
    })

    it('should reject invalid transitions from pending', () => {
      expect(OrderTrackingService.validateStatusTransition('pending', 'shipped')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('pending', 'delivered')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('pending', 'in_packing')).toBe(false)
    })

    it('should allow valid transitions from paid', () => {
      expect(OrderTrackingService.validateStatusTransition('paid', 'in_packing')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('paid', 'cancelled')).toBe(true)
    })

    it('should reject invalid transitions from paid', () => {
      expect(OrderTrackingService.validateStatusTransition('paid', 'shipped')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('paid', 'delivered')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('paid', 'pending')).toBe(false)
    })

    it('should allow valid transitions from in_packing', () => {
      expect(OrderTrackingService.validateStatusTransition('in_packing', 'packed')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('in_packing', 'paid')).toBe(true) // Can go back if packing cancelled
      expect(OrderTrackingService.validateStatusTransition('in_packing', 'cancelled')).toBe(true)
    })

    it('should allow valid transitions from packed', () => {
      expect(OrderTrackingService.validateStatusTransition('packed', 'shipped')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('packed', 'in_packing')).toBe(true) // Can go back if needed
    })

    it('should allow valid transitions from shipped', () => {
      expect(OrderTrackingService.validateStatusTransition('shipped', 'delivered')).toBe(true)
    })

    it('should reject transitions from terminal states', () => {
      expect(OrderTrackingService.validateStatusTransition('delivered', 'shipped')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('delivered', 'cancelled')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('cancelled', 'paid')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('cancelled', 'delivered')).toBe(false)
    })

    it('should handle edge cases gracefully', () => {
      // Same status transition should be rejected
      expect(OrderTrackingService.validateStatusTransition('paid', 'paid')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('shipped', 'shipped')).toBe(false)
    })
  })

  describe('getCustomerFriendlyStatus', () => {
    it('should return customer-friendly information for all statuses', () => {
      const statuses: OrderStatus[] = [
        'pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled'
      ]

      statuses.forEach(status => {
        const friendlyStatus = OrderTrackingService.getCustomerFriendlyStatus(status)
        
        expect(friendlyStatus).toBeDefined()
        expect(friendlyStatus.display).toBeTruthy()
        expect(friendlyStatus.description).toBeTruthy()
        expect(friendlyStatus.nextSteps).toBeTruthy()
        
        // Non-terminal statuses should have expected timeframes
        if (status !== 'delivered' && status !== 'cancelled') {
          expect(friendlyStatus.expectedTimeframe).toBeTruthy()
        }
      })
    })

    it('should provide appropriate messaging for each status', () => {
      const pendingStatus = OrderTrackingService.getCustomerFriendlyStatus('pending')
      expect(pendingStatus.display).toBe('Order Received')
      expect(pendingStatus.description).toContain('payment')

      const paidStatus = OrderTrackingService.getCustomerFriendlyStatus('paid')
      expect(paidStatus.display).toBe('Payment Confirmed')
      expect(paidStatus.description).toContain('confirmed')

      const packingStatus = OrderTrackingService.getCustomerFriendlyStatus('in_packing')
      expect(packingStatus.display).toBe('Being Prepared')
      expect(packingStatus.description).toContain('prepared')

      const packedStatus = OrderTrackingService.getCustomerFriendlyStatus('packed')
      expect(packedStatus.display).toBe('Ready to Ship')
      expect(packedStatus.description).toContain('ready')

      const shippedStatus = OrderTrackingService.getCustomerFriendlyStatus('shipped')
      expect(shippedStatus.display).toBe('On the Way')
      expect(shippedStatus.description).toContain('shipped')

      const deliveredStatus = OrderTrackingService.getCustomerFriendlyStatus('delivered')
      expect(deliveredStatus.display).toBe('Delivered')
      expect(deliveredStatus.description).toContain('delivered')

      const cancelledStatus = OrderTrackingService.getCustomerFriendlyStatus('cancelled')
      expect(cancelledStatus.display).toBe('Cancelled')
      expect(cancelledStatus.description).toContain('cancelled')
    })

    it('should provide helpful next steps for each status', () => {
      const statuses: OrderStatus[] = [
        'pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled'
      ]

      statuses.forEach(status => {
        const friendlyStatus = OrderTrackingService.getCustomerFriendlyStatus(status)
        expect(friendlyStatus.nextSteps).toBeTruthy()
        expect(friendlyStatus.nextSteps.length).toBeGreaterThan(10) // Meaningful next steps
      })
    })

    it('should provide realistic timeframes for active statuses', () => {
      const pendingStatus = OrderTrackingService.getCustomerFriendlyStatus('pending')
      expect(pendingStatus.expectedTimeframe).toContain('hours')

      const paidStatus = OrderTrackingService.getCustomerFriendlyStatus('paid')
      expect(paidStatus.expectedTimeframe).toContain('business days')

      const packingStatus = OrderTrackingService.getCustomerFriendlyStatus('in_packing')
      expect(packingStatus.expectedTimeframe).toContain('hours')

      const packedStatus = OrderTrackingService.getCustomerFriendlyStatus('packed')
      expect(packedStatus.expectedTimeframe).toContain('hours')

      const shippedStatus = OrderTrackingService.getCustomerFriendlyStatus('shipped')
      expect(shippedStatus.expectedTimeframe).toContain('business days')
    })
  })

  describe('Status transition validation edge cases', () => {
    it('should handle all possible status combinations', () => {
      const allStatuses: OrderStatus[] = [
        'pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled'
      ]

      // Test all combinations to ensure no runtime errors
      allStatuses.forEach(fromStatus => {
        allStatuses.forEach(toStatus => {
          expect(() => {
            OrderTrackingService.validateStatusTransition(fromStatus, toStatus)
          }).not.toThrow()
        })
      })
    })

    it('should maintain business logic consistency', () => {
      // Orders should not skip major steps
      expect(OrderTrackingService.validateStatusTransition('pending', 'shipped')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('paid', 'delivered')).toBe(false)
      
      // Orders should be able to go backwards in certain cases (for corrections)
      expect(OrderTrackingService.validateStatusTransition('in_packing', 'paid')).toBe(true)
      expect(OrderTrackingService.validateStatusTransition('packed', 'in_packing')).toBe(true)
      
      // Terminal states should not allow transitions
      expect(OrderTrackingService.validateStatusTransition('delivered', 'shipped')).toBe(false)
      expect(OrderTrackingService.validateStatusTransition('cancelled', 'paid')).toBe(false)
    })
  })

  describe('Customer experience validation', () => {
    it('should provide consistent terminology across all statuses', () => {
      const statuses: OrderStatus[] = [
        'pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled'
      ]

      const messages = statuses.map(status => 
        OrderTrackingService.getCustomerFriendlyStatus(status)
      )

      // Check for consistent tone and terminology
      messages.forEach(message => {
        // Should use customer-friendly language (no technical jargon)
        expect(message.display).not.toMatch(/pending|in_packing|packed/)
        expect(message.description).not.toMatch(/status|state/)
        
        // Should be encouraging and informative
        expect(message.description.length).toBeGreaterThan(20)
        expect(message.nextSteps.length).toBeGreaterThan(20)
      })
    })

    it('should provide actionable next steps', () => {
      const shippedStatus = OrderTrackingService.getCustomerFriendlyStatus('shipped')
      expect(shippedStatus.nextSteps).toContain('Track')
      
      const deliveredStatus = OrderTrackingService.getCustomerFriendlyStatus('delivered')
      expect(deliveredStatus.nextSteps).toContain('feedback')
      
      const cancelledStatus = OrderTrackingService.getCustomerFriendlyStatus('cancelled')
      expect(cancelledStatus.nextSteps).toContain('support')
    })
  })
})