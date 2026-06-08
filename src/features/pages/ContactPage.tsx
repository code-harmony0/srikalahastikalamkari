"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/shared/utils"
import { supabase } from "@/lib/supabase/client"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Get form data
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
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
          status: 'new'
        })

      if (error) throw error

      (toast as any).success("Message Sent! 🕊️", {
        description: "We'll get back to you within 24 hours.",
      });
       console.log("Message Sent!");
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Error sending message:", error);
      (toast as any).error("Failed to send message", {
        description: error.message || "Please try again later.",
      });
      console.error("Failed to send message");
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
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )

  const ContactCard = ({ icon: Icon, title, content, subContent, whatsapp = false }: any) => (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "flex gap-4 p-6 rounded-[12px] transition-all duration-300 group h-full",
        whatsapp
          ? "bg-[#F0FDF4] border border-green-200/50 hover:border-green-300 hover:shadow-[0_4px_12px_rgba(22,163,74,0.06)]"
          : "bg-white border border-[#C19A5B]/20 hover:border-[#C19A5B]/50 hover:shadow-[0_4px_12px_rgba(193,154,91,0.06)]"
      )}
    >
      <div className="shrink-0 mt-1">
        <Icon
          className={cn(
            "w-6 h-6 group-hover:scale-110 transition-transform duration-300",
            whatsapp ? "text-[#25D366]" : "text-[#C19A5B]"
          )}
          strokeWidth={1.5}
        />
      </div>
      <div>
        <h3 className="font-serif font-bold text-[#1A1512] text-[17px] mb-1 leading-tight">
          {title}
        </h3>
        <div className="font-sans text-[#1A1512] text-[15px] font-medium leading-snug">
          {content}
        </div>
        {subContent && (
          <div className="font-sans text-[#1A1512]/60 text-[13px] mt-1.5 leading-relaxed">
            {subContent}
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      {/* ─────────────────────────────────────────────
          1. HERO SECTION (Premium Dark Charcoal Hero)
      ────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden h-[180px] md:h-[220px] bg-[#1A1512]">
        <div className="absolute inset-0 z-[6] pointer-events-none">
          <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-2xl mx-auto"
        >
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-[#C19A5B] mb-2">
            Connect With Us
          </span>

          <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-white tracking-wide leading-tight mb-2 uppercase">
            Get in <span className="italic text-[#C19A5B] font-normal lowercase">touch</span>
          </h1>

          <p className="font-sans text-white/70 text-[13px] md:text-[14px] font-light tracking-wide max-w-[600px] leading-relaxed">
            We’d love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT (Grid Layout)
      ────────────────────────────────────────────── */}
      <div className="max-w-[1080px] mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-10 items-start">
          {/* LEFT: Contact Information (40%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            <ContactCard
              icon={Phone}
              title="Cell Numbers"
              content="+91 72888 48881"
              subContent="+91 72888 48882, +91 72888 48883"
            />
            <ContactCard
              icon={Mail}
              title="Email & GSTIN"
              content="srikalahastikalamkari.sk@gmail.com"
              subContent="GSTIN: 37EVOPS6191D1ZX"
            />
            <ContactCard
              icon={MapPin}
              title="Our Studio"
              content="# 17-68, Bharathi Nagar"
              subContent={
                <div className="space-y-2">
                  <p>Tirupati Main Road, Near Railway Station, Srikalahasti-517640</p>
                  <a
                    href="https://maps.app.goo.gl/tABoSwfoUcmEQjgJA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase text-[#C19A5B] hover:text-[#1A1512] transition-colors mt-1"
                  >
                    Get Directions
                  </a>
                </div>
              }
            />
            <ContactCard
              icon={Clock}
              title="Business Hours"
              content="Mon – Sat: 10 AM – 8 PM"
              subContent="Sunday: Closed"
            />
            <a
              href="https://wa.me/917288848881"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <ContactCard
                icon={WhatsAppIcon}
                title="WhatsApp Us"
                content="+91 72888 48881"
                subContent="Typically replies within 1 hour"
                whatsapp
              />
            </a>
          </motion.div>

          {/* RIGHT: Contact Form (60%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.03)] p-8 md:p-12 border border-[#C19A5B]/20"
          >
            <div className="mb-8 pb-4 border-b border-[#C19A5B]/20">
              <h2 className="font-serif text-2xl font-bold text-[#1A1512] mb-1">
                Send us a Message
              </h2>
              <div className="h-[2px] w-12 bg-[#C19A5B]/30 mt-2 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans font-bold text-[#1A1512]/80 uppercase tracking-widest">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    className="w-full px-3.5 h-[48px] rounded-[4px] border border-[#C19A5B]/20 text-[#1A1512] focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/20 transition-all placeholder:text-[#1A1512]/40 font-sans text-[14px]"
                    placeholder="Your Full Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans font-bold text-[#1A1512]/80 uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    className="w-full px-3.5 h-[48px] rounded-[4px] border border-[#C19A5B]/20 text-[#1A1512] focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/20 transition-all placeholder:text-[#1A1512]/40 font-sans text-[14px]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans font-bold text-[#1A1512]/80 uppercase tracking-widest">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3.5 h-[48px] rounded-[4px] border border-[#C19A5B]/20 text-[#1A1512] focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/20 transition-all placeholder:text-[#1A1512]/40 font-sans text-[14px]"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans font-bold text-[#1A1512]/80 uppercase tracking-widest">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    className="w-full px-3.5 h-[48px] rounded-[4px] border border-[#C19A5B]/20 text-[#1A1512] focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/20 transition-all placeholder:text-[#1A1512]/40 font-sans text-[14px]"
                    placeholder="Order Inquiry / Custom Request"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-sans font-bold text-[#1A1512]/80 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full p-3.5 rounded-[4px] border border-[#C19A5B]/20 text-[#1A1512] focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/20 transition-all placeholder:text-[#1A1512]/40 font-sans text-[14px] resize-none min-h-[140px]"
                  placeholder="How can we help you today?"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 h-[48px] bg-[#1A1512] text-white hover:bg-[#C19A5B] rounded-[4px] font-sans font-bold text-[12px] uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && (
                    <Send className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
