import { 
  calculateEstimatedDelivery, 
  isBusinessDay, 
  addBusinessDays, 
  shouldProcessNextBusinessDay,
  getBusinessDaysBetween,
  formatDeliveryTimeframe,
  getDeliveryMessage,
  DELIVERY_CONFIG
} from '../../shared/config/delivery'

describe('Delivery Estimation System', () => {
  describe('isBusinessDay', () => {
    it('should return true for weekdays (Monday-Saturday)', () => {
      // Monday, January 1, 2024
      const monday = new Date('2024-01-01')
      expect(isBusinessDay(monday)).toBe(true)
      
      // Saturday, January 6, 2024
      const saturday = new Date('2024-01-06')
      expect(isBusinessDay(saturday)).toBe(true)
    })

    it('should return false for Sundays', () => {
      // Sunday, January 7, 2024
      const sunday = new Date('2024-01-07')
      expect(isBusinessDay(sunday)).toBe(false)
    })

    it('should return false for holidays', () => {
      // Mock a holiday
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-26')
      
      const holiday = new Date('2024-01-26')
      expect(isBusinessDay(holiday)).toBe(false)
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })

    it('should handle regional holidays', () => {
      const regionalHoliday = new Date('2024-02-14')
      
      // Should be business day for default region
      expect(isBusinessDay(regionalHoliday, 'default')).toBe(true)
      
      // Mock regional holiday
      const originalRegionalHolidays = { ...DELIVERY_CONFIG.REGIONAL_HOLIDAYS }
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS.mumbai = ['2024-02-14']
      
      // Should not be business day for mumbai region
      expect(isBusinessDay(regionalHoliday, 'mumbai')).toBe(false)
      
      // Restore original regional holidays
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS = originalRegionalHolidays
    })
  })

  describe('addBusinessDays', () => {
    it('should add business days correctly', () => {
      // Start on Monday, January 1, 2024
      const startDate = new Date('2024-01-01')
      
      // Add 5 business days should give us Saturday, January 6, 2024
      const result = addBusinessDays(startDate, 5)
      expect(result.getDate()).toBe(6)
      expect(result.getMonth()).toBe(0) // January
    })

    it('should skip weekends when adding business days', () => {
      // Start on Friday, January 5, 2024
      const startDate = new Date('2024-01-05')
      
      // Add 1 business day should give us Saturday, January 6, 2024 (skipping Sunday)
      const result = addBusinessDays(startDate, 1)
      expect(result.getDate()).toBe(6)
      expect(result.getDay()).toBe(6) // Saturday
    })

    it('should skip holidays when adding business days', () => {
      // Mock a holiday
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-02')
      
      // Start on Monday, January 1, 2024
      const startDate = new Date('2024-01-01')
      
      // Add 1 business day should skip January 2 (holiday) and go to January 3
      const result = addBusinessDays(startDate, 1)
      expect(result.getDate()).toBe(3)
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })
  })

  describe('shouldProcessNextBusinessDay', () => {
    it('should return true for orders placed after cutoff time', () => {
      // 4 PM on a business day (after 3 PM cutoff)
      const lateOrder = new Date('2024-01-01T16:00:00')
      expect(shouldProcessNextBusinessDay(lateOrder)).toBe(true)
    })

    it('should return false for orders placed before cutoff time', () => {
      // 2 PM on a business day (before 3 PM cutoff)
      const earlyOrder = new Date('2024-01-01T14:00:00')
      expect(shouldProcessNextBusinessDay(earlyOrder)).toBe(false)
    })

    it('should return true for orders placed on non-business days', () => {
      // Sunday order
      const sundayOrder = new Date('2024-01-07T10:00:00')
      expect(shouldProcessNextBusinessDay(sundayOrder)).toBe(true)
    })
  })

  describe('calculateEstimatedDelivery', () => {
    it('should calculate delivery estimate with default timeframe', () => {
      // Monday, January 1, 2024 at 10 AM
      const orderDate = new Date('2024-01-01T10:00:00')
      
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.estimatedDate).toBeInstanceOf(Date)
      expect(result.minDate).toBeInstanceOf(Date)
      expect(result.maxDate).toBeInstanceOf(Date)
      expect(result.processingDelay).toBe(false) // Before cutoff time
      expect(result.estimatedDate.getTime()).toBeGreaterThan(orderDate.getTime())
    })

    it('should calculate delivery estimate with courier-specific timeframe', () => {
      // Monday, January 1, 2024 at 10 AM
      const orderDate = new Date('2024-01-01T10:00:00')
      const courierTimeframe = 3 // 3 days for express courier
      
      const result = calculateEstimatedDelivery(orderDate, courierTimeframe)
      
      expect(result.estimatedDate).toBeInstanceOf(Date)
      expect(result.minDate).toBeInstanceOf(Date)
      expect(result.maxDate).toBeInstanceOf(Date)
      
      // Should be faster than default timeframe
      const defaultResult = calculateEstimatedDelivery(orderDate)
      expect(result.estimatedDate.getTime()).toBeLessThanOrEqual(defaultResult.estimatedDate.getTime())
    })

    it('should handle processing delay for late orders', () => {
      // Monday, January 1, 2024 at 4 PM (after cutoff)
      const lateOrderDate = new Date('2024-01-01T16:00:00')
      
      const result = calculateEstimatedDelivery(lateOrderDate)
      
      expect(result.processingDelay).toBe(true)
      
      // Should be later than early order
      const earlyOrderDate = new Date('2024-01-01T10:00:00')
      const earlyResult = calculateEstimatedDelivery(earlyOrderDate)
      expect(result.estimatedDate.getTime()).toBeGreaterThan(earlyResult.estimatedDate.getTime())
    })

    it('should detect holiday impact', () => {
      // Mock holidays during delivery period
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-03', '2024-01-04')
      
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.holidayImpact).toBe(true)
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })
  })

  describe('getBusinessDaysBetween', () => {
    it('should calculate business days between two dates', () => {
      // Monday to Friday (5 business days)
      const startDate = new Date('2024-01-01') // Monday
      const endDate = new Date('2024-01-05') // Friday
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(4) // Tuesday, Wednesday, Thursday, Friday
    })

    it('should exclude weekends from business day count', () => {
      // Friday to next Monday (1 business day - Saturday and Sunday excluded)
      const startDate = new Date('2024-01-05') // Friday
      const endDate = new Date('2024-01-08') // Monday
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(2) // Saturday and Monday (Sunday is excluded)
    })

    it('should exclude holidays from business day count', () => {
      // Mock a holiday
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-03')
      
      const startDate = new Date('2024-01-01') // Monday
      const endDate = new Date('2024-01-05') // Friday
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(3) // Tuesday, Thursday, Friday (Wednesday is holiday)
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })

    it('should handle express delivery timeframe (1 business day)', () => {
      const startDate = new Date('2024-01-01') // Monday
      const endDate = new Date('2024-01-02') // Tuesday
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(1)
    })

    it('should handle same-day delivery (0 business days)', () => {
      const startDate = new Date('2024-01-01') // Monday
      const endDate = new Date('2024-01-01') // Same Monday
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(0)
    })

    it('should handle long courier timeframes', () => {
      const startDate = new Date('2024-01-01') // Monday
      const endDate = new Date('2024-01-22') // Monday 3 weeks later
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(18) // 3 weeks * 6 business days per week (Mon-Sat)
    })

    it('should handle regional holidays in business day calculation', () => {
      // Mock regional holiday
      const originalRegionalHolidays = { ...DELIVERY_CONFIG.REGIONAL_HOLIDAYS }
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS.mumbai = ['2024-01-03']
      
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-05')
      
      // Default region should not exclude regional holiday
      const defaultBusinessDays = getBusinessDaysBetween(startDate, endDate, 'default')
      expect(defaultBusinessDays).toBe(4)
      
      // Mumbai region should exclude regional holiday
      const mumbaiBusinessDays = getBusinessDaysBetween(startDate, endDate, 'mumbai')
      expect(mumbaiBusinessDays).toBe(3)
      
      // Restore original regional holidays
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS = originalRegionalHolidays
    })

    it('should handle month boundaries in business day calculation', () => {
      const startDate = new Date('2024-01-29') // Monday
      const endDate = new Date('2024-02-02') // Friday next month
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(4) // Tue, Wed, Thu, Fri
    })

    it('should handle year boundaries in business day calculation', () => {
      const startDate = new Date('2024-12-30') // Monday
      const endDate = new Date('2025-01-03') // Friday next year
      
      const businessDays = getBusinessDaysBetween(startDate, endDate)
      expect(businessDays).toBe(4) // Tue, Wed, Thu, Fri (assuming no holidays)
    })
  })

  describe('formatDeliveryTimeframe', () => {
    it('should format single date correctly', () => {
      const date = new Date('2024-01-15')
      const result = formatDeliveryTimeframe(date, date)
      expect(result).toBe('Expected on 15 Jan')
    })

    it('should format date range correctly', () => {
      const minDate = new Date('2024-01-15')
      const maxDate = new Date('2024-01-17')
      const result = formatDeliveryTimeframe(minDate, maxDate)
      expect(result).toBe('Expected between 15 Jan - 17 Jan')
    })

    it('should handle same month date range', () => {
      const minDate = new Date('2024-01-15')
      const maxDate = new Date('2024-01-20')
      const result = formatDeliveryTimeframe(minDate, maxDate)
      expect(result).toBe('Expected between 15 Jan - 20 Jan')
    })

    it('should handle cross-month date range', () => {
      const minDate = new Date('2024-01-30')
      const maxDate = new Date('2024-02-02')
      const result = formatDeliveryTimeframe(minDate, maxDate)
      expect(result).toBe('Expected between 30 Jan - 2 Feb')
    })

    it('should handle cross-year date range', () => {
      const minDate = new Date('2024-12-30')
      const maxDate = new Date('2025-01-03')
      const result = formatDeliveryTimeframe(minDate, maxDate)
      expect(result).toBe('Expected between 30 Dec - 3 Jan')
    })

    it('should handle express delivery timeframe (same day)', () => {
      const date = new Date('2024-01-15')
      const result = formatDeliveryTimeframe(date, date)
      expect(result).toBe('Expected on 15 Jan')
    })

    it('should handle wide delivery timeframe', () => {
      const minDate = new Date('2024-01-15')
      const maxDate = new Date('2024-01-25')
      const result = formatDeliveryTimeframe(minDate, maxDate)
      expect(result).toBe('Expected between 15 Jan - 25 Jan')
    })
  })

  describe('getDeliveryMessage', () => {
    it('should return generic message for non-shipped orders', () => {
      const message = getDeliveryMessage('paid')
      expect(message).toContain('Usually delivered in')
      expect(message).toContain('business days')
    })

    it('should return tracking message for shipped orders', () => {
      const message = getDeliveryMessage('shipped', 'DTDC', 'TRACK123')
      expect(message).toContain('Track your order on DTDC website')
    })

    it('should return manual delivery message', () => {
      const message = getDeliveryMessage('shipped', 'Manual', 'LOCAL123')
      expect(message).toBe('Your order is out for local delivery')
    })

    it('should return in-store pickup message', () => {
      const message = getDeliveryMessage('shipped', 'InStore', 'STORE123')
      expect(message).toBe('Your order is ready for pickup at our store')
    })

    it('should include estimated date when provided', () => {
      const estimatedDate = new Date('2024-01-15')
      const message = getDeliveryMessage('paid', undefined, undefined, estimatedDate)
      expect(message).toContain('Expected delivery by')
      expect(message).toContain('15 Jan')
    })

    it('should include processing delay notice', () => {
      const estimatedDate = new Date('2024-01-15')
      const message = getDeliveryMessage('paid', undefined, undefined, estimatedDate, true)
      expect(message).toContain('Order will be processed on next business day')
    })

    it('should include holiday impact notice', () => {
      const estimatedDate = new Date('2024-01-15')
      const message = getDeliveryMessage('paid', undefined, undefined, estimatedDate, false, true)
      expect(message).toContain('Delivery may be delayed due to holidays')
    })

    it('should include both processing delay and holiday impact', () => {
      const estimatedDate = new Date('2024-01-15')
      const message = getDeliveryMessage('paid', undefined, undefined, estimatedDate, true, true)
      expect(message).toContain('Order will be processed on next business day')
      expect(message).toContain('Delivery may be delayed due to holidays')
    })

    it('should handle different courier names in tracking messages', () => {
      const dtdcMessage = getDeliveryMessage('shipped', 'DTDC', 'TRACK123')
      const bluedartMessage = getDeliveryMessage('shipped', 'Blue Dart', 'BD456')
      const delhiveryMessage = getDeliveryMessage('shipped', 'Delhivery', 'DEL789')
      
      expect(dtdcMessage).toContain('DTDC')
      expect(bluedartMessage).toContain('Blue Dart')
      expect(delhiveryMessage).toContain('Delhivery')
    })

    it('should handle weekend delivery dates in messages', () => {
      // Saturday delivery date
      const saturdayDate = new Date('2024-01-06') // Saturday
      const message = getDeliveryMessage('paid', undefined, undefined, saturdayDate)
      expect(message).toContain('Expected delivery by')
      expect(message).toContain('6 Jan')
    })

    it('should handle month boundary in delivery messages', () => {
      // Date in next month
      const nextMonthDate = new Date('2024-02-01')
      const message = getDeliveryMessage('paid', undefined, undefined, nextMonthDate)
      expect(message).toContain('Expected delivery by')
      expect(message).toContain('1 Feb')
    })

    it('should handle year boundary in delivery messages', () => {
      // Date in next year
      const nextYearDate = new Date('2025-01-01')
      const message = getDeliveryMessage('paid', undefined, undefined, nextYearDate)
      expect(message).toContain('Expected delivery by')
      expect(message).toContain('1 Jan')
    })
  })

  describe('Holiday Edge Cases', () => {
    it('should handle holidays falling on weekends', () => {
      // Mock a holiday that falls on Sunday (non-business day anyway)
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-07') // Sunday
      
      const orderDate = new Date('2024-01-05T10:00:00') // Friday
      const result = calculateEstimatedDelivery(orderDate)
      
      // Holiday on Sunday shouldn't significantly impact delivery since Sunday is already non-business
      expect(result.estimatedDate).toBeInstanceOf(Date)
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })

    it('should handle multiple consecutive holidays spanning weeks', () => {
      // Mock holidays from Thursday to next Tuesday (spanning weekend)
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-04', '2024-01-05', '2024-01-08', '2024-01-09') // Thu, Fri, Mon, Tue
      
      const orderDate = new Date('2024-01-03T10:00:00') // Wednesday
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.holidayImpact).toBe(true)
      expect(result.estimatedDate.getTime()).toBeGreaterThan(new Date('2024-01-09').getTime())
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })

    it('should handle regional holidays correctly', () => {
      // Mock regional holiday
      const originalRegionalHolidays = { ...DELIVERY_CONFIG.REGIONAL_HOLIDAYS }
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS.mumbai = ['2024-01-03']
      
      const orderDate = new Date('2024-01-01T10:00:00')
      
      // Default region should not be affected
      const defaultResult = calculateEstimatedDelivery(orderDate, undefined, 'default')
      expect(defaultResult.holidayImpact).toBe(false)
      
      // Mumbai region should be affected
      const mumbaiResult = calculateEstimatedDelivery(orderDate, undefined, 'mumbai')
      expect(mumbaiResult.holidayImpact).toBe(true)
      expect(mumbaiResult.estimatedDate.getTime()).toBeGreaterThan(defaultResult.estimatedDate.getTime())
      
      // Restore original regional holidays
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS = originalRegionalHolidays
    })

    it('should handle holiday at the end of delivery period', () => {
      // Mock a holiday that would fall exactly on estimated delivery date
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-10') // Estimated delivery date for 5-7 day range
      
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.holidayImpact).toBe(true)
      // Delivery should be pushed beyond the holiday
      expect(result.estimatedDate.getDate()).toBeGreaterThan(10)
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })

    it('should handle holiday during preparation period', () => {
      // Mock a holiday during the preparation phase
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-02') // Day after order
      
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.holidayImpact).toBe(true)
      // Should extend preparation time
      expect(result.estimatedDate.getTime()).toBeGreaterThan(new Date('2024-01-08').getTime())
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })
  })

  describe('Weekend Edge Cases', () => {
    it('should handle orders placed on Friday evening', () => {
      // Friday 4 PM (after cutoff)
      const fridayEvening = new Date('2024-01-05T16:00:00')
      const result = calculateEstimatedDelivery(fridayEvening)
      
      expect(result.processingDelay).toBe(true)
      // Should start processing on Saturday (next business day)
      expect(result.estimatedDate.getDay()).not.toBe(0) // Not Sunday
    })

    it('should handle orders placed on Saturday', () => {
      // Saturday morning
      const saturdayMorning = new Date('2024-01-06T10:00:00')
      const result = calculateEstimatedDelivery(saturdayMorning)
      
      // Saturday is a business day in our config, so no processing delay
      expect(result.processingDelay).toBe(false)
      expect(result.estimatedDate).toBeInstanceOf(Date)
    })

    it('should handle orders placed on Sunday', () => {
      // Sunday morning
      const sundayMorning = new Date('2024-01-07T10:00:00')
      const result = calculateEstimatedDelivery(sundayMorning)
      
      expect(result.processingDelay).toBe(true)
      // Should start processing on Monday
      expect(result.estimatedDate.getTime()).toBeGreaterThan(new Date('2024-01-08').getTime())
    })

    it('should skip Sundays when calculating delivery dates', () => {
      // Order that would normally deliver on Sunday
      const orderDate = new Date('2024-01-03T10:00:00') // Wednesday
      const result = calculateEstimatedDelivery(orderDate, 4) // 4 days would be Sunday
      
      // Should skip Sunday and deliver on Monday or later
      expect(result.estimatedDate.getDay()).not.toBe(0) // Not Sunday
    })

    it('should handle delivery spanning multiple weekends', () => {
      // Long delivery timeframe that spans multiple weekends
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 14) // 14 business days
      
      expect(result.estimatedDate).toBeInstanceOf(Date)
      expect(result.estimatedDate.getTime()).toBeGreaterThan(orderDate.getTime())
      // Should be at least 2 weeks later accounting for weekends
      const twoWeeksLater = new Date(orderDate)
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
      expect(result.estimatedDate.getTime()).toBeGreaterThan(twoWeeksLater.getTime())
    })
  })

  describe('Courier-Specific Delivery Timeframes', () => {
    it('should handle express courier (1 day delivery)', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 1)
      
      expect(result.estimatedDate).toBeInstanceOf(Date)
      expect(result.minDate).toBeInstanceOf(Date)
      expect(result.maxDate).toBeInstanceOf(Date)
      
      // Should be faster than default
      const defaultResult = calculateEstimatedDelivery(orderDate)
      expect(result.estimatedDate.getTime()).toBeLessThan(defaultResult.estimatedDate.getTime())
      
      // Min date should be same day or next business day
      const businessDaysBetween = getBusinessDaysBetween(orderDate, result.minDate)
      expect(businessDaysBetween).toBeLessThanOrEqual(2) // Preparation + 1 day
    })

    it('should handle standard courier (3 days delivery)', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 3)
      
      const businessDaysBetween = getBusinessDaysBetween(orderDate, result.estimatedDate)
      expect(businessDaysBetween).toBeGreaterThanOrEqual(3) // At least 3 business days + preparation
    })

    it('should handle slow courier (10 days delivery)', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 10)
      
      const businessDaysBetween = getBusinessDaysBetween(orderDate, result.estimatedDate)
      expect(businessDaysBetween).toBeGreaterThanOrEqual(10) // At least 10 business days + preparation
      
      // Should be slower than default
      const defaultResult = calculateEstimatedDelivery(orderDate)
      expect(result.estimatedDate.getTime()).toBeGreaterThan(defaultResult.estimatedDate.getTime())
    })

    it('should handle same-day courier (0 days)', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 0)
      
      // Should still account for preparation time
      expect(result.estimatedDate.getTime()).toBeGreaterThan(orderDate.getTime())
      
      // 0 days falls back to default timeframe since courierTimeframeDays > 0 is false
      const defaultResult = calculateEstimatedDelivery(orderDate)
      expect(result.estimatedDate.getTime()).toBe(defaultResult.estimatedDate.getTime())
    })

    it('should compare different courier timeframes correctly', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      
      const express = calculateEstimatedDelivery(orderDate, 1)
      const standard = calculateEstimatedDelivery(orderDate, 3)
      const slow = calculateEstimatedDelivery(orderDate, 7)
      
      // Express should be fastest
      expect(express.estimatedDate.getTime()).toBeLessThan(standard.estimatedDate.getTime())
      expect(standard.estimatedDate.getTime()).toBeLessThan(slow.estimatedDate.getTime())
      
      // Min/max ranges should also follow this pattern
      expect(express.maxDate.getTime()).toBeLessThanOrEqual(standard.minDate.getTime())
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle express delivery with holidays', () => {
      // Mock holiday during express delivery period
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-02')
      
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 1) // Express delivery
      
      expect(result.holidayImpact).toBe(true)
      // Even express delivery should be delayed by holiday
      expect(result.estimatedDate.getTime()).toBeGreaterThan(new Date('2024-01-02').getTime())
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })

    it('should handle weekend order with courier timeframe', () => {
      // Sunday order with 2-day courier
      const sundayOrder = new Date('2024-01-07T10:00:00')
      const result = calculateEstimatedDelivery(sundayOrder, 2)
      
      expect(result.processingDelay).toBe(true)
      // Should start processing on Monday and deliver by Wednesday
      expect(result.estimatedDate.getTime()).toBeGreaterThan(new Date('2024-01-09').getTime())
    })

    it('should handle late Friday order with express delivery', () => {
      // Friday 4 PM with express delivery
      const lateFridayOrder = new Date('2024-01-05T16:00:00')
      const result = calculateEstimatedDelivery(lateFridayOrder, 1)
      
      expect(result.processingDelay).toBe(true)
      // Should start processing on Saturday and deliver by Monday (skipping Sunday)
      expect(result.estimatedDate.getDay()).not.toBe(0) // Not Sunday
      expect(result.estimatedDate.getTime()).toBeGreaterThan(new Date('2024-01-06').getTime())
    })

    it('should handle regional holiday with courier-specific timeframe', () => {
      // Mock regional holiday
      const originalRegionalHolidays = { ...DELIVERY_CONFIG.REGIONAL_HOLIDAYS }
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS.mumbai = ['2024-01-03']
      
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 2, 'mumbai') // 2-day courier in Mumbai
      
      expect(result.holidayImpact).toBe(true)
      // Should account for both courier timeframe and regional holiday
      expect(result.estimatedDate.getTime()).toBeGreaterThan(new Date('2024-01-03').getTime())
      
      // Restore original regional holidays
      DELIVERY_CONFIG.REGIONAL_HOLIDAYS = originalRegionalHolidays
    })

    it('should handle month boundary with holidays', () => {
      // Order at end of month with holiday in next month
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-02-01') // First day of next month
      
      const orderDate = new Date('2024-01-29T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 3)
      
      expect(result.holidayImpact).toBe(true)
      expect(result.estimatedDate.getMonth()).toBe(1) // February
      expect(result.estimatedDate.getDate()).toBeGreaterThan(1) // After the holiday
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })
  })

  describe('Edge Cases', () => {
    it('should handle year boundary correctly', () => {
      // Order on December 30, 2023
      const orderDate = new Date('2023-12-30T10:00:00')
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.estimatedDate.getFullYear()).toBe(2024)
    })

    it('should handle leap year correctly', () => {
      // Order on February 28, 2024 (leap year)
      const orderDate = new Date('2024-02-28T10:00:00')
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.estimatedDate).toBeInstanceOf(Date)
      expect(result.estimatedDate.getTime()).toBeGreaterThan(orderDate.getTime())
    })

    it('should handle multiple consecutive holidays', () => {
      // Mock multiple consecutive holidays
      const originalHolidays = [...DELIVERY_CONFIG.HOLIDAYS]
      DELIVERY_CONFIG.HOLIDAYS.push('2024-01-02', '2024-01-03', '2024-01-04')
      
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate)
      
      expect(result.holidayImpact).toBe(true)
      expect(result.estimatedDate).toBeInstanceOf(Date)
      
      // Restore original holidays
      DELIVERY_CONFIG.HOLIDAYS.length = 0
      DELIVERY_CONFIG.HOLIDAYS.push(...originalHolidays)
    })

    it('should handle zero courier timeframe days', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 0)
      
      // Should use minimum 1 day
      expect(result.estimatedDate.getTime()).toBeGreaterThan(orderDate.getTime())
    })

    it('should handle negative courier timeframe days', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, -1)
      
      // Should fallback to default timeframe (use max days)
      const defaultResult = calculateEstimatedDelivery(orderDate)
      expect(result.estimatedDate.getTime()).toBeGreaterThanOrEqual(defaultResult.estimatedDate.getTime())
    })

    it('should handle very large courier timeframe', () => {
      const orderDate = new Date('2024-01-01T10:00:00')
      const result = calculateEstimatedDelivery(orderDate, 30) // 30 days
      
      expect(result.estimatedDate).toBeInstanceOf(Date)
      const businessDaysBetween = getBusinessDaysBetween(orderDate, result.estimatedDate)
      expect(businessDaysBetween).toBeGreaterThanOrEqual(30)
    })

    it('should handle orders placed exactly at cutoff time', () => {
      // Order placed exactly at 3 PM cutoff
      const cutoffOrder = new Date('2024-01-01T15:00:00')
      const result = calculateEstimatedDelivery(cutoffOrder)
      
      expect(result.processingDelay).toBe(true) // At cutoff should be considered late
    })

    it('should handle orders placed one minute before cutoff', () => {
      // Order placed at 2:59 PM (before cutoff)
      const beforeCutoffOrder = new Date('2024-01-01T14:59:00')
      const result = calculateEstimatedDelivery(beforeCutoffOrder)
      
      expect(result.processingDelay).toBe(false)
    })
  })
})