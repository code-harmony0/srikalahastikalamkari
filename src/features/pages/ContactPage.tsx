"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/shared/utils"
import { supabase } from "@/lib/supabase/client"
import { CONTACT, mailtoHref, telHref, whatsAppHref } from "@/shared/config/contact"

import { PageHero } from "@/components/layout/PageHero"

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

      toast.success("Message Sent! 🕊️", {
        description: "Thank you for reaching out. We will get back to you within 24 hours.",
      })

      setIsSuccess(true)
      form.reset()
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message", {
        description: error?.message || "Please try again later or reach out directly on WhatsApp.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-[#FCFBFA] dark:bg-[#0E0A08] text-[#1A1512] dark:text-neutral-100 selection:bg-[#C19A5B]/30 relative">
      {/* Subtle Ambient Heritage Light Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(193,154,91,0.08),transparent_70%)]" />

      {/* ─────────────────────────────────────────────
          1. HERO SECTION (Consistent Site-Wide PageHero)
      ────────────────────────────────────────────── */}
      <PageHero
        eyebrow="Connect With Us"
        titleStart="Get in"
        titleAccent="touch"
        description="We’d love to hear from you. Send us a message and our artisan studio will respond within 24 hours."
      />

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT (Clean, Focused Grid Layout)
      ────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1120px] mx-auto px-5 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Contact Information (5 of 12 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-4"
          >
            {/* WhatsApp Card */}
            <a
              href={whatsAppHref("Hello! I would like to inquire about authentic Srikalahasti Kalamkari.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16110E] border border-[#E8DDD1] dark:border-[#2D221A] hover:border-emerald-500/60 shadow-[0_2px_12px_rgba(26,21,18,0.03)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.1)] transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[#25D366] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-[11px] tracking-[0.16em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                    Instant WhatsApp
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="font-sans font-semibold text-[15px] text-[#1A1512] dark:text-white mt-0.5">
                  {CONTACT.phones[0]}
                </div>
                <p className="font-sans text-[12px] text-[#1A1512]/65 dark:text-neutral-400 mt-0.5">
                  Direct master artisan desk · Fast reply
                </p>
              </div>
            </a>

            {/* Direct Phone Numbers */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#16110E] border border-[#E8DDD1] dark:border-[#2D221A] hover:border-[#C19A5B]/60 shadow-[0_2px_12px_rgba(26,21,18,0.03)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] text-[#854D0E] dark:text-[#E2BD7A] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans font-bold text-[11px] tracking-[0.16em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                    Phone Helplines
                  </span>
                  <div className="mt-1.5 space-y-1">
                    {CONTACT.phones.map((phone, idx) => (
                      <div key={phone} className="flex items-center justify-between text-[14px]">
                        <a
                          href={telHref(phone)}
                          className="font-sans font-semibold text-[#1A1512] dark:text-white hover:text-[#854D0E] dark:hover:text-[#E2BD7A] transition-colors"
                        >
                          {phone}
                        </a>
                        {idx === 0 && (
                          <span className="text-[10px] uppercase font-bold text-[#854D0E] dark:text-[#E2BD7A] bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Email & GSTIN */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#16110E] border border-[#E8DDD1] dark:border-[#2D221A] hover:border-[#C19A5B]/60 shadow-[0_2px_12px_rgba(26,21,18,0.03)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] text-[#854D0E] dark:text-[#E2BD7A] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans font-bold text-[11px] tracking-[0.16em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                    Email & GSTIN
                  </span>
                  <a
                    href={mailtoHref()}
                    className="block font-sans font-semibold text-[14px] text-[#1A1512] dark:text-white hover:text-[#854D0E] dark:hover:text-[#E2BD7A] transition-colors break-all mt-1"
                  >
                    {CONTACT.email}
                  </a>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded bg-[#FBFAF8] dark:bg-[#201813] border border-[#EBE3D7] dark:border-[#33261D] text-[11.5px] font-medium text-[#1A1512]/80 dark:text-neutral-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#E2BD7A]" />
                    <span>GSTIN: {CONTACT.gstin}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Srikalahasti Studio */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#16110E] border border-[#E8DDD1] dark:border-[#2D221A] hover:border-[#C19A5B]/60 shadow-[0_2px_12px_rgba(26,21,18,0.03)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] text-[#854D0E] dark:text-[#E2BD7A] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-[11px] tracking-[0.16em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                      Srikalahasti Studio
                    </span>
                    <span className="text-[10px] font-bold text-[#854D0E] dark:text-[#E2BD7A] bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] px-2 py-0.5 rounded">
                      Workshop
                    </span>
                  </div>
                  <div className="font-sans font-semibold text-[14px] text-[#1A1512] dark:text-white mt-1">
                    #17-68, Bharathi Nagar
                  </div>
                  <p className="font-sans text-[13px] text-[#1A1512]/70 dark:text-neutral-400 leading-relaxed mt-0.5">
                    Tirupati Main Road, Near Railway Station, Srikalahasti, AP – 517640
                  </p>
                </div>
              </div>
            </div>

            {/* Tirupati Store */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#16110E] border border-[#E8DDD1] dark:border-[#2D221A] hover:border-[#C19A5B]/60 shadow-[0_2px_12px_rgba(26,21,18,0.03)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] text-[#854D0E] dark:text-[#E2BD7A] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-[11px] tracking-[0.16em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                      Tirupati Store
                    </span>
                    <span className="text-[10px] font-bold text-[#854D0E] dark:text-[#E2BD7A] bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] px-2 py-0.5 rounded">
                      Experience Store
                    </span>
                  </div>
                  <div className="font-sans font-semibold text-[14px] text-[#1A1512] dark:text-white mt-1">
                    #6-8-1126, NGOs Colony
                  </div>
                  <p className="font-sans text-[13px] text-[#1A1512]/70 dark:text-neutral-400 leading-relaxed mt-0.5">
                    Opp: Balaji Silk Emporium, Revenue Ward No 6, Tirupati
                  </p>
                  <a
                    href="https://maps.app.goo.gl/tABoSwfoUcmEQjgJA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-[#854D0E] dark:text-[#E2BD7A] hover:underline mt-2"
                  >
                    View on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#16110E] border border-[#E8DDD1] dark:border-[#2D221A] flex items-center gap-3.5 text-[13px] shadow-[0_2px_12px_rgba(26,21,18,0.02)]">
              <div className="w-10 h-10 rounded-xl bg-[#FBFAF8] dark:bg-[#251D16] border border-[#EADBCE] dark:border-[#3D2F22] flex items-center justify-center text-[#854D0E] dark:text-[#E2BD7A] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[#1A1512] dark:text-white">Studio Timings: </span>
                <span className="text-[#1A1512]/70 dark:text-neutral-400">
                  {CONTACT.hours.weekdays} · <strong className="font-semibold text-[#854D0E] dark:text-[#E2BD7A]">{CONTACT.hours.sunday}</strong>
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Contact Form (7 of 12 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-7 bg-white dark:bg-[#16110E] rounded-3xl shadow-[0_10px_36px_rgba(26,21,18,0.05)] dark:shadow-[0_12px_44px_rgba(0,0,0,0.5)] p-7 sm:p-9 md:p-10 border border-[#E8DDD1] dark:border-[#2D221A] relative"
          >
            {/* Form Title & Subtitle */}
            <div className="mb-7 pb-5 border-b border-[#E8DDD1] dark:border-[#2D221A]">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="h-px w-6 bg-[#C19A5B]" />
                <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                  Direct Atelier Inquiry
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1512] dark:text-white tracking-tight">
                Send us a Message
              </h2>
              <p className="font-sans text-[14px] text-[#1A1512]/70 dark:text-neutral-300 mt-1 leading-relaxed">
                Have questions about our authentic Kalamkari collections, custom bridal orders, or studio visits? Share your details and we will respond promptly.
              </p>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-4"
              >
                <div className="w-16 h-16 bg-[#FBFAF8] dark:bg-[#251D16] rounded-full flex items-center justify-center border-2 border-[#C19A5B] shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-[#854D0E] dark:text-[#E2BD7A]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1512] dark:text-white">
                  Message Sent Successfully
                </h3>
                <p className="font-sans text-[#1A1512]/70 dark:text-neutral-300 text-[15px] max-w-md leading-relaxed">
                  Thank you for reaching out to Srikalahasti Kalamkari. We have received your message and will get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 px-6 h-11 border border-[#E8DDD1] dark:border-[#2D221A] text-[#1A1512] dark:text-white hover:bg-[#FBFAF8] rounded-xl font-sans font-bold text-[12px] uppercase tracking-wider transition-all"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="block text-[11px] font-sans font-bold text-[#1A1512] dark:text-neutral-200 uppercase tracking-wider"
                    >
                      Full Name <span className="text-[#854D0E] dark:text-[#E2BD7A]">*</span>
                    </label>
                    <input
                      required
                      id="contact-name"
                      type="text"
                      name="name"
                      disabled={isSubmitting}
                      className="w-full px-4 h-12 rounded-xl border border-[#DFD6CA] dark:border-[#382C22] bg-[#FCFBFA] dark:bg-[#1E1713] text-[#1A1512] dark:text-white font-sans text-[14px] placeholder:text-[#1A1512]/40 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C19A5B]/25 focus:border-[#854D0E] focus:bg-white dark:focus:bg-[#251D17] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email"
                      className="block text-[11px] font-sans font-bold text-[#1A1512] dark:text-neutral-200 uppercase tracking-wider"
                    >
                      Email Address <span className="text-[#854D0E] dark:text-[#E2BD7A]">*</span>
                    </label>
                    <input
                      required
                      id="contact-email"
                      type="email"
                      name="email"
                      disabled={isSubmitting}
                      className="w-full px-4 h-12 rounded-xl border border-[#DFD6CA] dark:border-[#382C22] bg-[#FCFBFA] dark:bg-[#1E1713] text-[#1A1512] dark:text-white font-sans text-[14px] placeholder:text-[#1A1512]/40 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C19A5B]/25 focus:border-[#854D0E] focus:bg-white dark:focus:bg-[#251D17] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-phone"
                      className="block text-[11px] font-sans font-bold text-[#1A1512] dark:text-neutral-200 uppercase tracking-wider"
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      disabled={isSubmitting}
                      className="w-full px-4 h-12 rounded-xl border border-[#DFD6CA] dark:border-[#382C22] bg-[#FCFBFA] dark:bg-[#1E1713] text-[#1A1512] dark:text-white font-sans text-[14px] placeholder:text-[#1A1512]/40 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C19A5B]/25 focus:border-[#854D0E] focus:bg-white dark:focus:bg-[#251D17] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-subject"
                      className="block text-[11px] font-sans font-bold text-[#1A1512] dark:text-neutral-200 uppercase tracking-wider"
                    >
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      disabled={isSubmitting}
                      className="w-full px-4 h-12 rounded-xl border border-[#DFD6CA] dark:border-[#382C22] bg-[#FCFBFA] dark:bg-[#1E1713] text-[#1A1512] dark:text-white font-sans text-[14px] placeholder:text-[#1A1512]/40 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C19A5B]/25 focus:border-[#854D0E] focus:bg-white dark:focus:bg-[#251D17] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      placeholder="Order Inquiry / Custom Request"
                    />
                  </div>
                </div>

                {/* Row 3: Message */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="block text-[11px] font-sans font-bold text-[#1A1512] dark:text-neutral-200 uppercase tracking-wider"
                  >
                    Your Message <span className="text-[#854D0E] dark:text-[#E2BD7A]">*</span>
                  </label>
                  <textarea
                    required
                    id="contact-message"
                    name="message"
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full p-4 rounded-xl border border-[#DFD6CA] dark:border-[#382C22] bg-[#FCFBFA] dark:bg-[#1E1713] text-[#1A1512] dark:text-white font-sans text-[14px] placeholder:text-[#1A1512]/40 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C19A5B]/25 focus:border-[#854D0E] focus:bg-white dark:focus:bg-[#251D17] transition-all resize-none min-h-[120px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] leading-relaxed"
                    placeholder="Describe your query, fabric preference, custom requirement, or visit schedule..."
                  />
                </div>

                {/* Artisan Assurance Note */}
                <div className="flex items-center gap-2 text-xs text-[#854D0E] dark:text-[#E2BD7A] pt-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Our studio team responds within 24 hours (usually within 2 hours during studio hours).</span>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ color: "#ffffff" }}
                    className="w-full sm:w-auto min-w-[200px] h-12 px-8 bg-gradient-to-r from-[#1A1512] via-[#2D1F17] to-[#1A1512] hover:from-[#854D0E] hover:to-[#A16207] text-white !text-white font-sans font-bold text-[12px] uppercase tracking-[0.18em] rounded-xl shadow-[0_4px_14px_rgba(26,21,18,0.2)] hover:shadow-[0_6px_20px_rgba(193,154,91,0.3)] transition-all duration-300 flex items-center justify-center gap-2.5 group border border-[#C19A5B]/40 hover:border-[#C19A5B] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="text-white !text-white font-bold" style={{ color: "#ffffff" }}>
                        Sending Message...
                      </span>
                    ) : (
                      <>
                        <span className="text-white !text-white font-bold" style={{ color: "#ffffff" }}>
                          Send Message
                        </span>
                        <Send className="w-4 h-4 text-[#E2BD7A] group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

