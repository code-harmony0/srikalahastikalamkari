/**
 * Picks pieces for the home gallery so it shows the range of the workshop:
 * one of each kind of work in turn (newest first), not a wall of sarees.
 */

export interface GalleryCandidate {
  id: string
  categoryName?: string | null
  created_at?: string | null
  image: string | null
}

const time = (value?: string | null) => (value ? new Date(value).getTime() : 0)

export function pickGalleryPieces<T extends GalleryCandidate>(
  pieces: T[],
  { limit, exclude = [] }: { limit: number; exclude?: string[] },
): T[] {
  const skip = new Set(exclude)
  const byCategory = new Map<string, T[]>()

  for (const piece of [...pieces].sort((a, b) => time(b.created_at) - time(a.created_at))) {
    if (!piece.image || skip.has(piece.id)) continue
    const key = piece.categoryName || "Other"
    byCategory.set(key, [...(byCategory.get(key) ?? []), piece])
  }

  // The kinds of work the shop has most of lead (sarees before wall paintings).
  const queues = [...byCategory.values()].sort((a, b) => b.length - a.length)
  const picked: T[] = []
  while (picked.length < limit && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift()
      if (next) picked.push(next)
      if (picked.length === limit) break
    }
  }
  return picked
}
