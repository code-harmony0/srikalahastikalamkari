"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrderById, shipOrder, updateOrderStatus } from "@/services/orders";
import OrderDetailsAdmin from "../components/OrderDetailsAdmin";
import { toast } from "sonner";
import { Loader2, Truck, CheckCircle2, RefreshCw, Bike } from "lucide-react";
import PackingMode from "../components/PackingMode";
import { Button } from "@/app/dashboard/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/dashboard/ui/dialog";
import { Label } from "@/app/dashboard/ui/label";
import { Input } from "@/app/dashboard/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/dashboard/ui/select";

const OrderDetailsPage = ({ id }: { id?: string }) => {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Packing mode state
  const [showPackingMode, setShowPackingMode] = useState(false);

  // Shipping dialog state
  const [showShippingDialog, setShowShippingDialog] = useState(false);
  const [shippingCompany, setShippingCompany] = useState("DTDC");
  const [trackingId, setTrackingId] = useState("");
  const [isShipping, setIsShipping] = useState(false);

  if (!id) {
    console.error("No ID found in params");
    return <div>Error: No Order ID provided</div>;
  }

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getOrderById(id);
    if (!data) {
      toast.error("Failed to load order details");
      router.push("/dashboard/orders");
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleClose = () => {
    router.push("/dashboard/orders");
  };

  const handlePack = async () => {
    // Update status to in_packing before opening PackingMode
    const success = await updateOrderStatus(order.id, 'in_packing');
    if (success) {
      // Update the local order state with the new status
      const updatedOrder = { ...order, status: 'in_packing' };
      setOrder(updatedOrder);
      setShowPackingMode(true);
      
      toast.success("Packing Started", {
        description: "Order status updated to processing"
      });
    } else {
      toast.error("Failed to update order status");
    }
  };

  const handleShip = async () => {
    setShowShippingDialog(true);
  };

  const handleShipOrder = async () => {
    if (!order) return;

    // Validation for non-manual shipping
    if (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId) {
      toast.error("Tracking ID Required", {
        description: "Please enter a tracking ID for courier shipments."
      });
      return;
    }

    setIsShipping(true);

    // For manual/instore, we might not have a tracking ID, so we use a placeholder or empty
    const finalTrackingId = (shippingCompany === "Manual" || shippingCompany === "InStore")
      ? (trackingId || "MANUAL_DELIVERY")
      : trackingId;

    const { data, error } = await shipOrder(order.id, {
      shipping_company: shippingCompany,
      tracking_id: finalTrackingId
    });

    setIsShipping(false);

    if (error) {
      toast.error("Failed to update shipping status");
    } else {
      toast.success("Order Shipped!", {
        description: `Order #${order.id.slice(-8)} marked as shipped via ${shippingCompany}`
      });
      setShowShippingDialog(false);
      setTrackingId("");
      setShippingCompany("DTDC");
      // Refresh order data
      await fetchOrder();
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 relative">
      <OrderDetailsAdmin
        order={order}
        onClose={handleClose}
        onPack={handlePack}
        onShip={handleShip}
      />

      {/* Packing Mode Overlay */}
      {showPackingMode && (
        <PackingMode
          order={order}
          onComplete={() => {
            setShowPackingMode(false);
            toast.success("Packing Complete!", {
              description: `Order #${order.id.slice(-8)} is ready for shipping`
            });
            // Refresh order data to show updated status
            fetchOrder();
          }}
          onCancel={() => setShowPackingMode(false)}
        />
      )}

      {/* Shipping Dialog */}
      <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl !bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
              <Truck className="h-5 w-5 text-gray-700" />
              Ship Order #{order.id.slice(-8)}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a shipping provider and enter tracking details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-slate-900 font-medium">Shipping Provider</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger className="rounded-xl h-11 border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DTDC">DTDC Express</SelectItem>
                  <SelectItem value="BlueDart">BlueDart</SelectItem>
                  <SelectItem value="Delhivery">Delhivery</SelectItem>
                  <SelectItem value="IndiaPost">India Post</SelectItem>
                  <SelectItem value="Manual">Manual Delivery (Local)</SelectItem>
                  <SelectItem value="InStore">In-Store Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shippingCompany !== "Manual" && shippingCompany !== "InStore" ? (
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Tracking ID / AWB</Label>
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. D123456789"
                  className="font-mono uppercase rounded-xl h-11 border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
                {trackingId && (
                  <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg flex items-center gap-2 border border-blue-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Preview: https://www.dtdc.in/tracking.asp?id={trackingId}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3">
                <Bike className="h-5 w-5 text-gray-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {shippingCompany === "Manual" ? "Local Delivery Mode" : "Store Pickup Mode"}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    No tracking ID required. The customer will be notified that their order is {shippingCompany === "Manual" ? "out for delivery" : "ready for pickup"}.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowShippingDialog(false)} 
              className="rounded-lg h-11 border-slate-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShipOrder}
              disabled={isShipping || (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId)}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-md h-11 px-6"
            >
              {isShipping ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Shipment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailsPage;
