import * as React from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/shared/utils";

/**
 * Primary CTA Button - Main call-to-action button with hover effects
 * Used for primary actions like "Shop Now", "Add to Cart", etc.
 */
export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        className={cn(
          "font-paragraph font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

/**
 * Outline Button - Secondary CTA with border and transparent background
 * Used for secondary actions like "Learn More", "Continue Shopping", etc.
 */
export const OutlineButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "font-paragraph font-semibold border-primary text-primary hover:bg-primary hover:text-wix-dark transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
OutlineButton.displayName = "OutlineButton";

/**
 * Hero Button - Large CTA button for hero sections
 * Used in hero sections with enhanced visibility
 */
export const HeroButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          "h-14 px-10 text-lg rounded-xl font-paragraph font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
HeroButton.displayName = "HeroButton";

/**
 * Hero Outline Button - Transparent overlay button for hero sections
 * Used in hero sections over images with backdrop blur
 */
export const HeroOutlineButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "h-14 px-10 text-lg rounded-xl font-paragraph font-semibold bg-black/20 text-white backdrop-blur-sm border-white/50 hover:bg-white/10 hover:border-white/80 hover:text-white transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
HeroOutlineButton.displayName = "HeroOutlineButton";

/**
 * Dark Background Outline Button - Outline button optimized for dark backgrounds
 * Used on dark sections (not over images) with white text and borders
 */
export const DarkOutlineButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "h-12 px-8 text-base rounded-lg font-paragraph font-semibold border-white text-white hover:bg-white hover:text-wix-dark transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
DarkOutlineButton.displayName = "DarkOutlineButton";

/**
 * Icon Button - Square button for icons only
 * Used for wishlist, cart, close buttons, etc.
 */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { "aria-label": string }
>(({ className, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      size="icon"
      variant="ghost"
      className={cn(
        "rounded-full hover:bg-primary/10 transition-colors duration-300",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
});
IconButton.displayName = "IconButton";

/**
 * Add to Cart Button - Specific button for product add to cart action
 * Standardizes cart button styling across product pages
 */
export const AddToCartButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        className={cn(
          "w-full h-12 px-8 text-base rounded-lg font-paragraph font-semibold transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
AddToCartButton.displayName = "AddToCartButton";

/**
 * Wishlist Action Button - Small button for wishlist page actions
 * Used in wishlist grid items
 */
export const WishlistActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        className={cn(
          "flex-1 h-8 px-3 text-xs font-paragraph font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
WishlistActionButton.displayName = "WishlistActionButton";

/**
 * Ghost Button - Minimal button with no background
 * Used for subtle actions
 */
export const GhostButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
GhostButton.displayName = "GhostButton";

/**
 * Destructive Button - For delete/remove actions
 * Used for dangerous actions like delete, remove, etc.
 */
export const DestructiveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="destructive"
        className={cn(className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
DestructiveButton.displayName = "DestructiveButton";
