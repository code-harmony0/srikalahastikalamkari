/**
 * Resilient image upload utility for bulk imports.
 *
 * Features:
 *  - Exponential-backoff retry (3 attempts by default)
 *  - Concurrent upload slots (configurable, default 3)
 *  - Online/offline awareness — pauses when navigator.onLine is false
 *  - Progress callbacks per image
 */

import { uploadImage } from "@/services/products"

// ─── Retry with exponential backoff ─────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function uploadImageWithRetry(
  file: File,
  {
    maxRetries = 3,
    baseDelayMs = 1000,
  }: { maxRetries?: number; baseDelayMs?: number } = {},
): Promise<{ url: string; error: null } | { url: null; error: Error }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Wait for online before each attempt
    await waitForOnline()

    const { url, error } = await uploadImage(file)

    if (url && !error) {
      return { url, error: null }
    }

    if (attempt < maxRetries) {
      const waitMs = baseDelayMs * Math.pow(2, attempt - 1) // 1s, 2s, 4s
      console.warn(
        `⚠️ Upload attempt ${attempt}/${maxRetries} failed, retrying in ${waitMs}ms...`,
        error?.message || "Unknown error",
      )
      await delay(waitMs)
    } else {
      return {
        url: null,
        error: new Error(
          error?.message || "Upload failed after all retries",
        ),
      }
    }
  }

  // Should never reach here, but TypeScript wants it
  return { url: null, error: new Error("Upload failed") }
}

// ─── Concurrent upload pool ─────────────────────────────────────────────────

export interface UploadTask {
  file: File
  index: number
}

export interface UploadResult {
  index: number
  url: string | null
  error: Error | null
}

/**
 * Upload multiple images with controlled concurrency.
 * Returns results in the same order as the input array.
 */
export async function uploadImagesConcurrently(
  files: File[],
  {
    concurrency = 3,
    maxRetries = 3,
    onProgress,
    abortSignal,
  }: {
    concurrency?: number
    maxRetries?: number
    onProgress?: (completed: number, total: number, currentIndex: number) => void
    abortSignal?: { aborted: boolean }
  } = {},
): Promise<UploadResult[]> {
  const results: UploadResult[] = new Array(files.length)
  let completedCount = 0
  let nextIndex = 0

  const runNext = async (): Promise<void> => {
    while (nextIndex < files.length) {
      if (abortSignal?.aborted) return

      const currentIndex = nextIndex++
      const file = files[currentIndex]

      const { url, error } = await uploadImageWithRetry(file, { maxRetries })
      results[currentIndex] = {
        index: currentIndex,
        url,
        error,
      }

      completedCount++
      onProgress?.(completedCount, files.length, currentIndex)
    }
  }

  // Launch `concurrency` parallel workers
  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    () => runNext(),
  )
  await Promise.all(workers)

  return results
}

// ─── Online/offline detection ───────────────────────────────────────────────

/**
 * Returns a promise that resolves when the browser is online.
 * If already online, resolves immediately.
 */
export function waitForOnline(): Promise<void> {
  if (typeof navigator === "undefined" || navigator.onLine) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const handler = () => {
      window.removeEventListener("online", handler)
      resolve()
    }
    window.addEventListener("online", handler)
  })
}

/**
 * Hook-friendly online status listener.
 * Returns a cleanup function.
 */
export function onOnlineStatusChange(
  callback: (isOnline: boolean) => void,
): () => void {
  const onOnline = () => callback(true)
  const onOffline = () => callback(false)

  window.addEventListener("online", onOnline)
  window.addEventListener("offline", onOffline)

  return () => {
    window.removeEventListener("online", onOnline)
    window.removeEventListener("offline", onOffline)
  }
}

// ─── Import session persistence (localStorage) ─────────────────────────────

const IMPORT_SESSION_KEY = "bulk-import-session"

export interface ImportSession {
  sessionId: string
  startedAt: string
  completedRows: number[]
  failedRows: number[]
  /** Maps row number → array of already-uploaded Cloudflare image URLs */
  uploadedImages: Record<number, string[]>
}

export function saveImportSession(session: ImportSession) {
  try {
    localStorage.setItem(IMPORT_SESSION_KEY, JSON.stringify(session))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadImportSession(): ImportSession | null {
  try {
    const raw = localStorage.getItem(IMPORT_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ImportSession
  } catch {
    return null
  }
}

export function clearImportSession() {
  try {
    localStorage.removeItem(IMPORT_SESSION_KEY)
  } catch {
    // noop
  }
}
