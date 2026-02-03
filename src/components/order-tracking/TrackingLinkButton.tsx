import React from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/shared/ui/button'

/**
 * Tracking Link Button Component
 * 
 * Reusable button component for courier tracking links
 * with external link indicator and proper accessibility
 * 
 * Requirements: 2.3
 */

interface TrackingLinkButtonProps {
  trackingUrl: string
  courierName: string
  trackingNumber: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  fullWidth?: boolean
}

export const TrackingLinkButton: React.FC<TrackingLinkButtonProps> = ({
  trackingUrl,
  courierName,
  trackingNumber,
  variant = 'outline',
  size = 'default',
  className = '',
  fullWidth = false
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      asChild
    >
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2"
        aria-label={`Track package ${trackingNumber} on ${courierName} website`}
      >
        <ExternalLink className="h-4 w-4" />
        <span>Track on {courierName}</span>
      </a>
    </Button>
  )
}

export default TrackingLinkButton
