// src/shared/hooks/use-filter-categories.ts
import { useState, useEffect, useMemo } from "react";
import { getCategories } from "@/services/categories";

interface Subcategory {
  id: string;
  name: string;
  image?: string;
  parentCategoryId: string;
}

interface Category {
  id: string;
  name: string;
  image_url?: string;
  subcategories: Subcategory[];
}

interface UseFilterCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export const useFilterCategories = (): UseFilterCategoriesResult => {
  const [rawCategories, setRawCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Single fetch - getCategories() returns ALL categories (parents + subs)
        const { data, error: fetchError } = await getCategories();

        if (fetchError) {
          throw new Error(fetchError.message);
        }
        if (!data || data.length === 0) {
          throw new Error("No categories found");
        }

        setRawCategories(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
        console.error("Error fetching filter categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Split into parents and children, nest subcategories under parents
  const nestedCategories = useMemo(() => {
    if (!rawCategories.length) return [];

    // Parents = rows where parent_id is null/undefined
    const parents = rawCategories.filter((c) => !c.parent_id);
    // Children = rows where parent_id is set
    const children = rawCategories.filter((c) => c.parent_id);

    return parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      image_url: parent.image_url, // Add this
      subcategories: children
        .filter((child) => child.parent_id === parent.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          image: child.image_url || undefined,
          parentCategoryId: child.parent_id,
        })),
    }));
  }, [rawCategories]);

  return { categories: nestedCategories, isLoading, error };
};
