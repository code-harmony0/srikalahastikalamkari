// Mock implementations for common dependencies
import { jest } from '@jest/globals'

// Supabase mock
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
}

// Cart store mock
export const mockCartStore = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
  addItem: jest.fn(),
  removeItem: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
}

// Auth context mock
export const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
}

// Razorpay mock
export const mockRazorpay = {
  open: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
}

// Products service mock
export const mockProductsService = {
  getAll: jest.fn(() => Promise.resolve([])),
  getById: jest.fn(() => Promise.resolve(null)),
  getFeatured: jest.fn(() => Promise.resolve([])),
}

// Orders service mock
export const mockOrdersService = {
  create: jest.fn(() => Promise.resolve({ id: 'SKK-2024-001' })),
  getById: jest.fn(() => Promise.resolve(null)),
  getUserOrders: jest.fn(() => Promise.resolve([])),
}

// Firestore/Firebase mocks (if needed)
export const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ exists: false, data: () => null })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
    })),
    add: jest.fn(() => Promise.resolve({ id: 'test-id' })),
    where: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ docs: [] })),
    })),
  })),
}
