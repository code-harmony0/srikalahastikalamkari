async function deriveHash(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt, iterations },
    key,
    256,
  )
  return new Uint8Array(bits)
}

function bytesToBase64(bytes) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value) {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index]
  }
  return mismatch === 0
}

async function hashAdminPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveHash(password, salt, 210000)
  return `pbkdf2$210000$${bytesToBase64(salt)}$${bytesToBase64(hash)}`
}

async function verifyAdminPassword(password, encoded) {
  const [scheme, iterationsText, saltText, hashText] = encoded.split("$")
  const iterations = Number(iterationsText)
  const actual = await deriveHash(password, base64ToBytes(saltText), iterations)
  return safeEqual(actual, base64ToBytes(hashText))
}

async function run() {
  const h = await hashAdminPassword("123@Password")
  console.log("Hash:", h)
  console.log("Valid:", await verifyAdminPassword("123@Password", h))
}
run()
