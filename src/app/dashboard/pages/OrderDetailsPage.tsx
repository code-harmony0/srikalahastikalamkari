import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrderById, deliverOrder, shipOrder } from "@/backend/orders";
import OrderDetailsAdmin from "../components/OrderDetailsAdmin";
import { useToast } from "@/shared/ui/use-toast";
import { Loader2, Truck, CheckCircle2 } from "lucide-react";
import PackingMode from "../components/PackingMode";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const OrderDetailsPage = ({ id }: { id?: string }) => {
  const router = useRouter();
  const { toast } = useToast();
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

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getOrderById(id);
      if (!data) {
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
        router.push("/dashboard/orders");
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id, router, toast]);

  const handleClose = () => {
    router.push("/dashboard/orders");
  };

  const handlePack = async () => {
    setShowPackingMode(true);
  };

  const handleShip = async () => {
    setShowShippingDialog(true);
  };

  const confirmShipment = async () => {
    if (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter a tracking ID",
        variant: "destructive",
      });
      return;
    }

    setIsShipping(true);
    const { error } = await shipOrder(order.id, {
      shipping_company: shippingCompany,
      tracking_id: trackingId || "MANUAL"
    });
    setIsShipping(false);

    if (!error) {
      setOrder({ 
        ...order, 
        status: 'shipped',
        shipping_company: shippingCompany,
        tracking_id: trackingId
      });
      setShowShippingDialog(false);
      toast({
        title: "Order Shipped",
        description: `Order #${order.id} marked as shipped`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update shipping status",
        variant: "destructive",
      });
    }
  };

  const handleDeliver = async () => {
    if (window.confirm(`Mark Order #${order.id} as Delivered?`)) {
      const { error } = await deliverOrder(order.id);
      if (!error) {
        setOrder({ ...order, status: 'delivered' });
        toast({
          title: "Order Delivered",
          description: `Order #${order.id} marked as delivered`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="h-screen bg-slate-50 relative">
      <OrderDetailsAdmin
        order={order}
        onClose={handleClose}
        onPack={handlePack}
        onShip={handleShip}
        onDeliver={handleDeliver}
      />

      {/* Packing Mode Overlay */}
      {showPackingMode && (
        <PackingMode
          order={order}
          onComplete={() => {
            setShowPackingMode(false);
            const refreshOrder = async () => {
              const data = await getOrderById(id);
              if (data) setOrder(data);
            };
            refreshOrder();
          }}
          onCancel={() => setShowPackingMode(false)}
        />
      )}

      {/* Shipping Dialog */}
      <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl !bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Truck className="h-5 w-5 text-blue-600" />
              Ship Order #{order.id}
            </DialogTitle>
            <DialogDescription>
              Select a shipping provider and enter tracking details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Shipping Provider</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DTDC">DTDC Express</SelectItem>
                  <SelectItem value="BlueDart">BlueDart</SelectItem>
                  <SelectItem value="Delhivery">Delhivery</SelectItem>
                  <SelectItem value="IndiaPost">India Post</SelectItem>
                  <SelectItem value="Manual">Manual Delivery</SelectItem>
                  <SelectItem value="InStore">In-Store Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shippingCompany !== "Manual" && shippingCompany !== "InStore" && (
              <div className="space-y-2">
                <Label>Tracking ID / AWB</Label>
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. D123456789"
                  className="font-mono uppercase rounded-xl h-11"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShippingDialog(false)}>Cancel</Button>
            <Button
              onClick={confirmShipment}
              disabled={isShipping}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isShipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Confirm Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailsPage;
