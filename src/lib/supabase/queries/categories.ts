import { supabase } from '../client';
import type { Database } from '../types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(error.message);
  }
  return data || [];
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching category by slug:', error);
    throw new Error(error.message);
  }
  return data;
}

/**
 * Get top-level categories (no parent)
 */
export async function getTopLevelCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching top-level categories:', error);
    throw new Error(error.message);
  }
  return data || [];
}

/**
 * Get subcategories of a parent category
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching subcategories:', error);
    throw new Error(error.message);
  }
  return data || [];
}

/**
 * Create a new category (admin only)
 */
export async function createCategory(category: CategoryInsert): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw new Error(error.message);
  }
  return data;
}

/**
 * Update a category (admin only)
 */
export async function updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw new Error(error.message);
  }
  return data;
}

/**
 * Delete a category (admin only)
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error(error.message);
  }
}
