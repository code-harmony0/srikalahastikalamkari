"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, ExternalLink, CheckCircle2, Loader2, Instagram } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/shared/utils"
import { supabase } from "@/lib/supabase/client"
import { CONTACT, mailtoHref, telHref, whatsAppHref } from "@/shared/config/contact"
import { CornerFlorals, TempleBellsDivider } from "@/shared/ui/heritage-ornaments"

// Colour roles as on the home page: charcoal text, midnight main button,
// white outline second button, gold for lines only, royal blue for focus rings.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
const primaryButton = `inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[hsl(var(--brand-midnight))] px-8 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] disabled:cursor-not-allowed disabled:bg-[hsl(var(--brand-midnight)/0.7)] ${focusRing}`
const secondaryButton = `inline-flex h-12 items-center justify-center rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-turmeric-tint))] ${focusRing}`
const textLink = `rounded-sm font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--brand-ink))] ${focusRing}`
const fieldClass =
  "w-full rounded-md border border-[hsl(var(--brand-ink)/0.25)] bg-white px-4 font-sans text-[15px] text-[hsl(var(--brand-ink))] transition-colors placeholder:text-[hsl(var(--brand-muted))] hover:border-[hsl(var(--brand-ink)/0.45)] focus:border-[hsl(var(--brand-ink)/0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] disabled:bg-[hsl(var(--brand-paper))]"
const labelClass = "mb-1.5 block font-sans text-[14px] font-medium text-[hsl(var(--brand-ink))]"

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

/** One row of the contact details panel: charcoal icon, short label, the details. */
function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-t border-[hsl(var(--brand-gold-ornament)/0.35)] py-5 first:border-t-0 first:pt-0 last:pb-0">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-[hsl(var(--brand-ink))]">
        {icon}
      </span>
      <div className="min-w-0 flex-1 font-sans">
        <h3 className="font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))]">{label}</h3>
        <div className="mt-1 text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">{children}</div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      name: (formData.get("name") as string)?.trim(),
      email: (formData.get("email") as string)?.trim(),
      phone: (formData.get("phone") as string)?.trim(),
      subject: (formData.get("subject") as string)?.trim() || "General Inquiry",
      message: (formData.get("message") as string)?.trim(),
    }

    try {
      const { error } = await (supabase as any)
        .from("contact_inquiries")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          status: "new",
        })

      if (error) throw error

      toast.success("Message sent", {
        description: "Thank you for writing to us. We will reply as soon as we can.",
      })

      setIsSuccess(true)
      form.reset()
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error("Your message could not be sent", {
        description: error?.message || "Please try again, or message us on WhatsApp.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]">
      {/* Page band: pale indigo, temple bells divider and corner temple drawings */}
      <section className="relative overflow-hidden border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))]">
        <CornerFlorals className="absolute left-2 top-3 h-14 w-14 opacity-70 md:left-4 md:h-24 md:w-24" />
        <CornerFlorals className="absolute bottom-3 right-2 hidden h-14 w-14 rotate-180 opacity-70 sm:block md:right-4 md:h-24 md:w-24" />
        <div className="relative mx-auto max-w-2xl px-6 py-10 text-center md:py-14">
          <h1 className="font-serif text-[32px] leading-tight md:text-[46px]">Contact us</h1>
          <TempleBellsDivider className="mt-3" />
          <p className="mx-auto mt-3 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))] md:text-[16px]">
            Call, WhatsApp or write to us. We are happy to help with orders, custom designs and visits.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6 md:py-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left: all contact details in one turmeric panel */}
          <section
            aria-labelledby="contact-details"
            className="rounded-sm border border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-turmeric-tint))] p-6 md:p-7 lg:col-span-5"
          >
            <h2 id="contact-details" className="font-serif text-[22px] leading-tight md:text-[26px]">
              Reach us
            </h2>
            <div className="mt-5 border-t border-[hsl(var(--brand-gold-ornament)/0.35)] pt-5">
              <InfoRow icon={<WhatsAppIcon className="h-5 w-5 text-[#1F7A4D]" />} label="WhatsApp">
                <p className="tabular-nums">{CONTACT.phones[0]}</p>
                <a
                  href={whatsAppHref("Hello! I would like to know more about Srikalahasti Kalamkari.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-[#1F7A4D] px-5 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#17603C]",
                    focusRing,
                  )}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </InfoRow>

              <InfoRow icon={<Phone className="h-5 w-5" />} label="Phone">
                <ul className="space-y-1">
                  {CONTACT.phones.map((phone) => (
                    <li key={phone}>
                      <a href={telHref(phone)} className={cn(textLink, "tabular-nums")}>
                        {phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </InfoRow>

              <InfoRow icon={<Mail className="h-5 w-5" />} label="Email">
                <a href={mailtoHref()} className={cn(textLink, "inline-block max-w-full break-all")}>
                  {CONTACT.email}
                </a>
                <p className="mt-2 text-[14px]">
                  GSTIN <span className="tabular-nums text-[hsl(var(--brand-ink))]">{CONTACT.gstin}</span>
                </p>
              </InfoRow>

              <InfoRow icon={<MapPin className="h-5 w-5" />} label="Srikalahasti Studio (workshop)">
                <p>
                  #17-68, Bharathi Nagar, Tirupati Main Road, Near Railway Station, Srikalahasti, AP – 517640
                </p>
              </InfoRow>

              <InfoRow icon={<MapPin className="h-5 w-5" />} label="Tirupati Store">
                <p>#6-8-1126, NGOs Colony, Opp: Balaji Silk Emporium, Revenue Ward No 6, Tirupati</p>
                <a
                  href="https://maps.app.goo.gl/tABoSwfoUcmEQjgJA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(textLink, "mt-2 inline-flex items-center gap-1.5 text-[14px]")}
                >
                  View on Google Maps
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </InfoRow>

              <InfoRow icon={<Clock className="h-5 w-5" />} label="Opening hours">
                <p>{CONTACT.hours.weekdays}</p>
                <p>{CONTACT.hours.sunday}</p>
              </InfoRow>

              <InfoRow icon={<Instagram className="h-5 w-5" />} label="Social Media">
                <p>Follow us for the latest collections and workshop updates.</p>
                <a
                  href="https://www.instagram.com/srikalahasti_kalamkari_offical"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(textLink, "mt-2 inline-flex items-center gap-1.5 text-[14px]")}
                >
                  @srikalahasti_kalamkari_offical
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </InfoRow>
            </div>
          </section>

          {/* Right: message form on a white panel */}
          <section
            aria-labelledby="contact-form-title"
            className="rounded-sm border border-[hsl(var(--brand-gold)/0.45)] bg-white p-6 sm:p-8 lg:col-span-7"
          >
            <h2 id="contact-form-title" className="font-serif text-[22px] leading-tight md:text-[26px]">
              Send us a message
            </h2>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
              Questions about a piece, a custom design or a visit? Write to us here.
            </p>

            <div className="mt-5 border-t border-[hsl(var(--brand-gold)/0.35)] pt-6">
              {isSuccess ? (
                <div role="status" className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="h-10 w-10 text-[hsl(var(--brand-ink))]" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="mt-4 font-serif text-[24px] leading-tight">Thank you, your message is sent</h3>
                  <p className="mt-2 max-w-md font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
                    We have your message and will reply as soon as we can.
                  </p>
                  <button type="button" onClick={() => setIsSuccess(false)} className={cn(secondaryButton, "mt-6")}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className={labelClass}>
                        Your name <span aria-hidden="true" className="text-[#8E2A1B]">*</span>
                      </label>
                      <input
                        required
                        id="contact-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        disabled={isSubmitting}
                        className={cn(fieldClass, "h-12")}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className={labelClass}>
                        Email <span aria-hidden="true" className="text-[#8E2A1B]">*</span>
                      </label>
                      <input
                        required
                        id="contact-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        disabled={isSubmitting}
                        className={cn(fieldClass, "h-12")}
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-phone" className={labelClass}>
                        Phone <span className="font-normal text-[hsl(var(--brand-ink-soft))]">(optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        inputMode="tel"
                        disabled={isSubmitting}
                        className={cn(fieldClass, "h-12")}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className={labelClass}>
                        Subject <span className="font-normal text-[hsl(var(--brand-ink-soft))]">(optional)</span>
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        name="subject"
                        disabled={isSubmitting}
                        className={cn(fieldClass, "h-12")}
                        placeholder="Order, custom design, visit"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className={labelClass}>
                      Message <span aria-hidden="true" className="text-[#8E2A1B]">*</span>
                    </label>
                    <textarea
                      required
                      id="contact-message"
                      name="message"
                      rows={5}
                      disabled={isSubmitting}
                      className={cn(fieldClass, "min-h-[140px] resize-y py-3 leading-relaxed")}
                      placeholder="Tell us what you are looking for"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-5">
                    <button type="submit" disabled={isSubmitting} className={cn(primaryButton, "w-full sm:w-auto")}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isSubmitting ? "Sending…" : "Send message"}
                    </button>
                    <p className="font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
                      We will reply by email or phone.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
