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
        set((state) => {
          const variantId = (product as any).selectedVariant?.id;
          const existingItem = state.items.find(
            (item) => item.productId === product.id && item.variant === variantId
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                (item.productId === product.id && item.variant === variantId)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { productId: product.id, quantity, variant: variantId }],
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
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
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
