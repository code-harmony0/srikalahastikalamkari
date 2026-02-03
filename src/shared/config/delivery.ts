// Enhanced Delivery Configuration
// Comprehensive delivery estimation system with business day and holiday handling

export const DELIVERY_CONFIG = {
  // Standard delivery timeframes (in days) - fallback when courier-specific data unavailable
  ESTIMATED_DELIVERY_DAYS: {
    min: 5,
    max: 7
  },
  
  // Shipping company tracking URLs (legacy - now managed in database)
  TRACKING_URLS: {
    DTDC: "https://www.dtdc.in/tracking.asp?id=",
    BlueDart: "https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=",
    Delhivery: "https://www.delhivery.com/track/package/",
    IndiaPost: "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentno=",
    Manual: null, // No tracking for manual delivery
    InStore: null  // No tracking for in-store pickup
  },
  
  // Business days configuration
  BUSINESS_DAYS: {
    // Exclude weekends from delivery calculation
    EXCLUDE_WEEKENDS: true,
    // Working days (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    WORKING_DAYS: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    // Processing cutoff time (orders after this time are processed next business day)
    PROCESSING_CUTOFF_HOUR: 15 // 3 PM
  },
  
  // Holiday dates to exclude (format: YYYY-MM-DD)
  // These are automatically excluded from delivery calculations
  HOLIDAYS: [
    // National holidays (update annually)
    "2024-01-26", // Republic Day
    "2024-03-08", // Holi
    "2024-03-29", // Good Friday
    "2024-08-15", // Independence Day
    "2024-10-02", // Gandhi Jayanti
    "2024-10-31", // Diwali
    "2024-11-15", // Guru Nanak Jayanti
    "2024-12-25", // Christmas
    
    // Add business-specific holidays here
    // "2024-04-01", // Company holiday
  ],
  
  // Regional holiday patterns (can be extended for different regions)
  REGIONAL_HOLIDAYS: {
    // Default region holidays
    default: [],
    // Add region-specific holidays if needed
    // mumbai: ["2024-08-29"], // Ganesh Chaturthi
    // delhi: ["2024-10-24"], // Karva Chauth
  } as Record<string, string[]>,
  
  // Delivery messages with enhanced templating
  MESSAGES: {
    ESTIMATED: "Usually delivered in {min}-{max} business days",
    ESTIMATED_WITH_DATE: "Expected delivery by {date}",
    SHIPPED_WITH_TRACKING: "Track your order on {company} website",
    SHIPPED_MANUAL: "Your order is out for local delivery",
    SHIPPED_INSTORE: "Your order is ready for pickup at our store",
    PROCESSING_DELAY: "Order will be processed on next business day",
    HOLIDAY_DELAY: "Delivery may be delayed due to holidays"
  },
  
  // Processing time configuration
  PROCESSING_TIME: {
    // Time to prepare order before shipping (in business days)
    PREPARATION_DAYS: 1,
    // Additional buffer for peak seasons or high volume
    BUFFER_DAYS: 0,
    // Maximum processing time before escalation
    MAX_PROCESSING_DAYS: 3
  }
};

/**
 * Enhanced delivery estimation functions with comprehensive business day and holiday handling
 */

// Helper function to check if a date is a business day
export const isBusinessDay = (date: Date, region: string = 'default'): boolean => {
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];
  
  // Check if it's a working day
  if (!DELIVERY_CONFIG.BUSINESS_DAYS.WORKING_DAYS.includes(dayOfWeek)) {
    return false;
  }
  
  // Check national holidays
  if (DELIVERY_CONFIG.HOLIDAYS.includes(dateString)) {
    return false;
  }
  
  // Check regional holidays
  const regionalHolidays = DELIVERY_CONFIG.REGIONAL_HOLIDAYS[region] || [];
  if (regionalHolidays.includes(dateString)) {
    return false;
  }
  
  return true;
};

// Helper function to add business days to a date
export const addBusinessDays = (startDate: Date, businessDays: number, region: string = 'default'): Date => {
  let currentDate = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    if (isBusinessDay(currentDate, region)) {
      daysAdded++;
    }
  }
  
  return currentDate;
};

// Helper function to check if order should be processed next business day
export const shouldProcessNextBusinessDay = (orderDate: Date): boolean => {
  const orderHour = orderDate.getHours();
  const cutoffHour = DELIVERY_CONFIG.BUSINESS_DAYS.PROCESSING_CUTOFF_HOUR;
  
  // If order is placed after cutoff time or on non-business day
  return orderHour >= cutoffHour || !isBusinessDay(orderDate);
};

// Enhanced function to calculate estimated delivery date with courier-specific timeframes
export const calculateEstimatedDelivery = (
  orderDate: Date, 
  courierTimeframeDays?: number,
  region: string = 'default'
): {
  estimatedDate: Date;
  minDate: Date;
  maxDate: Date;
  processingDelay: boolean;
  holidayImpact: boolean;
} => {
  const { min, max } = DELIVERY_CONFIG.ESTIMATED_DELIVERY_DAYS;
  const { PREPARATION_DAYS, BUFFER_DAYS } = DELIVERY_CONFIG.PROCESSING_TIME;
  
  // Determine processing start date
  let processingStartDate = new Date(orderDate);
  const processingDelay = shouldProcessNextBusinessDay(orderDate);
  
  if (processingDelay) {
    // Move to next business day
    processingStartDate = addBusinessDays(processingStartDate, 1, region);
  }
  
  // Add preparation time
  const preparationCompleteDate = addBusinessDays(
    processingStartDate, 
    PREPARATION_DAYS + BUFFER_DAYS, 
    region
  );
  
  // Use courier-specific timeframe or fallback to default
  const deliveryDays = courierTimeframeDays && courierTimeframeDays > 0 ? courierTimeframeDays : max;
  const minDeliveryDays = courierTimeframeDays && courierTimeframeDays > 0 
    ? Math.max(1, courierTimeframeDays - 1) 
    : min;
  
  // Calculate delivery dates
  const estimatedDate = addBusinessDays(preparationCompleteDate, deliveryDays, region);
  const minDate = addBusinessDays(preparationCompleteDate, minDeliveryDays, region);
  const maxDate = addBusinessDays(preparationCompleteDate, deliveryDays + 1, region);
  
  // Check for holiday impact
  const holidayImpact = checkHolidayImpact(orderDate, estimatedDate, region);
  
  return {
    estimatedDate,
    minDate,
    maxDate,
    processingDelay,
    holidayImpact
  };
};

// Helper function to check if holidays impact delivery timeline
const checkHolidayImpact = (startDate: Date, endDate: Date, region: string = 'default'): boolean => {
  const currentDate = new Date(startDate);
  const holidays = [...DELIVERY_CONFIG.HOLIDAYS, ...(DELIVERY_CONFIG.REGIONAL_HOLIDAYS[region] || [])];
  
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    if (holidays.includes(dateString)) {
      return true;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return false;
};

// Enhanced function to get tracking URL with database integration
export const getTrackingUrl = (shippingCompany: string, trackingId: string): string | null => {
  // First try the legacy configuration for backward compatibility
  const baseUrl = DELIVERY_CONFIG.TRACKING_URLS[shippingCompany as keyof typeof DELIVERY_CONFIG.TRACKING_URLS];
  if (baseUrl) {
    return `${baseUrl}${trackingId}`;
  }
  
  // For database-managed couriers, this will be handled by the OrderTrackingService
  return null;
};

// Enhanced function to get delivery message with more context
export const getDeliveryMessage = (
  status: string, 
  shippingCompany?: string, 
  trackingId?: string,
  estimatedDate?: Date,
  processingDelay?: boolean,
  holidayImpact?: boolean
): string => {
  const { min, max } = DELIVERY_CONFIG.ESTIMATED_DELIVERY_DAYS;
  
  // Handle shipped status with tracking
  if (status === 'shipped' && shippingCompany && trackingId) {
    if (shippingCompany === 'Manual') {
      return DELIVERY_CONFIG.MESSAGES.SHIPPED_MANUAL;
    } else if (shippingCompany === 'InStore') {
      return DELIVERY_CONFIG.MESSAGES.SHIPPED_INSTORE;
    } else {
      return DELIVERY_CONFIG.MESSAGES.SHIPPED_WITH_TRACKING.replace('{company}', shippingCompany);
    }
  }
  
  // Handle estimated delivery with specific date
  if (estimatedDate) {
    const dateStr = estimatedDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    
    let message = DELIVERY_CONFIG.MESSAGES.ESTIMATED_WITH_DATE.replace('{date}', dateStr);
    
    // Add processing delay notice
    if (processingDelay) {
      message += ` (${DELIVERY_CONFIG.MESSAGES.PROCESSING_DELAY})`;
    }
    
    // Add holiday impact notice
    if (holidayImpact) {
      message += ` - ${DELIVERY_CONFIG.MESSAGES.HOLIDAY_DELAY}`;
    }
    
    return message;
  }
  
  // Fallback to generic message
  return DELIVERY_CONFIG.MESSAGES.ESTIMATED
    .replace('{min}', min.toString())
    .replace('{max}', max.toString());
};

// Helper function to get business days between two dates
export const getBusinessDaysBetween = (startDate: Date, endDate: Date, region: string = 'default'): number => {
  let businessDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate < endDate) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (isBusinessDay(currentDate, region)) {
      businessDays++;
    }
  }
  
  return businessDays;
};

// Helper function to format delivery timeframe for display
export const formatDeliveryTimeframe = (minDate: Date, maxDate: Date): string => {
  const minStr = minDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const maxStr = maxDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  
  if (minStr === maxStr) {
    return `Expected on ${minStr}`;
  }
  
  return `Expected between ${minStr} - ${maxStr}`;
};