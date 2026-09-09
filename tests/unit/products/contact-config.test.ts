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
})
