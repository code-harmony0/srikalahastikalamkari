"use client"

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react"
import { getProducts, createProduct, updateProduct as updateProd, deleteProduct as deleteProd } from "@/backend/products"
import type { Product } from "@/shared/types";
import { useToast } from "@/shared/ui/use-toast";

type InventoryContextType = {
  products: Product[];
  loading: boolean;
  fetchData: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<any>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<any>;
  deleteProduct: (id: string) => Promise<any>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
)

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getProducts();
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
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
      const { data, error } = await updateProd(id, updates);
      if (error) throw error;
      await fetchData();
      return { data, error: null };
    } catch (error: any) {
      console.error("Error updating product:", error);
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
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}