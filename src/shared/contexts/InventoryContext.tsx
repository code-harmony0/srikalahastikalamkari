"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getProducts,
  createProduct,
  updateProduct as updateProd,
  deleteProduct as deleteProd,
} from "@/services/products";
import type { Product } from "@/shared/types";
import { useToast } from "@/shared/ui/use-toast";

type InventoryContextType = {
  products: Product[];
  loading: boolean;
  fetchData: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<any>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<any>;
  deleteProduct: (id: string) => Promise<any>;
};

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // Guard: skip fetch if Supabase is not configured (placeholder .env.local)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const isUnconfigured =
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes("your-project-url") ||
      supabaseUrl === "https://your-project-url.supabase.co";

    if (isUnconfigured) {
      console.warn(
        "⚠️ InventoryContext: Supabase credentials not configured. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
      setProducts([]);
      setLoading(false);
      return;
    }

    console.log("🔄 InventoryContext: Starting data fetch...");
    setLoading(true);

    try {
      console.log("📡 Calling getProducts()...");
      const { data, error } = await getProducts();

      if (error) {
        console.error(
          "❌ InventoryContext: getProducts returned error:",
          error,
        );
        throw error;
      }

      if (!data) {
        console.warn("⚠️ InventoryContext: No data returned from getProducts");
        setProducts([]);
      } else {
        console.log(
          "✅ InventoryContext: Products loaded successfully:",
          data.length,
        );
        setProducts(data);
      }
    } catch (error: any) {
      console.error(
        "💥 InventoryContext: Critical error during fetch:",
        error.message,
      );

      // For development, provide fallback empty array instead of mock data
      // This allows the app to function even without database
      setProducts([]);
      console.log("ℹ️ InventoryContext: Continuing with empty product list");
    } finally {
      setLoading(false);
      console.log("🏁 InventoryContext: Fetch operation complete");
    }
  }, []);

  useEffect(() => {
    console.log("🚀 InventoryProvider: Initializing, calling fetchData...");
    fetchData();
  }, [fetchData]);

  const addProduct = async (payload: Partial<Product>) => {
    try {
      const { data, error } = await createProduct(payload);
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (error: any) {
      console.error("Error adding product:", error);
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      console.log("🔄 InventoryContext: Starting product update for ID:", id);
      console.log("📝 InventoryContext: Update data:", updates);
      
      const { data, error } = await updateProd(id, updates);
      if (error) throw error;
      
      console.log("✅ InventoryContext: Backend update successful, refreshing data...");
      await fetchData();
      console.log("🔄 InventoryContext: Data refresh complete");
      
      return { data, error: null };
    } catch (error: any) {
      console.error("❌ InventoryContext: Error updating product:", error);
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await deleteProd(id);
      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (error: any) {
      console.error("Error deleting product:", error);
      return { error };
    }
  };

  const value = {
    products,
    loading,
    fetchData,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
