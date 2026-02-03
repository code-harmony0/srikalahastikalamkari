"use client";

import * as React from "react";
import { cn } from "@/shared/utils";

/**
 * Base Card Component
 * 
 * Defines the visual language for all card components in the dashboard.
 * All other cards (KPI, Chart, Table) inherit this styling.
 * 
 * Specifications:
 * - Border radius: 14px
 * - Padding: 20px
 * - Shadow: soft elevation (base: 0 1px 3px, hover: 0 4px 6px)
 * - Supports solid and gradient backgrounds
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: {
    from: string;
    to: string;
  };
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, gradient, hover = true, style, ...props }, ref) => {
    const gradientStyle = gradient
      ? {
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
        }
      : {};

    return (
      <div
        ref={ref}
        className={cn(
          // Base styling - defines visual language
          "rounded-[14px] p-5", // 14px radius, 20px padding
          "bg-white dark:bg-gray-800",
          "shadow-[0_1px_3px_rgba(0,0,0,0.1)]",
          // Hover state
          hover && "transition-shadow duration-200 hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
          className
        )}
        style={{ ...gradientStyle, ...style }}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mb-4", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));

CardContent.displayName = "CardContent";
