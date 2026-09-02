/**
 * @jest-environment node
 *
 * The admin session guard is the only thing standing between the public
 * internet and the dashboard, so its failure modes are tested explicitly.
 */
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/shared/lib/admin-session"

const SECRET = "test-secret-that-is-at-least-32-characters-long"

describe("admin session tokens", () => {
  const originalSecret = process.env.ADMIN_SESSION_SECRET

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET
  })

  afterAll(() => {
    process.env.ADMIN_SESSION_SECRET = originalSecret
  })

  it("accepts a token it just issued", async () => {
    const token = await createAdminSessionToken(3600)
    const payload = await verifyAdminSessionToken(token)

    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe("admin")
  })

  it("rejects the forged cookie the old gate accepted", async () => {
    expect(await verifyAdminSessionToken("true")).toBeNull()
  })

  it("rejects a tampered payload", async () => {
    const token = await createAdminSessionToken(3600)
    const [, signature] = token.split(".")
    const forgedPayload = Buffer.from(
      JSON.stringify({ sub: "admin", iat: 0, exp: 9999999999 }),
    )
      .toString("base64url")

    expect(
      await verifyAdminSessionToken(`${forgedPayload}.${signature}`),
    ).toBeNull()
  })

  it("rejects a token signed with a different secret", async () => {
    const token = await createAdminSessionToken(3600)
    process.env.ADMIN_SESSION_SECRET = "another-secret-of-sufficient-length-32ch"

    expect(await verifyAdminSessionToken(token)).toBeNull()
  })

  it("rejects an expired token", async () => {
    const token = await createAdminSessionToken(-1)

    expect(await verifyAdminSessionToken(token)).toBeNull()
  })

  it("fails closed when no secret is configured", async () => {
    const token = await createAdminSessionToken(3600)
    delete process.env.ADMIN_SESSION_SECRET

    expect(await verifyAdminSessionToken(token)).toBeNull()
  })

  it("returns null rather than throwing on malformed input", async () => {
    for (const value of [undefined, null, "", "no-separator", "a.b.c"]) {
      expect(await verifyAdminSessionToken(value)).toBeNull()
    }
  })
})
