"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";
import environment from "@/shared/config/environment";

export default function FloatingAdminButton() {
  const [isVisible, setIsVisible] = useState(true);

  // Never show in production
  if (environment.isProduction) return null;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVisible(false)}
          className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center shadow-lg transition-colors"
          aria-label="Hide admin button"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Admin Dashboard Link with Tooltip */}
        <div className="group relative">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full"
          >
            <Link
              href="/dashboard"
              className="w-full h-full rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              aria-label="Admin Dashboard"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Settings className="w-7 h-7 group-hover:drop-shadow-md" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Admin Dashboard
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
