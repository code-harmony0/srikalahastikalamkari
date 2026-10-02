const HASH_ALGORITHM = "SHA-256"
const ITERATIONS = 210_000

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function deriveHash(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: HASH_ALGORITHM, salt: salt as unknown as BufferSource, iterations },
    key,
    256,
  )
  return new Uint8Array(bits)
}

function safeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index]
  }
  return mismatch === 0
}

/** Stores a slow, salted password verifier; never persist a raw staff password. */
export async function hashAdminPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveHash(password, salt, ITERATIONS)
  return `pbkdf2$${ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`
}

export async function verifyAdminPassword(password: string, encoded: string): Promise<boolean> {
  const [scheme, iterationsText, saltText, hashText] = encoded.split("$")
  const iterations = Number(iterationsText)
  if (scheme !== "pbkdf2" || !Number.isSafeInteger(iterations) || iterations < 100_000 || !saltText || !hashText) return false

  try {
    const actual = await deriveHash(password, base64ToBytes(saltText), iterations)
    return safeEqual(actual, base64ToBytes(hashText))
  } catch {
    return false
  }
}
