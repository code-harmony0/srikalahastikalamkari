import { supabase } from "@/lib/supabase/client"

export const getCategories = async (): Promise<{
  data: any[] | null
  error: any
}> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("name")
  return { data: data ?? null, error }
}

export const getSubCategories = async (): Promise<{
  data: any[] | null
  error: any
}> => {
  // Query categories table where parent_id is not null (these are subcategories)
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .not("parent_id", "is", null);

  const mappedData =
    data?.map((item) => ({
      ...item,
      name: item.name,
      image_url: item.image_url ?? null,
      category_id: item.parent_id, // Map parent_id to category_id for compatibility
    })) || null

  return { data: mappedData, error }
}

export const createCategory = async (payload: {
  name: string
  description?: string
}): Promise<{ data: any | null; error: any }> => {
  const slug = payload.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const { data, error } = await supabase
    .from("categories")
    .insert([{ ...payload, slug }])
    .select()
    .single()
  return { data, error }
}

export const updateCategory = async (
  id: string,
  payload: { name?: string; description?: string }
): Promise<{ data: any | null; error: any }> => {
  const dbPayload: any = { ...payload }
  
  if (payload.name) {
    dbPayload.slug = payload.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const { data, error } = await supabase
    .from("categories")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single()
  return { data, error }
}

export const deleteCategory = async (
  id: string
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
  return { data, error }
}

export const createSubCategory = async (payload: {
  name: string
  description?: string
  category_id: string // UUID string
  image_url?: string | null
}): Promise<{ data: any | null; error: any }> => {
  // Generate base slug
  const baseSlug = payload.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Get parent category to make slug unique
  const { data: parentCat } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", payload.category_id)
    .single();

  // Create unique slug by combining parent slug with subcategory slug
  const slug = parentCat ? `${parentCat.slug}-${baseSlug}` : baseSlug;

  const dbPayload = {
    name: payload.name,
    description: payload.description,
    parent_id: payload.category_id, // Use parent_id for hierarchical structure
    image_url: payload.image_url ?? null,
    slug,
  }
  const { data, error } = await supabase
    .from("categories")
    .insert([dbPayload])
    .select()
    .single()

  return { data, error }
}

export const updateSubCategory = async (
  id: string,
  payload: {
    name?: string
    description?: string
    category_id?: string // UUID string
    image_url?: string | null
  }
): Promise<{ data: any | null; error: any }> => {
  const dbPayload: any = {}
  if (payload.name) {
    dbPayload.name = payload.name
    dbPayload.slug = payload.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  if (payload.description) dbPayload.description = payload.description
  if (payload.category_id) dbPayload.parent_id = payload.category_id
  if (payload.image_url !== undefined) dbPayload.image_url = payload.image_url

  const { data, error } = await supabase
    .from("categories")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single()

  return { data, error }
}

export const deleteSubCategory = async (
  id: string
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
  return { data, error }
}

export const unlinkProductsFromCategory = async (
  categoryId: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("products")
    .update({ category_id: null, sub_category_id: null })
    .eq("category_id", categoryId)
  return { error }
}

export const unlinkProductsFromSubCategory = async (
  subCategoryId: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("products")
    .update({ sub_category_id: null })
    .eq("sub_category_id", subCategoryId)
  return { error }
}
export const seedCategories = async (categories: any[]): Promise<{ success: boolean; message: string }> => {
  try {
    const payloads = categories.map(cat => ({
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
    }));

    const { error } = await supabase
      .from("categories")
      .insert(payloads);

    if (error) throw error;

    return { success: true, message: "Default categories seeded successfully" };
  } catch (error: any) {
    console.error("Seeding error:", error);
    return { success: false, message: error.message || "Failed to seed categories" };
  }
}
