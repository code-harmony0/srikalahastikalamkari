import React from "react";
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Printer,
  CreditCard,
  User,
  Calendar,
  PackageCheck,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/app/dashboard/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";

interface OrderItem {
  id: string;
  name: string;
  price_at_purchase: number;
  quantity: number;
  image?: string;
  category?: string;
  products?: {
    id: string;
    name: string;
    images: string[];
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  customer_address?: string;
  total_amount: number;
  status: "pending" | "paid" | "in_packing" | "packed" | "shipped" | "cancelled";
  order_items: OrderItem[];
  razorpay_payment_id?: string;
  shipping_company?: string;
  tracking_id?: string;
  packed_at?: string;
  shipped_at?: string;

  shipping_address?: any;
}

interface OrderDetailsAdminProps {
  order: Order;
  onClose: () => void;
  onPack: () => void;
  onShip: () => void;

}

const OrderDetailsAdmin: React.FC<OrderDetailsAdminProps> = ({ 
  order, 
  onClose, 
  onPack, 
  onShip
}) => {
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          label: "Order Placed",
          color: "bg-slate-100 text-slate-700 border-slate-300",
          icon: Clock
        }
      case "in_packing":
        return {
          label: "Processing",
          color: "bg-slate-100 text-slate-700 border-slate-300",
          icon: Package
        }
      case "packed":
        return {
          label: "Ready to Ship",
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: PackageCheck
        }
      case "shipped":
        return {
          label: "Shipped",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: Truck
        }

      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
          icon: X
        }
      default:
        return {
          label: "Pending",
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: Clock
        }
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  // Get customer info from shipping_address or fallback fields
  const customerName = order.shipping_address?.firstName 
    ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
    : order.customer_name || 'Guest Customer';
  const customerPhone = order.shipping_address?.phone || order.customer_phone || '';
  const customerEmail = order.customer_email || '';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="text-gray-600 hover:text-slate-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {customerName}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>Order #{order.id.slice(-8)}</span>
                  <span>•</span>
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={`${statusConfig.color} border font-medium px-3 py-1.5 rounded-full`}>
                <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                {statusConfig.label}
              </Badge>
              
              {/* Action Buttons Based on Status */}
              {(order.status === "paid" || order.status === "in_packing") && (
                <Button 
                  onClick={onPack}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {order.status === "in_packing" ? "Resume Packing" : "Start Packing"}
                </Button>
              )}
              
              {order.status === "packed" && (
                <Button 
                  onClick={onShip}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Ship Order
                </Button>
              )}

              {order.status === "shipped" && (
                <Button 
                  onClick={onShip}
                  variant="outline"
                  className="border-slate-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 font-medium"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Edit Tracking
                </Button>
              )}

              {(order.status === "cancelled") && (
                <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1.5 rounded-full font-medium">
                  {order.status === "cancelled" ? "✗ Cancelled" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-700" />
                  Order Items
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {order.order_items?.length || 0} items
                  </span>
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {(order.order_items || []).map((item, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 bg-gray-100 rounded-xl border border-gray-200 flex-shrink-0 overflow-hidden">
                        {item.products?.images?.[0] ? (
                          <OptimizedImage
                            src={getImageTier(item.products.images, "thumb", 0)}
                            alt={item.products.name || "Product"}
                            fill
                            className="object-cover"
                            imageType="cartItem"
                            sizes="96px"
                            placeholder="empty"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                          {item.products?.name || item.name || 'Product'}
                        </h3>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-base text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-base font-medium text-gray-700">
                            ₹{item.price_at_purchase.toLocaleString('en-IN')} each
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">
                          ₹{(item.price_at_purchase * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-bold text-slate-900">
                    ₹{order.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-700" />
                Order Timeline
              </h2>
              
              <div className="space-y-4">
                {[
                  { 
                    status: 'paid', 
                    label: 'Order Placed', 
                    date: order.created_at, 
                    icon: Clock,
                    description: 'Order received and payment confirmed'
                  },
                  { 
                    status: 'in_packing', 
                    label: 'Packing Started', 
                    date: order.status === 'in_packing' || order.status === 'packed' || order.status === 'shipped' ? order.created_at : null, 
                    icon: Package,
                    description: 'Order is being prepared and packed'
                  },
                  { 
                    status: 'packed', 
                    label: 'Ready to Ship', 
                    date: order.packed_at, 
                    icon: PackageCheck,
                    description: 'Order packed and ready for shipment'
                  },
                  { 
                    status: 'shipped', 
                    label: 'Shipped', 
                    date: order.shipped_at, 
                    icon: Truck,
                    description: order.shipping_company ? `Shipped via ${order.shipping_company}` : 'Order is on the way'
                  },

                ].map((step, index) => {
                  const statusOrder = ['paid', 'in_packing', 'packed', 'shipped'];
                  const currentStatusIndex = statusOrder.indexOf(order.status);
                  const stepIndex = statusOrder.indexOf(step.status);
                  
                  const isCompleted = stepIndex <= currentStatusIndex;
                  const isCurrent = stepIndex === currentStatusIndex;
                  const StepIcon = step.icon;
                  
                  return (
                    <div key={step.status} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted 
                          ? 'bg-green-600 text-white' 
                          : isCurrent 
                            ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        <StepIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-base ${
                            isCompleted || isCurrent ? 'text-slate-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                          {step.date && isCompleted && (
                            <p className="text-sm text-gray-600">
                              {formatDateTime(step.date)}
                            </p>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                        {step.status === 'shipped' && order.tracking_id && isCompleted && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200 font-mono">
                              {order.tracking_id}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Customer Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-700" />
                Customer
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-slate-900 text-base">{customerName}</p>
                </div>
                
                {customerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-700" />
                    <span className="text-gray-600">{customerPhone}</span>
                  </div>
                )}
                
                {customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-700" />
                    <span className="text-gray-600 text-sm">{customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-700" />
                Delivery Address
              </h2>
              
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 leading-relaxed">
                  {order.shipping_address ? (
                    <>
                      <p className="font-semibold text-slate-900 mb-1">
                        {order.shipping_address.firstName} {order.shipping_address.lastName}
                      </p>
                      <p>{order.shipping_address.address}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                      <p className="font-medium text-slate-900">{order.shipping_address.pincode}</p>
                      {order.shipping_address.phone && (
                        <p className="mt-2 text-gray-700">📞 {order.shipping_address.phone}</p>
                      )}
                    </>
                  ) : (
                    <p>No shipping address provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-700" />
                Payment
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium text-slate-900">Razorpay</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    Paid
                  </Badge>
                </div>
                
                {order.razorpay_payment_id && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Payment ID</p>
                    <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-slate-900">
                      {order.razorpay_payment_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            {(order.status === "shipped") && order.shipping_company && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-700" />
                  Shipping Details
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Carrier</span>
                    <span className="font-medium text-slate-900">{order.shipping_company}</span>
                  </div>
                  
                  {order.tracking_id && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Tracking ID</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border border-gray-200 text-slate-900">
                        {order.tracking_id}
                      </span>
                    </div>
                  )}
                  
                  {order.shipped_at && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Shipped On</span>
                      <span className="text-sm text-slate-900">{formatDate(order.shipped_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsAdmin;
