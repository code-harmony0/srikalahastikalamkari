// src/shared/hooks/use-filter-categories.ts
import { useState, useEffect, useMemo } from "react";
import { getCategories, getSubCategories } from "@/services/categories";

export interface Subcategory {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  parentCategoryId: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
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

    const getSortIndex = (name: string) => {
      const lower = name.toLowerCase();
      if (lower === 'pure silk kanchipuram pattu') return 0;
      if (lower === 'semi kanchi silk') return 1;
      if (lower.includes('tussar') && !lower.includes('munga')) return 2;
      if (lower.includes('munga') || lower.includes('moonga')) return 3;
      if (lower.includes('bangalore') || lower.includes('banglore')) return 4;
      if (lower.includes('cotton')) return 5;
      if (lower.includes('linen')) return 6;
      if (lower.includes('pochampalli')) return 7;
      if (lower.includes('dola silk')) return 8;
      if (lower.includes('pure crepe')) return 9;
      if (lower.includes('crepe')) return 10;
      return 999;
    };

    const formatted = parents.map((parent) => {
      let subs = children
        .filter((child) => child.category_id === parent.id || child.parent_id === parent.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          image_url: child.image_url || undefined,
          parentCategoryId: child.category_id || child.parent_id,
        }));

      if (parent.name.toLowerCase() === 'sarees') {
        subs.sort((a, b) => {
          const iA = getSortIndex(a.name);
          const iB = getSortIndex(b.name);
          if (iA !== iB) return iA - iB;
          return a.name.localeCompare(b.name);
        });
      }

      return {
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        image_url: parent.image_url,
        subcategories: subs,
      };
    });

    // Sort so Sarees appears first
    formatted.sort((a, b) => {
      if (a.name.toLowerCase() === 'sarees') return -1;
      if (b.name.toLowerCase() === 'sarees') return 1;
      return 0;
    });

    return formatted;
  }, [parents, children]);

  return { categories: nestedCategories, isLoading, error };
};
