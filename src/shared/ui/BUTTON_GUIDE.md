# Button Component System - Theme Guide

## Overview

This project now uses a standardized button system with theme-aware components that ensure consistent styling, accessibility, and brand compliance across the entire application.

## Core Button Component

**Location:** `components/ui/button.tsx`

The base `Button` component has been enhanced with:
- ✅ **Brand typography**: Uses `font-paragraph` for consistent font family
- ✅ **Accessibility**: Built-in focus states with `focus-visible:ring-2 focus-visible:ring-primary`
- ✅ **Brand colors**: Primary gold (#BFA181), dark (#1C1A1A)
- ✅ **Variants**: `default`, `outline`, `destructive`, `secondary`, `ghost`, `link`
- ✅ **Sizes**: `sm`, `default`, `lg`, `xl`, `icon`

## Theme Button Components

**Location:** `components/ui/theme-buttons.tsx`

### 1. PrimaryButton

**Use for:** Main call-to-action buttons like "Shop Now", "Add to Cart"

```tsx
import { PrimaryButton } from "@/shared/ui/theme-buttons";

<PrimaryButton size="lg">
  Shop The Collection
  <ArrowRight className="ml-2" />
</PrimaryButton>
```

**Features:**
- Gold background with dark text
- Hover scale and shadow effects
- Active press feedback
- Built-in focus states

---

### 2. OutlineButton

**Use for:** Secondary actions like "Continue Shopping", "Learn More"

```tsx
import { OutlineButton } from "@/shared/ui/theme-buttons";

<OutlineButton size="lg">
  Continue Shopping
  <ArrowRight className="ml-2" />
</OutlineButton>
```

**Features:**
- Transparent background with gold border
- Hover fills with gold
- Smooth color transitions

---

### 3. HeroButton

**Use for:** Large CTA buttons in hero sections

```tsx
import { HeroButton } from "@/shared/ui/theme-buttons";

<HeroButton>
  Shop The Collection
  <ArrowRight className="ml-2" />
</HeroButton>
```

**Features:**
- Extra large size (xl)
- Enhanced hover effects
- Prominent shadow
- Can use any variant

---

### 4. HeroOutlineButton

**Use for:** Transparent overlay buttons in hero sections (over images)

```tsx
import { HeroOutlineButton } from "@/shared/ui/theme-buttons";

<HeroOutlineButton>
  Our Mission
</HeroOutlineButton>
```

**Features:**
- Backdrop blur effect
- White text and border
- Dark semi-transparent background
- Perfect for hero images

---

### 5. DarkOutlineButton

**Use for:** Outline buttons on solid dark backgrounds (header, hero sections with dark bg)

```tsx
import { DarkOutlineButton } from "@/shared/ui/theme-buttons";

<DarkOutlineButton onClick={handleAction}>
  <ShoppingCart className="mr-2" />
  Add All to Cart
</DarkOutlineButton>
```

**Features:**
- White text and border
- Hover fills with white, text becomes dark
- No backdrop blur (for solid backgrounds)
- Consistent with HeroOutlineButton styling

---

### 6. AddToCartButton

**Use for:** Product add-to-cart actions

```tsx
import { AddToCartButton } from "@/shared/ui/theme-buttons";

<AddToCartButton onClick={handleAddToCart}>
  <ShoppingCart className="mr-2" />
  Add to Cart
</AddToCartButton>
```

**Features:**
- Full width by default
- Large size (lg)
- Optimized for product pages

---

### 6. WishlistActionButton

**Use for:** Small action buttons in wishlist grid items

```tsx
import { WishlistActionButton } from "@/shared/ui/theme-buttons";

<WishlistActionButton onClick={handleAddToCart}>
  <ShoppingCart className="mr-2" />
  Add to Cart
</WishlistActionButton>
```

**Features:**
- Small size (sm)
- Flexible width (flex-1)
- Perfect for card actions

---

### 7. IconButton

**Use for:** Icon-only buttons (wishlist, cart, close)

```tsx
import { IconButton } from "@/shared/ui/theme-buttons";

<IconButton aria-label="Add to wishlist">
  <Heart className="w-5 h-5" />
</IconButton>
```

**Features:**
- Square shape
- Rounded full
- Ghost variant
- **Requires aria-label** for accessibility

---

### 8. GhostButton

**Use for:** Subtle actions with minimal styling

```tsx
import { GhostButton } from "@/shared/ui/theme-buttons";

<GhostButton>
  Cancel
</GhostButton>
```

**Features:**
- No background
- Subtle hover effect
- Minimal visual weight

---

### 9. DestructiveButton

**Use for:** Dangerous actions (delete, remove)

```tsx
import { DestructiveButton } from "@/shared/ui/theme-buttons";

<DestructiveButton>
  Delete Account
</DestructiveButton>
```

**Features:**
- Red/destructive color
- Clear visual warning
- Built-in accessibility

---

## Migration Guide

### Before (Old Style)
```tsx
import { Button } from "@/shared/ui/button";

<Button
  size="lg"
  className="bg-primary hover:bg-primary/90 text-primary-foreground font-paragraph font-semibold transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
>
  Shop Now
</Button>
```

### After (New Style)
```tsx
import { PrimaryButton } from "@/shared/ui/theme-buttons";

<PrimaryButton size="lg">
  Shop Now
</PrimaryButton>
```

**Benefits:**
- ✅ 80% less code
- ✅ Consistent styling
- ✅ Built-in accessibility
- ✅ Easier maintenance
- ✅ Type-safe props

---

## Button Sizes

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| `sm` | 32px | 12px | Small actions, cards |
| `default` | 40px | 16px | Standard buttons |
| `lg` | 48px | 32px | Important actions |
| `xl` | 56px | 40px | Hero CTAs |
| `icon` | 36px | Square | Icon-only buttons |

---

## Accessibility Checklist

✅ All buttons have proper focus states
✅ Icon buttons require `aria-label`
✅ Keyboard navigation supported
✅ WCAG AA color contrast compliance
✅ Clear hover/active states

---

## Color Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Gold | `#BFA181` | Primary buttons, borders |
| Dark | `#1C1A1A` | Text on gold backgrounds |
| Primary Foreground | (from theme) | Text on primary buttons |

---

## Common Patterns

### CTA with Icon
```tsx
<PrimaryButton size="lg">
  Shop Now
  <ArrowRight className="ml-2 w-5 h-5" />
</PrimaryButton>
```

### Loading State
```tsx
<PrimaryButton disabled={isLoading}>
  {isLoading ? "Processing..." : "Submit"}
</PrimaryButton>
```

### Button Group
```tsx
<div className="flex gap-4">
  <PrimaryButton>Confirm</PrimaryButton>
  <OutlineButton>Cancel</OutlineButton>
</div>
```

### Full Width
```tsx
<PrimaryButton className="w-full">
  Continue
</PrimaryButton>
```

---

## Files Updated

- ✅ `components/ui/button.tsx` - Enhanced base component
- ✅ `components/ui/theme-buttons.tsx` - New theme components
- ✅ `components/pages/AboutPage.tsx` - Migrated to theme buttons
- ✅ `components/pages/WishlistPage.tsx` - Migrated to theme buttons

## Next Steps

1. Migrate remaining pages to use theme buttons
2. Update product detail page buttons
3. Update cart page buttons
4. Update homepage buttons
5. Remove all inline button styling

---

**Last Updated:** 2025-12-28
**Status:** Ready for use across all pages
