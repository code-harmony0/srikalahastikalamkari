import React from 'react'
import { render, screen } from '@testing-library/react'
import { TrackingLinkButton } from '../TrackingLinkButton'

describe('TrackingLinkButton', () => {
  const defaultProps = {
    trackingUrl: 'https://www.dtdc.in/tracking/tracking_results.asp?strCnno=DTDC1234567890',
    courierName: 'DTDC',
    trackingNumber: 'DTDC1234567890'
  }

  it('should render tracking link button', () => {
    render(<TrackingLinkButton {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent('Track on DTDC')
  })

  it('should have correct href attribute', () => {
    render(<TrackingLinkButton {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', defaultProps.trackingUrl)
  })

  it('should open in new tab with proper security attributes', () => {
    render(<TrackingLinkButton {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have proper aria-label for accessibility', () => {
    render(<TrackingLinkButton {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Track package DTDC1234567890 on DTDC website')
  })

  it('should render external link icon', () => {
    const { container } = render(<TrackingLinkButton {...defaultProps} />)
    
    // Check for SVG icon (lucide-react renders as SVG)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<TrackingLinkButton {...defaultProps} className="custom-class" />)
    
    const link = container.querySelector('a')
    expect(link).toHaveClass('custom-class')
  })

  it('should render full width when specified', () => {
    const { container } = render(<TrackingLinkButton {...defaultProps} fullWidth />)
    
    const link = container.querySelector('a')
    expect(link).toHaveClass('w-full')
  })

  it('should support different button variants', () => {
    const { rerender, container } = render(<TrackingLinkButton {...defaultProps} variant="default" />)
    let link = container.querySelector('a')
    expect(link).toBeInTheDocument()

    rerender(<TrackingLinkButton {...defaultProps} variant="outline" />)
    link = container.querySelector('a')
    expect(link).toBeInTheDocument()

    rerender(<TrackingLinkButton {...defaultProps} variant="ghost" />)
    link = container.querySelector('a')
    expect(link).toBeInTheDocument()

    rerender(<TrackingLinkButton {...defaultProps} variant="link" />)
    link = container.querySelector('a')
    expect(link).toBeInTheDocument()
  })

  it('should support different button sizes', () => {
    const { rerender, container } = render(<TrackingLinkButton {...defaultProps} size="sm" />)
    let link = container.querySelector('a')
    expect(link).toBeInTheDocument()

    rerender(<TrackingLinkButton {...defaultProps} size="default" />)
    link = container.querySelector('a')
    expect(link).toBeInTheDocument()

    rerender(<TrackingLinkButton {...defaultProps} size="lg" />)
    link = container.querySelector('a')
    expect(link).toBeInTheDocument()
  })

  it('should handle different courier names correctly', () => {
    const { rerender } = render(<TrackingLinkButton {...defaultProps} courierName="Blue Dart" />)
    expect(screen.getByText('Track on Blue Dart')).toBeInTheDocument()

    rerender(<TrackingLinkButton {...defaultProps} courierName="FedEx" />)
    expect(screen.getByText('Track on FedEx')).toBeInTheDocument()

    rerender(<TrackingLinkButton {...defaultProps} courierName="DHL" />)
    expect(screen.getByText('Track on DHL')).toBeInTheDocument()
  })

  it('should handle long tracking numbers in aria-label', () => {
    const longTrackingNumber = 'VERYLONGTRACKING1234567890ABCDEFGHIJKLMNOP'
    render(<TrackingLinkButton {...defaultProps} trackingNumber={longTrackingNumber} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', `Track package ${longTrackingNumber} on DTDC website`)
  })

  it('should handle special characters in tracking URLs', () => {
    const specialUrl = 'https://example.com/track?id=ABC-123&ref=test'
    render(<TrackingLinkButton {...defaultProps} trackingUrl={specialUrl} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', specialUrl)
  })
})
