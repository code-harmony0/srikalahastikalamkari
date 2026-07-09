import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  redirectUrl: string | null;
  openModal: (redirectUrl?: string) => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  redirectUrl: null,
  openModal: (redirectUrl) => set({ isOpen: true, redirectUrl: redirectUrl || null }),
  closeModal: () => set({ isOpen: false, redirectUrl: null }),
}));
