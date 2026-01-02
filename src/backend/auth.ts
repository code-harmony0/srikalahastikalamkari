/**
 * Auth Service - Mock implementation replacing @wix/members
 * Future: Replace with Supabase Auth or NextAuth
 */

import { User } from "@/shared/types";

// Mock user data
let currentUser: User | null = null;

export const authService = {
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return currentUser;
  },

  /**
   * Sign in (mock)
   */
  async signIn(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentUser = {
      id: "mock-user-1",
      email,
      name: "Guest User",
      avatar: "",
    };
    return currentUser;
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    currentUser = null;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return currentUser !== null;
  },
};
