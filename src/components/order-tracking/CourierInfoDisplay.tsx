import React from 'react'
import { ExternalLink, Package, Clock, Truck } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

/**
 * Courier Information Display Component
 * 
 * Displays courier service name, delivery timeframe, and tracking link
 * with external link indicators for customer-facing order pages
 * 
 * Requirements: 2.3
 */

interface CourierInfoDisplayProps {
  courierName: string
  courierCode: string
  trackingNumber?: string
  trackingUrl?: string | null
  deliveryTimeframeDays?: number | null
  estimatedDeliveryDate?: Date | null
  status?: 'shipped' | 'delivered' | 'in_transit'
  compact?: boolean
  className?: string
}

export const CourierInfoDisplay: React.FC<CourierInfoDisplayProps> = ({
  courierName,
  courierCode,
  trackingNumber,
  trackingUrl,
  deliveryTimeframeDays,
  estimatedDeliveryDate,
  status = 'shipped',
  compact = false,
  className = ''
}) => {
  const isManualOrInstore = courierCode.toLowerCase() === 'manual' || courierCode.toLowerCase() === 'instore'
  const hasTracking = trackingUrl && trackingNumber && !isManualOrInstore

  const formatDeliveryDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = () => {
    const statusConfig = {
      shipped: { label: 'Shipped', variant: 'default' as const, icon: Truck },
      in_transit: { label: 'In Transit', variant: 'default' as const, icon: Truck },
      delivered: { label: 'Delivered', variant: 'default' as const, icon: Package }
    }

    const config = statusConfig[status] || statusConfig.shipped
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{courierName}</span>
        </div>
        
        {hasTracking && trackingUrl && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-7 text-xs"
          >
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              Track Package
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}

        {deliveryTimeframeDays && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{deliveryTimeframeDays} days</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with courier name and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{courierName}</h3>
                <p className="text-sm text-muted-foreground">Courier Service</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Tracking information */}
          {trackingNumber && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tracking Number</span>
                <span className="font-mono text-sm font-medium">{trackingNumber}</span>
              </div>

              {hasTracking && trackingUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Track on {courierName} Website
                  </a>
                </Button>
              )}

              {isManualOrInstore && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  {courierCode.toLowerCase() === 'manual' ? (
                    <p className="text-muted-foreground">
                      Your order is out for local delivery. You will receive it soon.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Your order is ready for pickup at our store. Please bring your order confirmation.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delivery timeframe */}
          {(deliveryTimeframeDays || estimatedDeliveryDate) && (
            <div className="space-y-2 border-t pt-3">
              {deliveryTimeframeDays && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivery Timeframe</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {deliveryTimeframeDays} {deliveryTimeframeDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              )}

              {estimatedDeliveryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Delivery</span>
                  <span className="text-sm font-medium">
                    {formatDeliveryDate(estimatedDeliveryDate)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Additional information for manual/instore */}
          {!trackingNumber && isManualOrInstore && (
            <div className="rounded-md bg-muted p-3 text-sm">
              {courierCode.toLowerCase() === 'manual' ? (
                <p className="text-muted-foreground">
                  Your order will be delivered by our local delivery team. No tracking number available.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Your order is being prepared for in-store pickup. You'll be notified when it's ready.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourierInfoDisplay
