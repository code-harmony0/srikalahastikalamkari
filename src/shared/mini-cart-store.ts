import { create } from "zustand"

interface MiniCartState {
  isOpen: boolean
  /** Product id most recently added, so the drawer can highlight it. */
  lastAddedId: string | null
  open: (productId?: string) => void
  close: () => void
}

export const useMiniCartStore = create<MiniCartState>((set) => ({
  isOpen: false,
  lastAddedId: null,
  open: (productId) => set({ isOpen: true, lastAddedId: productId ?? null }),
  close: () => set({ isOpen: false }),
}))
