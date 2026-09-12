import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import { validateImageRef, validateImageRefArray } from "@/lib/image-validation";
import type { Product } from "@/shared/types";

const toValidationError = (error: unknown) => ({
  message: error instanceof Error ? error.message : "Invalid image reference",
  details: null,
  hint: "Use Cloudflare Image IDs for new image values. Existing legacy http(s) URLs can only be preserved unchanged during migration.",
  code: "VALIDATION",
  status: 400,
});

type ImageSanitizeOptions = {
  allowedLegacyRefs?: Iterable<string | null | undefined>;
};

const sanitizePayload = (
  payload: Partial<Product>,
  options: ImageSanitizeOptions = {},
) => {
  const p: any = { ...payload };
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  const imageValidation = options.allowedLegacyRefs
    ? {
        allowLegacy: true,
        allowedLegacyRefs: options.allowedLegacyRefs,
      }
    : {
        allowLegacy: false,
      };

  const imageAliases: string[] = [];

  if (p.image !== undefined) {
    const image = validateImageRef(p.image, {
      fieldName: "image",
      ...imageValidation,
    });
    if (image) imageAliases.push(image);
    delete p.image;
  }

  if (p.mainImage !== undefined) {
    const mainImage = validateImageRef(p.mainImage, {
      fieldName: "mainImage",
      ...imageValidation,
    });
    if (mainImage) imageAliases.push(mainImage);
    delete p.mainImage;
  }

  if (p.images !== undefined) {
    p.images = validateImageRefArray(p.images, "images", {
      ...imageValidation,
    });
  } else if (imageAliases.length > 0) {
    p.images = imageAliases;
  }

  if (p.price !== undefined) p.price = p.price === "" ? null : Number(p.price);
  
  // Handle originalPrice field (now exists in database)
  if (p.originalPrice !== undefined) {
    p.original_price = p.originalPrice === "" ? null : Number(p.originalPrice);
    delete p.originalPrice;
  }

  if (p.colors !== undefined) {
    if (typeof p.colors === "string") {
      p.colors = p.colors
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else if (!Array.isArray(p.colors)) {
      p.colors = [String(p.colors)];
    }
  }

  // Remove inStock handling since column doesn't exist (computed from stock_quantity > 0)
  if (p.inStock !== undefined) {
    console.warn("inStock field ignored - computed from stock_quantity > 0");
    delete p.inStock;
  }

  // Handle isVisible field (now exists in database as is_visible)
  if (p.isVisible !== undefined) {
    p.is_visible = Boolean(p.isVisible);
    delete p.isVisible;
  }

  // Handle isFeatured field (now exists in database as is_featured)
  if (p.isFeatured !== undefined) {
    p.is_featured = Boolean(p.isFeatured);
    delete p.isFeatured;
  }

  // Handle isCustomDesign field
  if (p.isCustomDesign !== undefined) {
    p.is_custom_design = Boolean(p.isCustomDesign);
    delete p.isCustomDesign;
  }

  // Handle category field (now exists as category_id in database)
  if (p.category !== undefined) {
    p.category_id = p.category || null;
    delete p.category;
  }

  // Handle subCategory field (now exists as sub_category_id in database)
  if (p.subCategory !== undefined) {
    p.sub_category_id = p.subCategory || null;
    delete p.subCategory;
  }

  if (p.id !== undefined) delete p.id;

  // Updated keyMap to include existing columns
  const keyMap: Record<string, string> = {
    quantity: "stock_quantity",
    images: "images",
  };

  if (p.specifications !== undefined && typeof p.specifications === "string") {
    try {
      p.specifications = JSON.parse(p.specifications);
    } catch (e) {
      console.error("Error parsing specifications JSON:", e);
      p.specifications = {};
    }
  }

  const mapped: any = {};
  Object.keys(p).forEach((k) => {
    const mappedKey = keyMap[k] ?? k;
    if (mappedKey.endsWith("_id") && k !== "product_id") {
      // Handle UUID fields like category_id
      const val = p[k];
      if (val === null || val === undefined || val === "") {
        mapped[mappedKey] = null;
      } else if (
        typeof val === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          val,
        )
      ) {
        // It's a UUID, pass it as is
        mapped[mappedKey] = val;
      } else {
        console.warn(`Invalid UUID for ${mappedKey}:`, val);
        mapped[mappedKey] = null;
      }
    } else {
      mapped[mappedKey] = p[k];
    }
  });

  return mapped as Partial<Product>;
};

const collectStringRefs = (refs: unknown): string[] => {
  if (typeof refs === "string") return [refs];
  if (!Array.isArray(refs)) return [];

  return refs.filter((ref): ref is string => typeof ref === "string");
};

const getExistingProductImageRefs = async (
  id: string,
): Promise<{ refs: string[]; error: any }> => {
  const { data, error } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .maybeSingle();

  if (error) return { refs: [], error };
  if (!data) {
    return {
      refs: [],
      error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
    };
  }

  return {
    refs: collectStringRefs(data.images),
    error: null,
  };
};

const findInvalidIdField = (obj: Record<string, any>) => {
  for (const key of Object.keys(obj)) {
    if (key.endsWith("_id")) {
      const v = obj[key];
      // For UUID-based schemas, ID fields should be valid UUID strings or null
      // Use the same validation as sanitizePayload
      if (v !== null && v !== undefined && v !== "" && (typeof v !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))) {
        return { field: key, value: v };
      }
    }
  }
  return null;
};

export const getProducts = async (): Promise<{
  data: Product[] | null;
  error: any;
}> => {
  // Early exit if Supabase is not configured with real credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (
    !supabaseUrl ||
    supabaseUrl.includes("your-project-url") ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { data: [], error: null };
  }

  console.log("🔍 getProducts: Starting product fetch...");

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Database query timeout - check connection")),
      8000,
    );
  });

  try {
    // First try to get products with variants and category info
    console.log("📡 Attempting to fetch products with variants and categories...");
    const queryPromise = supabase
      .from("products")
      .select("*, product_variants(*), categories:category_id(id, name)")
      .order("created_at", { ascending: false });

    const { data, error } = (await Promise.race([
      queryPromise,
      timeoutPromise,
    ])) as any;

    if (error) {
      console.warn(
        "⚠️ Error fetching products with variants:",
        error.message,
        error.code,
      );

      // Check if it's a table/relationship issue
      if (error.code === "42P01" || error.code === "PGRST200") {
        console.log(
          "🔄 Variants table missing, falling back to products only...",
        );
        // Fallback if variants table or relationship is missing
        const fallbackQuery = supabase
          .from("products")
          .select("*, categories:category_id(id, name)")
          .order("created_at", { ascending: false });

        const { data: productsOnly, error: productsError } =
          (await Promise.race([fallbackQuery, timeoutPromise])) as any;

        if (productsError) {
          console.error("❌ Fallback query also failed:", productsError);
          return { data: null, error: productsError };
        }

        const mapped = productsOnly?.map((p: any) => ({
          ...p,
          isFeatured: p.is_featured ?? p.isFeatured,
          isVisible: p.is_visible ?? p.isVisible ?? true,
          quantity: p.stock_quantity ?? 0,
          inStock: (p.stock_quantity ?? 0) > 0,
          in_stock: (p.stock_quantity ?? 0) > 0,
          categoryName: p.categories?.name || null,
          variants: [],
        }));
        console.log(
          "✅ Successfully fetched products without variants:",
          mapped?.length,
        );
        return { data: (mapped as Product[]) ?? null, error: null };
      }

      // If it's a different error, return it
      return { data: null, error };
    }

    // Success case - map product_variants to variants, normalize flags, and add category name
    const mapped = data?.map((p: any) => ({
      ...p,
      isFeatured: p.is_featured ?? p.isFeatured,
      isVisible: p.is_visible ?? p.isVisible ?? true,
      quantity: p.stock_quantity ?? 0,
      inStock: (p.stock_quantity ?? 0) > 0,
      in_stock: (p.stock_quantity ?? 0) > 0,
      categoryName: p.categories?.name || null,
      variants: p.product_variants,
    }));
    console.log(
      "✅ Successfully fetched products with variants:",
      mapped?.length,
    );
    return { data: (mapped as Product[]) ?? null, error: null };
  } catch (err) {
    console.error("Critical error in getProducts:", err);
    return { data: null, error: err };
  }
};

export const getProductById = async (
  id: string,
): Promise<{ data: Product | null; error: any }> => {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUUID) {
    return {
      data: null,
      error: { message: "Invalid product ID format (not a UUID)", code: "INVALID_UUID", status: 400 },
    };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*), categories:category_id(id, name)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn(
        "Error fetching product by ID with variants:",
        error.message,
      );
      const { data: productOnly, error: productError } = await supabase
        .from("products")
        .select("*, categories:category_id(id, name)")
        .eq("id", id)
        .maybeSingle();

      if (productError) return { data: null, error: productError };
      if (productOnly) {
        (productOnly as any).isFeatured =
          (productOnly as any).is_featured ?? (productOnly as any).isFeatured;
        (productOnly as any).isVisible =
          (productOnly as any).is_visible ?? (productOnly as any).isVisible ?? true;
        (productOnly as any).quantity = (productOnly as any).stock_quantity ?? 0;
        (productOnly as any).inStock =
          ((productOnly as any).stock_quantity ?? 0) > 0;
        (productOnly as any).in_stock =
          ((productOnly as any).stock_quantity ?? 0) > 0;
        (productOnly as any).categoryName = (productOnly as any).categories?.name || null;
        (productOnly as any).variants = [];
      }
      return { data: (productOnly as Product) ?? null, error: null };
    }

    if (!data) {
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      };
    }

    if (data) {
      (data as any).isFeatured =
        (data as any).is_featured ?? (data as any).isFeatured;
      (data as any).isVisible =
        (data as any).is_visible ?? (data as any).isVisible ?? true;
      (data as any).quantity = (data as any).stock_quantity ?? 0;
      (data as any).inStock = ((data as any).stock_quantity ?? 0) > 0;
      (data as any).in_stock = ((data as any).stock_quantity ?? 0) > 0;
      (data as any).categoryName = (data as any).categories?.name || null;
      (data as any).variants = (data as any).product_variants;
    }
    return { data: (data as Product) ?? null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const getProductBySlug = async (
  slug: string,
): Promise<{ data: Product | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*), categories:category_id(id, name)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn(
        "Error fetching product by slug with variants:",
        error.message,
      );
      const { data: productOnly, error: productError } = await supabase
        .from("products")
        .select("*, categories:category_id(id, name)")
        .eq("slug", slug)
        .maybeSingle();

      if (productError) return { data: null, error: productError };
      if (productOnly) {
        (productOnly as any).isFeatured =
          (productOnly as any).is_featured ?? (productOnly as any).isFeatured;
        (productOnly as any).isVisible =
          (productOnly as any).is_visible ?? (productOnly as any).isVisible ?? true;
        (productOnly as any).quantity = (productOnly as any).stock_quantity ?? 0;
        (productOnly as any).inStock =
          ((productOnly as any).stock_quantity ?? 0) > 0;
        (productOnly as any).in_stock =
          ((productOnly as any).stock_quantity ?? 0) > 0;
        (productOnly as any).categoryName = (productOnly as any).categories?.name || null;
        (productOnly as any).variants = [];
      }
      return { data: (productOnly as Product) ?? null, error: null };
    }

    if (!data) {
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      };
    }

    if (data) {
      (data as any).isFeatured =
        (data as any).is_featured ?? (data as any).isFeatured;
      (data as any).isVisible =
        (data as any).is_visible ?? (data as any).isVisible ?? true;
      (data as any).quantity = (data as any).stock_quantity ?? 0;
      (data as any).inStock = ((data as any).stock_quantity ?? 0) > 0;
      (data as any).in_stock = ((data as any).stock_quantity ?? 0) > 0;
      (data as any).categoryName = (data as any).categories?.name || null;
      (data as any).variants = (data as any).product_variants;
    }
    return { data: (data as Product) ?? null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const createProduct = async (
  payload: Partial<Product>,
): Promise<{ data: Product | null; error: any }> => {
  let sanitized: Partial<Product>;
  try {
    sanitized = sanitizePayload(payload);
  } catch (error) {
    return { data: null, error: toValidationError(error) };
  }
  const invalid = findInvalidIdField(sanitized as Record<string, any>);
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(
      invalid.value,
    )}`;
    return {
      data: null,
      error: {
        message,
        details: null,
        hint: "Ensure *_id fields are valid UUIDs or null",
        code: "VALIDATION",
        status: 400,
      },
    };
  }
  const attemptInsert = async (obj: any) =>
    await supabase.from("products").insert([obj]).select().single();

  const { variants, ...productPayload } = sanitized as any;

  // Generate slug if missing
  if (!productPayload.slug && productPayload.name) {
    productPayload.slug = productPayload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + 
      "-" + Math.random().toString(36).substring(2, 7); // Add random suffix to ensure uniqueness
  }

  const { data: product, error, status } = await attemptInsert(productPayload);
  if (error) {
    // Handle missing columns fallback logic
    // ... (omitting existing fallback logic for brevity in this tool call, will keep it in actual file)
  }

  if (
    !error &&
    product &&
    variants &&
    Array.isArray(variants) &&
    variants.length > 0
  ) {
    console.log("🔧 Attempting to insert variants");
    console.log("📦 Variants data:", variants);

    const variantsWithId = variants.map((v) => ({
      ...v,
      product_id: product.id,
    }));

    console.log("📋 Variants with product_id:", variantsWithId);

    // Try admin client first (service role should bypass RLS)
    const { error: variantError } = await supabaseAdmin
      .from("product_variants")
      .insert(variantsWithId);

    if (variantError) {
      console.error("❌ Variant insertion failed:", variantError);
      console.error("❌ Error details:", {
        message: variantError.message,
        details: variantError.details,
        hint: variantError.hint,
        code: variantError.code,
      });

      // Check if it's an RLS issue
      if (
        variantError.message?.includes("row-level security") ||
        variantError.message?.includes("policy") ||
        variantError.code === "42501"
      ) {
        console.warn(
          "⚠️ RLS policy blocking variant insertion - variants will be skipped",
        );
        console.warn(
          "💡 To fix: Check product_variants table RLS policies in Supabase dashboard",
        );
      } else if (variantError.message?.includes("Invalid API key")) {
        console.error(
          "❌ Service role key is invalid - check SUPABASE_SERVICE_ROLE_KEY",
        );
      } else {
        console.error("❌ Unknown variant insertion error");
      }

      // Don't fail the entire operation for variant errors - product is still created
      console.warn(
        "⚠️ Product created successfully, but variants were not saved",
      );
    } else {
      console.log("✅ Variants inserted successfully");
    }
  } else {
    console.log("ℹ️ No variants to insert or product creation failed");
  }

  if (!error) return { data: (product as Product) ?? null, error: null };

  const missingMatch =
    typeof error?.message === "string" &&
    error.message.match(/Could not find the '(.+?)' column/);
  if (missingMatch) {
    const missingCol = missingMatch[1];
    const fallbacks: Array<{ desc: string; mapper: (src: any) => any }> = [];

    if ((sanitized as any).category !== undefined) {
      fallbacks.push({
        desc: "map category -> category_id",
        mapper: (src) => {
          const copy = { ...src };
          const val = copy.category;
          delete copy.category;
          const coerced = Number(val);
          copy["category_id"] = Number.isNaN(coerced) ? null : coerced;
          return copy;
        },
      });

      fallbacks.push({
        desc: "map category -> category_name",
        mapper: (src) => {
          const copy = { ...src };
          copy["category_name"] = copy.category;
          delete copy.category;
          return copy;
        },
      });
    }

    fallbacks.push({
      desc: `remove ${missingCol}`,
      mapper: (src) => {
        const copy = { ...src };
        if (copy[missingCol] !== undefined) delete copy[missingCol];
        return copy;
      },
    });

    for (const fb of fallbacks) {
      try {
        const attemptPayload = fb.mapper(sanitized);
        const r = await attemptInsert(attemptPayload);
        if (!r.error) {
          return { data: (r.data as Product) ?? null, error: null };
        }
      } catch (err) {}
    }
  }

  return {
    data: null,
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status,
    },
  };
};

export const updateProduct = async (
  id: string,
  payload: Partial<Product>,
): Promise<{ data: Product | null; error: any }> => {
  let sanitized: Partial<Product>;
  try {
    const existingImageRefs = await getExistingProductImageRefs(id);
    if (existingImageRefs.error) {
      return { data: null, error: existingImageRefs.error };
    }

    sanitized = sanitizePayload(payload, {
      allowedLegacyRefs: existingImageRefs.refs,
    });
  } catch (error) {
    return { data: null, error: toValidationError(error) };
  }
  const invalid = findInvalidIdField(sanitized as Record<string, any>);
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(
      invalid.value,
    )}`;
    return {
      data: null,
      error: {
        message,
        details: null,
        hint: "Ensure *_id fields are valid UUIDs or null",
        code: "VALIDATION",
        status: 400,
      },
    };
  }
  const attemptUpdate = async (obj: any) =>
    await supabase
      .from("products")
      .update(obj)
      .eq("id", id)
      .select()
      .maybeSingle();

  const { variants, ...productPayload } = sanitized as any;
  const { data: product, error, status } = await attemptUpdate(productPayload);

  if (!error && product && variants && Array.isArray(variants)) {
    // Basic sync: delete old and insert new (could be improved to upsert)
    // For now, let's do a more robust approach if IDs exist
    const { data: existingVariants } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", id);
    const existingIds = existingVariants?.map((v) => v.id) || [];

    const toUpdate = variants.filter((v) => v.id && existingIds.includes(v.id));
    const toInsert = variants
      .filter((v) => !v.id)
      .map((v) => ({ ...v, product_id: id }));
    const providedIds = variants.filter((v) => v.id).map((v) => v.id);
    const toDelete = existingIds.filter((id) => !providedIds.includes(id));

    if (toDelete.length > 0) {
      await supabase.from("product_variants").delete().in("id", toDelete);
    }
    if (toUpdate.length > 0) {
      for (const v of toUpdate) {
        await supabase.from("product_variants").update(v).eq("id", v.id);
      }
    }
    if (toInsert.length > 0) {
      await supabase.from("product_variants").insert(toInsert);
    }
  }

  if (!error) {
    if (!product)
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      };
    return { data: (product as Product) ?? null, error: null };
  }

  const missingMatch =
    typeof error?.message === "string" &&
    error.message.match(/Could not find the '(.+?)' column/);
  if (missingMatch) {
    const missingCol = missingMatch[1];
    const fallbacks: Array<{ desc: string; mapper: (src: any) => any }> = [];

    if ((sanitized as any).category !== undefined) {
      fallbacks.push({
        desc: "map category -> category_id",
        mapper: (src) => {
          const copy = { ...src };
          const val = copy.category;
          delete copy.category;
          const coerced = Number(val);
          copy["category_id"] = Number.isNaN(coerced) ? null : coerced;
          return copy;
        },
      });

      fallbacks.push({
        desc: "map category -> category_name",
        mapper: (src) => {
          const copy = { ...src };
          copy["category_name"] = copy.category;
          delete copy.category;
          return copy;
        },
      });
    }

    fallbacks.push({
      desc: `remove ${missingCol}`,
      mapper: (src) => {
        const copy = { ...src };
        if (copy[missingCol] !== undefined) delete copy[missingCol];
        return copy;
      },
    });

    for (const fb of fallbacks) {
      try {
        const attemptPayload = fb.mapper(sanitized);
        const r = await attemptUpdate(attemptPayload);
        if (!r.error) {
          return { data: (r.data as Product) ?? null, error: null };
        }
      } catch (err) {}
    }
  }

  return {
    data: null,
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status,
    },
  };
};

export const deleteProduct = async (
  id: string,
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase.from("products").delete().eq("id", id);
  return { data, error };
};

export const uploadImage = async (
  file: File,
): Promise<{ url: string | null; error: any }> => {
  try {
    // Use API route for server-side upload with service role key
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return { url: data.imageId || data.url, error: null };
  } catch (error: any) {
    console.error("Image upload failed:", error);
    return { url: null, error };
  }
};

export const findProductByName = async (
  name: string,
  excludeId?: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const trimmedName = name.trim().toLowerCase();
    let query = supabase
      .from("products")
      .select("*")
      .ilike("name", trimmedName);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: (data as Product) ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const findProductByBarcode = async (
  barcode: string,
  excludeId?: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    if (!barcode || barcode.trim() === "") {
      return { data: null, error: null };
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode.trim());

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: (data as Product) ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const checkDuplicateProduct = async (
  name: string,
  barcode?: string,
  excludeId?: string,
): Promise<{
  data: any | null;
  error: any;
  duplicateType?: "name" | "barcode";
}> => {
  try {
    const nameCheck = await findProductByName(name, excludeId);
    if (nameCheck.error) {
      return { data: null, error: nameCheck.error };
    }
    if (nameCheck.data) {
      return { data: nameCheck.data, error: null, duplicateType: "name" };
    }

    if (barcode && barcode.trim() !== "") {
      const barcodeCheck = await findProductByBarcode(barcode, excludeId);
      if (barcodeCheck.error) {
        return { data: null, error: barcodeCheck.error };
      }
      if (barcodeCheck.data) {
        return {
          data: barcodeCheck.data,
          error: null,
          duplicateType: "barcode",
        };
      }
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateProductStock = async (
  productId: string,
  additionalQuantity: number,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: product, error: fetchError } = await getProductById(
      productId.toString(),
    );

    if (fetchError || !product) {
      return {
        data: null,
        error: fetchError || { message: "Product not found" },
      };
    }

    const currentStock = (product as any).quantity || 0;
    const newStock = currentStock + additionalQuantity;

    if (newStock < 0) {
      return {
        data: null,
        error: { message: "Stock cannot be negative", code: "INVALID_STOCK" },
      };
    }

    const { data, error } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: (data as Product) ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string | string[];
  sub_category_id?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  out_of_stock?: boolean;
  is_visible?: boolean;
  is_custom_design?: boolean;
  colors?: string[];
  sort_by?: string;
}

export const getProductsPaginated = async (
  filters: ProductFilters
): Promise<{ data: Product[]; count: number; error: any }> => {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("products")
      .select("*, product_variants(*), categories:category_id(id, name), sub_category:sub_category_id(id, name)", { count: "exact" });

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      const stem = q.endsWith("s") ? q.slice(0, -1) : q;
      
      // Find matching categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", `%${stem}%`);
        
      if (cats && cats.length > 0) {
        const matchingCategoryIds = cats.map(c => c.id);
        query = query.or(`name.ilike.%${stem}%,category_id.in.(${matchingCategoryIds.join(',')})`);
      } else {
        query = query.ilike("name", `%${stem}%`);
      }
    }

    if (filters.category_id) {
       const ids = Array.isArray(filters.category_id) ? filters.category_id : [filters.category_id];
       // Filter out empty or invalid IDs to prevent SQL errors
       const validIds = ids.filter(id => id && id.length > 0);
       
       if (validIds.length > 0) {
         // PostgREST "in" filter with comma separated values inside parens
         // We do NOT quote them for UUIDs in standard usage, although some clients match string behaviors.
         // If quoting broke it, we revert.
         const idStr = `(${validIds.join(',')})`;
         
         console.log("🔍 Filtering by Categories:", idStr);
         query = query.or(`category_id.in.${idStr},sub_category_id.in.${idStr}`);
       }
    }

    // Price Filter
    if (filters.price_min !== undefined) {
      query = query.gte("price", filters.price_min);
    }
    if (filters.price_max !== undefined) {
      query = query.lte("price", filters.price_max);
    }

    // Stock Filter
    if (filters.in_stock) {
      query = query.gt("stock_quantity", 0);
    }
    if (filters.out_of_stock) {
      query = query.lte("stock_quantity", 0);
    }

    // Custom Design Filter
    if (filters.is_custom_design !== undefined) {
      query = query.eq("is_custom_design", filters.is_custom_design);
    }
    
    // Visibility Filter
    if (filters.is_visible !== undefined) {
      query = query.eq("is_visible", filters.is_visible);
    }
    
    // Color Filter
    if (filters.colors && filters.colors.length > 0) {
      query = query.overlaps("colors", filters.colors);
    }

    // Sort
    switch (filters.sort_by) {
      case "latest":
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "name-asc":
        query = query.order("name", { ascending: true });
        break;
      case "name-desc":
        query = query.order("name", { ascending: false });
        break;
      case "price-asc":
      case "price-low":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
      case "price-high":
        query = query.order("price", { ascending: false });
        break;
      case "popularity":
        query = query.order("is_featured", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false }); // Default to latest
    }

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching paginated products:", error);
        return { data: [], count: 0, error };
    }

    // Map and normalize
    const mapped = (data || []).map((p: any) => ({
      ...p,
        isFeatured: p.is_featured ?? p.isFeatured,
        isVisible: p.is_visible ?? p.isVisible ?? true,
        quantity: p.stock_quantity ?? 0,
        inStock: (p.stock_quantity ?? 0) > 0,
        in_stock: (p.stock_quantity ?? 0) > 0,
        categoryName: p.categories?.name || null,
        subCategoryName: p.sub_category?.name || null,
        variants: p.product_variants || [],
    }));

    return { data: mapped as Product[], count: count || 0, error: null };

  } catch (err) {
    console.error("Critical error in getProductsPaginated:", err);
    return { data: [], count: 0, error: err };
  }
};

// Service for storefront - legacy support
export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await getProducts();
    return (data || []) as Product[];
  },
  // Efficient featured query — fetches ONLY featured products, no full-table scan
  async getFeaturedEfficient(limit = 6): Promise<Product[]> {
    let { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, original_price, images, stock_quantity, is_featured, category_id, categories:category_id(id, name)")
      .eq("is_featured", true)
      .eq("is_visible", true)
      .limit(limit)
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("getFeaturedEfficient error:", error.message);
      data = [];
    }

    let products = (data || []) as any[];

    // Pad with latest active products if count is less than limit
    if (products.length < limit) {
      const needed = limit - products.length;
      const existingIds = products.map((p) => p.id);

      let query = supabase
        .from("products")
        .select("id, name, slug, price, original_price, images, stock_quantity, is_featured, is_custom_design, category_id, categories:category_id(id, name)")
        .eq("is_visible", true)
        .limit(needed)
        .order("created_at", { ascending: false });

      // Hide custom designs from featured fallback by default
      query = query.eq("is_custom_design", false);

      if (existingIds.length > 0) {
        query = query.not("id", "in", `(${existingIds.join(",")})`);
      }

      const { data: fallbackData, error: fallbackError } = await query;
      if (!fallbackError && fallbackData) {
        products = [...products, ...fallbackData];
      }
    }

    return products.map((p) => ({
      ...p,
      in_stock: (p.stock_quantity ?? 0) > 0,
      inStock: (p.stock_quantity ?? 0) > 0,
    })) as unknown as Product[];
  },
  // Visible, non-custom products under the named top-level categories, newest
  // first. Categories are resolved by name at query time so the UI never
  // carries database ids that differ between environments.
  async getVisibleInTopCategories(categoryNames: string[]): Promise<Product[]> {
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .is("parent_id", null)
      .in("name", categoryNames);
    if (categoryError) {
      console.warn("getVisibleInTopCategories categories error:", categoryError.message);
      return [];
    }
    if (!categories?.length) return [];

    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, original_price, images, stock_quantity, is_featured, category_id, sub_category_id, created_at, categories:category_id(name)")
      .eq("is_visible", true)
      .not("is_custom_design", "is", true)
      .in("category_id", categories.map((c) => c.id))
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("getVisibleInTopCategories error:", error.message);
      return [];
    }

    return ((data || []) as any[]).map((p) => ({
      ...p,
      categoryName: p.categories?.name ?? undefined,
      in_stock: (p.stock_quantity ?? 0) > 0,
      inStock: (p.stock_quantity ?? 0) > 0,
    })) as unknown as Product[];
  },

  async getFeatured(): Promise<Product[]> {
    const { data } = await getProducts();
    return ((data || []) as Product[]).filter((p: any) => p.isFeatured);
  },
  // Exactly the products a cart, wishlist or checkout refers to. Those pages used
  // to look items up in a partial product list, so anything outside it vanished:
  // the cart deleted it and checkout priced it at ₹0. Errors throw, so a failed
  // request is never mistaken for "these products no longer exist".
  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from("products")
      .select("*, categories:category_id(id, name)")
      .in("id", ids)
      .eq("is_visible", true);
    if (error) throw error;
    return ((data || []) as any[]).map((p) => ({
      ...p,
      in_stock: (p.stock_quantity ?? 0) > 0,
      inStock: (p.stock_quantity ?? 0) > 0,
    })) as unknown as Product[];
  },

  async getById(id: string): Promise<Product | null> {
    const { data } = await getProductById(id);
    return data;
  },
  async getBySlug(slug: string): Promise<Product | null> {
    const { data } = await getProductBySlug(slug);
    return data;
  },
  async search(query: string): Promise<Product[]> {
    const { data } = await getProducts();
    if (!data) return [];
    const lowerQuery = query.toLowerCase();
    return (data as Product[]).filter(
      (p: any) =>
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery),
    );
  },
  async getPaginated(filters: ProductFilters) {
     return getProductsPaginated(filters);
  }
};
