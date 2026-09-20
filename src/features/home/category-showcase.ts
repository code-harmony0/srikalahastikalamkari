/**
 * Builds the home page category section from live data, so every count and
 * photo reflects what a shopper will actually find, and empty categories never
 * appear.
 */

export interface ShowcaseCategory {
  id: string
  name: string
  parent_id: string | null
  image_url: string | null
}

export interface ShowcaseProduct {
  category_id: string | null
  sub_category_id: string | null
  image: string | null
  created_at: string
}

export interface CategoryTile {
  id: string
  name: string
  count: number
  image: string | null
}

export interface FabricTile {
  name: string
  count: number
  image: string | null
}

const byCountThenName = (a: { count: number; name: string }, b: { count: number; name: string }) =>
  b.count - a.count || a.name.localeCompare(b.name)

const newestImage = (products: ShowcaseProduct[]) =>
  [...products]
    .filter((product) => product.image)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.image ?? null

export interface CategoryPhoto {
  count: number
  image: string | null
}

/**
 * A photo and product count for every category and sub-category, keyed by id.
 * The image the admin uploaded for the category wins; the newest product photo
 * only fills in when none was uploaded.
 */
export function buildCategoryPhotos(
  categories: ShowcaseCategory[],
  products: ShowcaseProduct[],
): Map<string, CategoryPhoto> {
  const photos = new Map<string, CategoryPhoto>()
  for (const category of categories) {
    const inCategory = products.filter((product) =>
      category.parent_id ? product.sub_category_id === category.id : product.category_id === category.id,
    )
    photos.set(category.id, {
      count: inCategory.length,
      image: category.image_url || newestImage(inCategory),
    })
  }
  return photos
}

export function buildCategoryShowcase(
  categories: ShowcaseCategory[],
  products: ShowcaseProduct[],
  { fabricParents, minFabricCount = 1 }: { fabricParents: string[]; minFabricCount?: number },
): { top: CategoryTile[]; fabrics: FabricTile[] } {
  const top = categories
    .filter((category) => !category.parent_id)
    .map((category) => {
      const inCategory = products.filter((product) => product.category_id === category.id)
      return {
        id: category.id,
        name: category.name,
        count: inCategory.length,
        // Category photos in the database are stock images; a real product photo wins.
        image: newestImage(inCategory) || category.image_url,
      }
    })
    .filter((tile) => tile.count > 0)
    .sort(byCountThenName)

  const parentIds = new Set(
    categories
      .filter((category) => !category.parent_id && fabricParents.includes(category.name))
      .map((category) => category.id),
  )

  // The same fabric can sit under more than one saree parent; show it once.
  const fabricsByName = new Map<string, { name: string; categories: ShowcaseCategory[]; products: ShowcaseProduct[] }>()
  for (const category of categories) {
    if (!category.parent_id || !parentIds.has(category.parent_id)) continue
    const name = category.name.trim()
    const key = name.toLowerCase()
    const entry = fabricsByName.get(key) ?? { name, categories: [], products: [] }
    entry.categories.push(category)
    entry.products.push(...products.filter((product) => product.sub_category_id === category.id))
    fabricsByName.set(key, entry)
  }

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

  const fabrics = [...fabricsByName.values()]
    .map((entry) => ({
      name: entry.name,
      count: entry.products.length,
      image: newestImage(entry.products) || entry.categories.find((category) => category.image_url)?.image_url || null,
    }))
    .filter((tile) => tile.count >= Math.max(1, minFabricCount))
    .sort((a, b) => {
      const iA = getSortIndex(a.name);
      const iB = getSortIndex(b.name);
      if (iA !== iB) return iA - iB;
      return b.count - a.count || a.name.localeCompare(b.name);
    });

  return { top, fabrics }
}
