import React from 'react'
import { render, screen } from '@testing-library/react'
import { CourierInfoDisplay } from '../CourierInfoDisplay'

describe('CourierInfoDisplay', () => {
  const defaultProps = {
    courierName: 'DTDC',
    courierCode: 'dtdc',
    trackingNumber: 'DTDC1234567890',
    trackingUrl: 'https://www.dtdc.in/tracking/tracking_results.asp?strCnno=DTDC1234567890',
    deliveryTimeframeDays: 3,
    estimatedDeliveryDate: new Date('2024-01-15')
  }

  describe('Full Display Mode', () => {
    it('should render courier name and service label', () => {
      render(<CourierInfoDisplay {...defaultProps} />)
      
      expect(screen.getByText('DTDC')).toBeInTheDocument()
      expect(screen.getByText('Courier Service')).toBeInTheDocument()
    })

    it('should display tracking number', () => {
      render(<CourierInfoDisplay {...defaultProps} />)
      
      expect(screen.getByText('Tracking Number')).toBeInTheDocument()
      expect(screen.getByText('DTDC1234567890')).toBeInTheDocument()
    })

    it('should render tracking link with external link indicator', () => {
      render(<CourierInfoDisplay {...defaultProps} />)
      
      const trackingLink = screen.getByRole('link', { name: /Track on DTDC Website/i })
      expect(trackingLink).toBeInTheDocument()
      expect(trackingLink).toHaveAttribute('href', defaultProps.trackingUrl)
      expect(trackingLink).toHaveAttribute('target', '_blank')
      expect(trackingLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should display delivery timeframe', () => {
      render(<CourierInfoDisplay {...defaultProps} />)
      
      expect(screen.getByText('Delivery Timeframe')).toBeInTheDocument()
      expect(screen.getByText('3 days')).toBeInTheDocument()
    })

    it('should display estimated delivery date', () => {
      render(<CourierInfoDisplay {...defaultProps} />)
      
      expect(screen.getByText('Estimated Delivery')).toBeInTheDocument()
      expect(screen.getByText(/15 Jan/)).toBeInTheDocument()
    })

    it('should display correct status badge for shipped orders', () => {
      render(<CourierInfoDisplay {...defaultProps} status="shipped" />)
      
      expect(screen.getByText('Shipped')).toBeInTheDocument()
    })

    it('should display correct status badge for delivered orders', () => {
      render(<CourierInfoDisplay {...defaultProps} status="delivered" />)
      
      expect(screen.getByText('Delivered')).toBeInTheDocument()
    })

    it('should display correct status badge for in-transit orders', () => {
      render(<CourierInfoDisplay {...defaultProps} status="in_transit" />)
      
      expect(screen.getByText('In Transit')).toBeInTheDocument()
    })
  })

  describe('Compact Display Mode', () => {
    it('should render compact layout with courier name', () => {
      render(<CourierInfoDisplay {...defaultProps} compact />)
      
      expect(screen.getByText('DTDC')).toBeInTheDocument()
    })

    it('should render compact tracking button', () => {
      render(<CourierInfoDisplay {...defaultProps} compact />)
      
      const trackingButton = screen.getByRole('link', { name: /Track Package/i })
      expect(trackingButton).toBeInTheDocument()
      expect(trackingButton).toHaveAttribute('href', defaultProps.trackingUrl)
    })

    it('should display delivery timeframe in compact mode', () => {
      render(<CourierInfoDisplay {...defaultProps} compact />)
      
      expect(screen.getByText('3 days')).toBeInTheDocument()
    })

    it('should not display full card layout in compact mode', () => {
      render(<CourierInfoDisplay {...defaultProps} compact />)
      
      expect(screen.queryByText('Courier Service')).not.toBeInTheDocument()
      expect(screen.queryByText('Tracking Number')).not.toBeInTheDocument()
    })
  })

  describe('Manual Delivery', () => {
    const manualProps = {
      courierName: 'Manual Delivery',
      courierCode: 'manual',
      trackingNumber: 'LOCAL123',
      deliveryTimeframeDays: null
    }

    it('should not display tracking link for manual delivery', () => {
      render(<CourierInfoDisplay {...manualProps} />)
      
      expect(screen.queryByRole('link', { name: /Track on/i })).not.toBeInTheDocument()
    })

    it('should display manual delivery message', () => {
      render(<CourierInfoDisplay {...manualProps} />)
      
      expect(screen.getByText(/Your order is out for local delivery/i)).toBeInTheDocument()
    })

    it('should display manual delivery message when no tracking number', () => {
      const propsWithoutTracking = { ...manualProps, trackingNumber: undefined }
      render(<CourierInfoDisplay {...propsWithoutTracking} />)
      
      expect(screen.getByText(/will be delivered by our local delivery team/i)).toBeInTheDocument()
    })
  })

  describe('In-Store Pickup', () => {
    const instoreProps = {
      courierName: 'In-Store Pickup',
      courierCode: 'instore',
      trackingNumber: 'STORE456',
      deliveryTimeframeDays: null
    }

    it('should not display tracking link for in-store pickup', () => {
      render(<CourierInfoDisplay {...instoreProps} />)
      
      expect(screen.queryByRole('link', { name: /Track on/i })).not.toBeInTheDocument()
    })

    it('should display in-store pickup message', () => {
      render(<CourierInfoDisplay {...instoreProps} />)
      
      expect(screen.getByText(/ready for pickup at our store/i)).toBeInTheDocument()
    })

    it('should display in-store preparation message when no tracking number', () => {
      const propsWithoutTracking = { ...instoreProps, trackingNumber: undefined }
      render(<CourierInfoDisplay {...propsWithoutTracking} />)
      
      expect(screen.getByText(/being prepared for in-store pickup/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing tracking URL gracefully', () => {
      const propsWithoutUrl = { ...defaultProps, trackingUrl: null }
      render(<CourierInfoDisplay {...propsWithoutUrl} />)
      
      expect(screen.getByText('DTDC')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /Track on/i })).not.toBeInTheDocument()
    })

    it('should handle missing tracking number gracefully', () => {
      const propsWithoutNumber = { ...defaultProps, trackingNumber: undefined }
      render(<CourierInfoDisplay {...propsWithoutNumber} />)
      
      expect(screen.getByText('DTDC')).toBeInTheDocument()
      expect(screen.queryByText('Tracking Number')).not.toBeInTheDocument()
    })

    it('should handle missing delivery timeframe gracefully', () => {
      const propsWithoutTimeframe = { ...defaultProps, deliveryTimeframeDays: null }
      render(<CourierInfoDisplay {...propsWithoutTimeframe} />)
      
      expect(screen.getByText('DTDC')).toBeInTheDocument()
      expect(screen.queryByText('Delivery Timeframe')).not.toBeInTheDocument()
    })

    it('should handle missing estimated delivery date gracefully', () => {
      const propsWithoutDate = { ...defaultProps, estimatedDeliveryDate: null }
      render(<CourierInfoDisplay {...propsWithoutDate} />)
      
      expect(screen.getByText('DTDC')).toBeInTheDocument()
      expect(screen.queryByText('Estimated Delivery')).not.toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<CourierInfoDisplay {...defaultProps} className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should handle singular day timeframe correctly', () => {
      const propsWithOneDay = { ...defaultProps, deliveryTimeframeDays: 1 }
      render(<CourierInfoDisplay {...propsWithOneDay} />)
      
      expect(screen.getByText('1 day')).toBeInTheDocument()
      expect(screen.queryByText('1 days')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper link attributes for external tracking links', () => {
      render(<CourierInfoDisplay {...defaultProps} />)
      
      const trackingLink = screen.getByRole('link', { name: /Track on DTDC Website/i })
      expect(trackingLink).toHaveAttribute('target', '_blank')
      expect(trackingLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render with proper semantic HTML structure', () => {
      render(<CourierInfoDisplay {...defaultProps} />)
      
      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('should format delivery date correctly', () => {
      const testDate = new Date('2024-12-25')
      render(<CourierInfoDisplay {...defaultProps} estimatedDeliveryDate={testDate} />)
      
      expect(screen.getByText(/Wed, 25 Dec, 2024/)).toBeInTheDocument()
    })

    it('should handle different date formats', () => {
      const testDate = new Date('2024-01-01')
      render(<CourierInfoDisplay {...defaultProps} estimatedDeliveryDate={testDate} />)
      
      expect(screen.getByText(/Mon, 1 Jan, 2024/)).toBeInTheDocument()
    })
  })
})
