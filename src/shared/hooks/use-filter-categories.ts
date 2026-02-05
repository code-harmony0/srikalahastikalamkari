// src/shared/hooks/use-filter-categories.ts
import { useState, useEffect, useMemo } from "react";
import { getCategories, getSubCategories } from "@/services/categories";

interface Subcategory {
  id: string;
  name: string;
  image_url?: string;
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
  const [parents, setParents] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch parent categories (parent_id = null)
        const { data: parentData, error: parentError } = await getCategories();
        
        // Fetch subcategories (parent_id != null)
        const { data: subData, error: subError } = await getSubCategories();

        if (parentError) {
          throw new Error(parentError.message);
        }
        if (subError) {
          throw new Error(subError.message);
        }

        setParents(parentData || []);
        setChildren(subData || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
        console.error("Error fetching filter categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Nest subcategories under parents
  const nestedCategories = useMemo(() => {
    if (!parents.length) return [];

    return parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      image_url: parent.image_url,
      subcategories: children
        .filter((child) => child.category_id === parent.id || child.parent_id === parent.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          image_url: child.image_url || undefined,
          parentCategoryId: child.category_id || child.parent_id,
        })),
    }));
  }, [parents, children]);

  return { categories: nestedCategories, isLoading, error };
};
