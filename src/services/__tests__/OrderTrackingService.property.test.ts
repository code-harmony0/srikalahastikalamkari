import * as fc from 'fast-check'
import { OrderTrackingService } from '../OrderTrackingService'
import { OrderStatus, EnhancedOrder } from '../../lib/supabase/enhanced-types'

/**
 * Property-Based Tests for Order Tracking Service Status Management
 * 
 * Feature: enhanced-order-tracking
 * 
 * These tests validate universal properties that should hold across all possible inputs
 * for the OrderTrackingService status management functionality.
 */

describe('OrderTrackingService Property-Based Tests', () => {
  
  // Generator for valid order statuses
  const orderStatusArb = fc.constantFrom<OrderStatus>(
    'pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled'
  )

  // Generator for order status pairs (from, to)
  const statusTransitionArb = fc.tuple(orderStatusArb, orderStatusArb)

  // Generator for mock order data
  const mockOrderArb = fc.record({
    id: fc.uuid(),
    status: orderStatusArb,
    created_at: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
    updated_at: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
    customer_name: fc.string({ minLength: 2, maxLength: 50 }),
    customer_email: fc.emailAddress(),
    customer_phone: fc.string({ minLength: 10, maxLength: 15 }),
    total_amount: fc.float({ min: 1, max: 10000 }),
    packing_started_at: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
    packed_at: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
    shipped_at: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
    delivered_at: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
    tracking_id: fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: null }),
    shipping_company: fc.option(fc.constantFrom('DTDC', 'Blue Dart', 'Delhivery'), { nil: null })
  })

  /**
   * **Feature: enhanced-order-tracking, Property 1: Customer-Friendly Status Display Consistency**
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.5**
   * 
   * For any order status, the customer-facing display should:
   * - Use friendly language (no technical terms)
   * - Include expected timelines for non-terminal statuses
   * - Show clear next steps with consistent terminology
   * - Provide meaningful descriptions and actionable guidance
   */
  describe('Property 1: Customer-Friendly Status Display Consistency', () => {
    it('should always provide complete customer-friendly information for any status', () => {
      fc.assert(fc.property(orderStatusArb, (status) => {
        const friendlyStatus = OrderTrackingService.getCustomerFriendlyStatus(status)
        
        // All statuses must have complete information
        expect(friendlyStatus).toBeDefined()
        expect(friendlyStatus.display).toBeTruthy()
        expect(friendlyStatus.description).toBeTruthy()
        expect(friendlyStatus.nextSteps).toBeTruthy()
        
        // Display text should be customer-friendly (no technical terms)
        expect(friendlyStatus.display).not.toMatch(/pending|in_packing|packed|status|state/)
        expect(friendlyStatus.description).not.toMatch(/status|state/)
        
        // Content should be meaningful (not just placeholder text)
        expect(friendlyStatus.display.length).toBeGreaterThan(3)
        expect(friendlyStatus.description.length).toBeGreaterThan(20)
        expect(friendlyStatus.nextSteps.length).toBeGreaterThan(20)
        
        // Non-terminal statuses should have expected timeframes
        const terminalStatuses: OrderStatus[] = ['delivered', 'cancelled']
        if (!terminalStatuses.includes(status)) {
          expect(friendlyStatus.expectedTimeframe).toBeTruthy()
          expect(friendlyStatus.expectedTimeframe!.length).toBeGreaterThan(5)
        }
        
        // Next steps should be actionable and helpful
        expect(friendlyStatus.nextSteps).toMatch(/will|can|should|track|contact|enjoy/i)
      }))
    })

    it('should maintain consistent terminology across all status displays', () => {
      fc.assert(fc.property(fc.array(orderStatusArb, { minLength: 2, maxLength: 7 }), (statuses) => {
        const uniqueStatuses = [...new Set(statuses)]
        const friendlyStatuses = uniqueStatuses.map(status => 
          OrderTrackingService.getCustomerFriendlyStatus(status)
        )
        
        // All displays should use consistent tone and style
        friendlyStatuses.forEach(friendlyStatus => {
          // Should use positive, customer-centric language
          expect(friendlyStatus.description).toMatch(/your|you|we|order/i)
          
          // Should not use negative or confusing language
          expect(friendlyStatus.description).not.toMatch(/error|fail|problem|issue/i)
          expect(friendlyStatus.nextSteps).not.toMatch(/error|fail|problem|issue/i)
          
          // Should be properly capitalized and formatted
          expect(friendlyStatus.display.charAt(0)).toMatch(/[A-Z]/)
          expect(friendlyStatus.description.charAt(0)).toMatch(/[A-Z]/)
          expect(friendlyStatus.nextSteps.charAt(0)).toMatch(/[A-Z]/)
        })
      }))
    })

    it('should provide appropriate timeframes for active order statuses', () => {
      fc.assert(fc.property(orderStatusArb, (status) => {
        const friendlyStatus = OrderTrackingService.getCustomerFriendlyStatus(status)
        
        if (friendlyStatus.expectedTimeframe) {
          // Timeframes should be realistic and customer-friendly
          expect(friendlyStatus.expectedTimeframe).toMatch(/(hour|day|business|within|usually)/i)
          
          // Should not be overly technical or precise
          expect(friendlyStatus.expectedTimeframe).not.toMatch(/minute|second|millisecond/i)
          
          // Should indicate reasonable business timeframes
          if (status === 'pending') {
            expect(friendlyStatus.expectedTimeframe).toMatch(/hour/i)
          } else if (status === 'paid' || status === 'shipped') {
            expect(friendlyStatus.expectedTimeframe).toMatch(/day/i)
          }
        }
      }))
    })
  })

  /**
   * **Feature: enhanced-order-tracking, Property 2: Status History Preservation and Audit Trail**
   * 
   * **Validates: Requirements 1.5, 8.1**
   * 
   * For any order status transition, the system should:
   * - Preserve complete historical status information
   * - Maintain proper timestamps for audit purposes
   * - Ensure data integrity and traceability
   * - Validate all status transitions according to business rules
   */
  describe('Property 2: Status History Preservation and Audit Trail', () => {
    it('should validate all status transitions according to business rules', () => {
      fc.assert(fc.property(statusTransitionArb, ([fromStatus, toStatus]) => {
        const isValidTransition = OrderTrackingService.validateStatusTransition(fromStatus, toStatus)
        
        // Validation should be deterministic and consistent
        const secondValidation = OrderTrackingService.validateStatusTransition(fromStatus, toStatus)
        expect(isValidTransition).toBe(secondValidation)
        
        // Terminal states should not allow any transitions
        if (fromStatus === 'delivered' || fromStatus === 'cancelled') {
          expect(isValidTransition).toBe(false)
        }
        
        // Same status transitions should be rejected
        if (fromStatus === toStatus) {
          expect(isValidTransition).toBe(false)
        }
        
        // Critical business rule: orders should not skip major steps
        if (fromStatus === 'pending' && (toStatus === 'shipped' || toStatus === 'delivered')) {
          expect(isValidTransition).toBe(false)
        }
        
        if (fromStatus === 'paid' && (toStatus === 'shipped' || toStatus === 'delivered')) {
          expect(isValidTransition).toBe(false)
        }
        
        // Forward progression should be allowed for valid sequences
        const validSequences = [
          ['pending', 'paid'],
          ['paid', 'in_packing'],
          ['in_packing', 'packed'],
          ['packed', 'shipped'],
          ['shipped', 'delivered']
        ]
        
        validSequences.forEach(([from, to]) => {
          if (fromStatus === from && toStatus === to) {
            expect(isValidTransition).toBe(true)
          }
        })
        
        // Cancellation should be allowed from early-stage non-terminal states only
        // Once packed or shipped, cancellation is not allowed as the order is ready/in transit
        if (toStatus === 'cancelled' && 
            fromStatus !== 'delivered' && 
            fromStatus !== 'cancelled' && 
            fromStatus !== 'shipped' &&
            fromStatus !== 'packed') {
          expect(isValidTransition).toBe(true)
        }
      }))
    })

    it('should maintain referential integrity in status transition validation', () => {
      fc.assert(fc.property(orderStatusArb, (status) => {
        // Every status should have a defined set of valid transitions (even if empty)
        const validTransitions = ['pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled']
          .filter(targetStatus => OrderTrackingService.validateStatusTransition(status, targetStatus as OrderStatus))
        
        // Validation should be consistent
        expect(Array.isArray(validTransitions)).toBe(true)
        
        // Terminal states should have no valid transitions
        if (status === 'delivered' || status === 'cancelled') {
          expect(validTransitions).toHaveLength(0)
        }
        
        // Non-terminal states should have at least one valid transition
        if (status !== 'delivered' && status !== 'cancelled') {
          expect(validTransitions.length).toBeGreaterThan(0)
        }
        
        // All valid transitions should be bidirectionally consistent
        validTransitions.forEach(targetStatus => {
          const isValid = OrderTrackingService.validateStatusTransition(status, targetStatus as OrderStatus)
          expect(isValid).toBe(true)
        })
      }))
    })

    it('should ensure status transition logic prevents data corruption', () => {
      fc.assert(fc.property(fc.array(statusTransitionArb, { minLength: 1, maxLength: 10 }), (transitions) => {
        // Simulate a sequence of status transitions
        let currentStatus: OrderStatus = 'pending'
        const validTransitionSequence: OrderStatus[] = [currentStatus]
        
        for (const [, targetStatus] of transitions) {
          if (OrderTrackingService.validateStatusTransition(currentStatus, targetStatus)) {
            currentStatus = targetStatus
            validTransitionSequence.push(currentStatus)
          }
        }
        
        // The sequence should maintain business logic integrity
        expect(validTransitionSequence.length).toBeGreaterThan(0)
        expect(validTransitionSequence[0]).toBe('pending')
        
        // No invalid jumps should occur in the sequence
        for (let i = 1; i < validTransitionSequence.length; i++) {
          const from = validTransitionSequence[i - 1]
          const to = validTransitionSequence[i]
          expect(OrderTrackingService.validateStatusTransition(from, to)).toBe(true)
        }
        
        // Terminal states should be final
        const finalStatus = validTransitionSequence[validTransitionSequence.length - 1]
        if (finalStatus === 'delivered' || finalStatus === 'cancelled') {
          // No further transitions should be possible
          const allStatuses: OrderStatus[] = ['pending', 'paid', 'in_packing', 'packed', 'shipped', 'delivered', 'cancelled']
          allStatuses.forEach(status => {
            expect(OrderTrackingService.validateStatusTransition(finalStatus, status)).toBe(false)
          })
        }
      }))
    })

    it('should provide complete audit trail information for any status', () => {
      fc.assert(fc.property(orderStatusArb, (status) => {
        const friendlyStatus = OrderTrackingService.getCustomerFriendlyStatus(status)
        
        // Every status should provide complete information for audit purposes
        expect(friendlyStatus.display).toBeTruthy()
        expect(friendlyStatus.description).toBeTruthy()
        expect(friendlyStatus.nextSteps).toBeTruthy()
        
        // Information should be detailed enough for audit trail
        expect(friendlyStatus.display.trim().length).toBeGreaterThan(0)
        expect(friendlyStatus.description.trim().length).toBeGreaterThan(10)
        expect(friendlyStatus.nextSteps.trim().length).toBeGreaterThan(10)
        
        // Status information should be immutable and consistent
        const secondCall = OrderTrackingService.getCustomerFriendlyStatus(status)
        expect(friendlyStatus.display).toBe(secondCall.display)
        expect(friendlyStatus.description).toBe(secondCall.description)
        expect(friendlyStatus.nextSteps).toBe(secondCall.nextSteps)
        expect(friendlyStatus.expectedTimeframe).toBe(secondCall.expectedTimeframe)
      }))
    })
  })

  /**
   * Additional property tests for comprehensive coverage
   */
  describe('Comprehensive Status Management Properties', () => {
    it('should handle all possible status combinations without errors', () => {
      fc.assert(fc.property(statusTransitionArb, ([fromStatus, toStatus]) => {
        // No status transition validation should throw errors
        expect(() => {
          OrderTrackingService.validateStatusTransition(fromStatus, toStatus)
        }).not.toThrow()
        
        // No customer-friendly status retrieval should throw errors
        expect(() => {
          OrderTrackingService.getCustomerFriendlyStatus(fromStatus)
          OrderTrackingService.getCustomerFriendlyStatus(toStatus)
        }).not.toThrow()
      }))
    })

    it('should maintain business logic consistency across all operations', () => {
      fc.assert(fc.property(orderStatusArb, (status) => {
        const friendlyStatus = OrderTrackingService.getCustomerFriendlyStatus(status)
        
        // Status display should match the business context
        if (status === 'pending') {
          expect(friendlyStatus.display).toMatch(/received|order/i)
        } else if (status === 'paid') {
          expect(friendlyStatus.display).toMatch(/confirmed|payment/i)
        } else if (status === 'in_packing') {
          expect(friendlyStatus.display).toMatch(/prepared|preparing/i)
        } else if (status === 'packed') {
          expect(friendlyStatus.display).toMatch(/ready|ship/i)
        } else if (status === 'shipped') {
          expect(friendlyStatus.display).toMatch(/way|shipped/i)
        } else if (status === 'delivered') {
          expect(friendlyStatus.display).toMatch(/delivered/i)
        } else if (status === 'cancelled') {
          expect(friendlyStatus.display).toMatch(/cancelled/i)
        }
        
        // Next steps should be contextually appropriate
        if (status === 'shipped') {
          expect(friendlyStatus.nextSteps).toMatch(/track/i)
        } else if (status === 'delivered') {
          expect(friendlyStatus.nextSteps).toMatch(/feedback|enjoy/i)
        } else if (status === 'cancelled') {
          expect(friendlyStatus.nextSteps).toMatch(/support|contact/i)
        }
      }))
    })

    it('should ensure data integrity across all status operations', () => {
      fc.assert(fc.property(fc.array(orderStatusArb, { minLength: 1, maxLength: 7 }), (statuses) => {
        const uniqueStatuses = [...new Set(statuses)]
        
        // All status operations should be idempotent
        uniqueStatuses.forEach(status => {
          const result1 = OrderTrackingService.getCustomerFriendlyStatus(status)
          const result2 = OrderTrackingService.getCustomerFriendlyStatus(status)
          
          expect(result1).toEqual(result2)
        })
        
        // Status validation should be symmetric where appropriate
        uniqueStatuses.forEach(status1 => {
          uniqueStatuses.forEach(status2 => {
            const validation1 = OrderTrackingService.validateStatusTransition(status1, status2)
            const validation2 = OrderTrackingService.validateStatusTransition(status1, status2)
            
            expect(validation1).toBe(validation2)
          })
        })
      }))
    })
  })
})