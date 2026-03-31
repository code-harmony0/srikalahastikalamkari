/**
 * Cart Store - Zustand state management
 * Replaces Wix ecommerce cart functionality
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/shared/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: (products: Product[]) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        if (!product?.id) {
          console.error('Cannot add product to cart: Missing product.id');
          return;
        }
        const maxStock = (product as any).stock_quantity ?? (product as any).quantity ?? Infinity;
        set((state) => {
          const variantId = (product as any).selectedVariant?.id;
          const existingItem = state.items.find(
            (item) => item.productId === product.id && item.variant === variantId
          );

          if (existingItem) {
            const newQty = Math.min(existingItem.quantity + quantity, maxStock);
            if (newQty === existingItem.quantity) return state; // already at stock limit
            return {
              items: state.items.map((item) =>
                (item.productId === product.id && item.variant === variantId)
                  ? { ...item, quantity: newQty, maxStock }
                  : item
              ),
            };
          }

          const initialQty = Math.min(quantity, maxStock);
          return {
            items: [...state.items, { productId: product.id, quantity: initialQty, variant: variantId, maxStock }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId !== productId) return item;
            const capped = item.maxStock ? Math.min(quantity, item.maxStock) : quantity;
            return { ...item, quantity: capped };
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: (products) => {
        const { items } = get();
        return items.reduce((total, item) => {
          const product = products.find((p) => p.id === item.productId);
          return total + (product?.price || 0) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
