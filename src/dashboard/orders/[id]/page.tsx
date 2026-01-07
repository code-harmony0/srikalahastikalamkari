"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, deliverOrder, shipOrder } from "@/backend/orders";
import OrderDetailsAdmin from "../components/OrderDetailsAdmin";
import { useToast } from "@/shared/ui/use-toast";
import { Loader2 } from "lucide-react";

const OrderDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (!id) {
    console.error("No ID found in params");
    return <div>Error: No Order ID provided</div>;
  }

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await getOrderById(id);
      if (error) {
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
    // TODO: Implement packing workflow
    toast({ 
      title: "Feature Not Implemented", 
      description: "Packing workflow needs to be implemented" 
    });
  };

  const handleShip = async () => {
     // This usually requires a modal to enter tracking info.
     // For now, we can just log or show a "Not Implemented" toast if the modal logic isn't easily portable without the modal state.
     // Or better, we can assume the OrderDetailsAdmin might handle the UI for shipping if we pass a handler.
     // The original Orders.tsx had a separate dialog for shipping.
     // We might need to implement that dialog here or in OrderDetailsAdmin.
     // For now, let's keep it simple.
     console.log("Ship requested");
  };

  const handleDeliver = async () => {
    if (window.confirm(`Mark Order #${order.id} as Delivered?`)) {
      const { error } = await deliverOrder(order.id);
      if (!error) {
        setOrder({ ...order, status: 'delivered' });
        toast({
          title: "Order Delivered",
          description: `Order #${order.id} marked as delivered`,
          className: "bg-green-50 border-green-200",
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
    <div className="h-screen bg-slate-50">
      <OrderDetailsAdmin
        order={order}
        onClose={handleClose}
        onPack={handlePack}
        onShip={handleShip}
        onDeliver={handleDeliver}
      />
    </div>
  );
};

export default OrderDetailsPage;
