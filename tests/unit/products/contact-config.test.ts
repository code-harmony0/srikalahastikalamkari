import { CONTACT, telHref, mailtoHref, whatsAppHref } from "@/shared/config/contact"

describe("contact helpers", () => {
  it("strips spacing from display numbers for tel: links", () => {
    expect(telHref("+91 72888 48881")).toBe("tel:+917288848881")
  })

  it("drops punctuation commonly used in phone formatting", () => {
    expect(telHref("(072888) 48-881")).toBe("tel:07288848881")
  })

  it("builds a mailto for the store email by default", () => {
    expect(mailtoHref()).toBe(`mailto:${CONTACT.email}`)
  })

  it("builds a plain WhatsApp link with no message", () => {
    expect(whatsAppHref()).toBe("https://wa.me/917288848881")
  })

  it("URL-encodes a WhatsApp prefilled message", () => {
    expect(whatsAppHref("Hello there")).toBe("https://wa.me/917288848881?text=Hello%20there")
  })

  it("formats Tirupati store phones correctly", () => {
    expect(telHref(CONTACT.tirupatiPhones[0])).toBe("tel:+917036481999")
    expect(CONTACT.addresses.tirupati.phones[0]).toBe("+91 70364 81999")
  })

  it("contains complete addresses for both stores", () => {
    expect(CONTACT.addresses.kalahasti.full).toContain("Near Railway Station, Srikalahasti-517640")
    expect(CONTACT.addresses.tirupati.full).toContain("Opp: Balaji Silk Emporium, Revenue Ward No 6, Tirupati")
  })
})
