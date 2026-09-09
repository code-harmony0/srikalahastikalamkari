/**
 * Single source of truth for store contact details so phone, email and
 * WhatsApp links stay consistent across every page.
 */

export const CONTACT = {
  phones: ["+91 72888 48881", "+91 72888 48882", "+91 72888 48883"],
  email: "srikalahastikalamkari.sk@gmail.com",
  whatsappNumber: "917288848881",
  gstin: "37EVOPS6191D1ZX",
  hours: { weekdays: "Mon – Sat: 10 AM – 8 PM", sunday: "Sunday: Closed" },
} as const

/** Converts a display number like "+91 72888 48881" into a dialable tel: href. */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`
}

export function mailtoHref(email: string = CONTACT.email) {
  return `mailto:${email}`
}

export function whatsAppHref(message?: string) {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
