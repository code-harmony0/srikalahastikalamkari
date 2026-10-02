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

function safeEqual(left, right) {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index]
  }
  return mismatch === 0
}

function base64ToBytes(value) {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function verifyAdminPassword(password, encoded) {
  const [scheme, iterationsText, saltText, hashText] = encoded.split("$")
  const iterations = Number(iterationsText)
  if (scheme !== "pbkdf2" || !Number.isSafeInteger(iterations) || iterations < 100000 || !saltText || !hashText) return false

  try {
    const actual = await deriveHash(password, base64ToBytes(saltText), iterations)
    return safeEqual(actual, base64ToBytes(hashText))
  } catch (e) {
    console.error(e)
    return false
  }
}

async function run() {
  const hash = "pbkdf2$210000$11ktv9xN9DiEP89p2WJ8ew==$QJn8951QQTRE+U+sp3MjezRB7h1hojoub2Hc/xMgVU8="
  const pass = "123@Password"
  console.log("Valid:", await verifyAdminPassword(pass, hash))
}

run()
