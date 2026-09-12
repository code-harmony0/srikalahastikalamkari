/**
 * Everything the homepage says about sarees is derived here from the live
 * catalogue — the newest pieces, the fabric collections worth a tile, the
 * starting price — so none of it can drift into a hardcoded claim again.
 */

export interface ShowcaseSaree {
  id: string
  price?: number | null
  sub_category_id?: string | null
  created_at?: string | null
  is_featured?: boolean | null
}

export interface ShowcaseSubCategory {
  id: string
  name: string
}

export interface ShowcaseCollection<T extends ShowcaseSaree> {
  id: string
  /** The catalogue name, kept intact because the shop filter matches on it. */
  name: string
  /** The name without a trailing "saree(s)", for tiles already reading "N sarees". */
  label: string
  count: number
  cover: T
}

export interface SareeShowcase<T extends ShowcaseSaree> {
  newest: T[]
  collections: ShowcaseCollection<T>[]
  startingPrice: number | null
  total: number
}

export interface SareeShowcaseOptions {
  newestLimit?: number
  collectionLimit?: number
  /** A collection with fewer sarees than this reads as empty once tapped. */
  minPerCollection?: number
}

const DEFAULTS: Required<SareeShowcaseOptions> = {
  newestLimit: 8,
  collectionLimit: 4,
  minPerCollection: 5,
}

const timestamp = (saree: ShowcaseSaree) => Date.parse(saree.created_at ?? "") || 0

const tileLabel = (name: string) => name.replace(/\s+sarees?\s*$/i, "").trim() || name

export function buildSareeShowcase<T extends ShowcaseSaree>(
  sarees: T[],
  subCategories: ShowcaseSubCategory[],
  options: SareeShowcaseOptions = {},
): SareeShowcase<T> {
  const { newestLimit, collectionLimit, minPerCollection } = {
    ...DEFAULTS,
    ...options,
  }

  const byNewest = [...sarees].sort((a, b) => timestamp(b) - timestamp(a))
  // Sarees marked Featured in the admin panel lead the homepage row, newest first
  // within each group (sort is stable). Collections and covers stay by date.
  const featuredFirst = [...byNewest].sort(
    (a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)),
  )

  const prices = sarees
    .map((saree) => saree.price)
    .filter((price): price is number => typeof price === "number" && price > 0)

  const namesById = new Map(subCategories.map((sub) => [sub.id, sub.name]))
  const groups = new Map<string, { name: string; items: T[] }>()
  for (const saree of byNewest) {
    const name = saree.sub_category_id && namesById.get(saree.sub_category_id)
    if (!saree.sub_category_id || !name) continue
    const group = groups.get(saree.sub_category_id)
    if (group) group.items.push(saree)
    else groups.set(saree.sub_category_id, { name, items: [saree] })
  }

  const collections = [...groups]
    .filter(([, group]) => group.items.length >= minPerCollection)
    .map(([id, group]) => ({
      id,
      name: group.name,
      label: tileLabel(group.name),
      count: group.items.length,
      cover: group.items[0],
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, collectionLimit)

  return {
    newest: featuredFirst.slice(0, newestLimit),
    collections,
    startingPrice: prices.length ? Math.min(...prices) : null,
    total: sarees.length,
  }
}
