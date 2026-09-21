/**
 * Single source of truth for store contact details so phone, email and
 * WhatsApp links stay consistent across every page.
 */

export const CONTACT = {
  // Srikalahasti Store & Workshop
  phones: ["+91 72888 48881", "+91 72888 48882", "+91 72888 48883"],
  // Tirupati Store
  tirupatiPhones: ["+91 70364 81999", "+91 70364 82999", "+91 70364 83999"],
  email: "srikalahastikalamkari.sk@gmail.com",
  whatsappNumber: "917288848881",
  gstin: "37EVOPS6191D1ZX",
  instagram: {
    handle: "@srikalahasti_kalamkari_offical",
    url: "https://www.instagram.com/srikalahasti_kalamkari_offical",
  },
  youtube: {
    url: "https://youtube.com/@srikalahastikalamkari-u4d?si=1_yYDVL677cYJrrn",
  },
  hours: { weekdays: "Mon – Sat: 10 AM – 8 PM", sunday: "Sunday: Closed" },
  addresses: {
    kalahasti: {
      name: "Srikalahasti (Store & Workshop)",
      street: "# 17-68, Bharathi Nagar, Tirupati Main Road, Near Railway Station",
      city: "Srikalahasti",
      pincode: "517640",
      full: "# 17-68, Bharathi Nagar, Tirupati Main Road, Near Railway Station, Srikalahasti-517640",
      mapUrl: "https://maps.app.goo.gl/Swct9jg3LUwAqvZP6?g_st=ic",
      phones: ["+91 72888 48881", "+91 72888 48882", "+91 72888 48883"],
    },
    tirupati: {
      name: "Tirupati Store",
      street: "# 6-8-1126, NGOs Colony, Opp: Balaji Silk Emporium, Revenue Ward No 6",
      city: "Tirupati",
      full: "# 6-8-1126, NGOs Colony, Opp: Balaji Silk Emporium, Revenue Ward No 6, Tirupati",
      phones: ["+91 70364 81999", "+91 70364 82999", "+91 70364 83999"],
    },
  },
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
