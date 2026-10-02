/** @jest-environment node */
import {
  hashAdminPassword,
  verifyAdminPassword,
} from "@/shared/lib/admin-password"

describe("admin password verifier", () => {
  it("accepts the original password and rejects a different one", async () => {
    const verifier = await hashAdminPassword("temporary-password-123")

    await expect(verifyAdminPassword("temporary-password-123", verifier)).resolves.toBe(true)
    await expect(verifyAdminPassword("temporary-password-124", verifier)).resolves.toBe(false)
  })

  it("fails closed for a malformed verifier", async () => {
    await expect(verifyAdminPassword("temporary-password-123", "plain-text-password")).resolves.toBe(false)
  })
})
