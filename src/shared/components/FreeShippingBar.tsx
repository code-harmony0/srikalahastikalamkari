"use client";

import React from "react";
import { Truck } from "lucide-react";
import { formatPrice } from "@/shared/utils";
import { motion } from "framer-motion";

export function FreeShippingBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
    >
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <Truck className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-green-700">
          🎉 Free Shipping on all orders!
        </p>
      </div>
    </motion.div>
  );
}
