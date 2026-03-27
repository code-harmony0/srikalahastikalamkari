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

  const ContactCard = ({ icon: Icon, title, content, subContent }: any) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex gap-4 p-6 bg-[#FFF9F4] rounded-[12px] border border-transparent hover:border-[#EAD6C3] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(179,94,46,0.08)] transition-all duration-300 group h-full"
    >
      <div className="shrink-0 mt-1">
        <Icon
          className="w-6 h-6 text-[#B35E2E] group-hover:scale-110 transition-transform duration-300"
          strokeWidth={1.5}
        />
      </div>
      <div>
        <h3 className="font-playfair font-bold text-[#3B2C23] text-[17px] mb-1 leading-tight">
          {title}
        </h3>
        <p className="font-inter text-[#3B2C23] text-[15px] font-medium leading-snug">
          {content}
        </p>
        {subContent && (
          <p className="font-inter text-[#7A6A5C] text-[13px] mt-1.5 leading-relaxed">
            {subContent}
          </p>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      {/* ─────────────────────────────────────────────
          1. HERO SECTION (Clean Ivory Standard)
          Matches Cart & Profile Headers
      ────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden h-[160px] md:h-[220px] bg-[#FAF3EC] border-b border-[#EAD6C3]/60 shadow-[inset_0_-1px_0_rgba(0,0,0,0.02)]">
        {/* Subtle Warmth Hint */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#E8C3A2]/10 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-2xl mx-auto"
        >
          {/* Icon - Clean Terracotta */}
          <div className="mb-4">
            <MessageSquare
              className="w-8 h-8 md:w-9 md:h-9 text-[#B35E2E]"
              strokeWidth={1.5}
            />
          </div>

          {/* Title - Dark Brown Playfair */}
          <h1 className="font-playfair text-[32px] md:text-[48px] font-bold text-[#3B2C23] tracking-wide leading-tight mb-2">
            Get in Touch
          </h1>

          {/* Subtitle - Muted Inter */}
          <p className="font-inter text-[#7A6A5C] text-[14px] md:text-[16px] font-normal tracking-wide leading-relaxed max-w-[640px]">
            We’d love to hear from you. Send us a message and we'll respond
            within 24 hours.
          </p>

          {/* Minimal Accent Underline */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 40, opacity: 0.9 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-[2px] bg-[#C46C3B] mt-4 rounded-full"
          />
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
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase text-[#B35E2E] hover:text-[#3B2C23] transition-colors mt-1"
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
          </motion.div>

          {/* RIGHT: Contact Form (60%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.06)] p-8 md:p-12 border border-[#E7E0D8]"
          >
            <div className="mb-8 pb-4 border-b border-[#E7E0D8]/60">
              <h2 className="font-playfair text-2xl font-bold text-[#3B2C23] mb-1">
                Send us a Message
              </h2>
              <div className="h-[2px] w-12 bg-[#B35E2E]/20 mt-2 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-inter font-semibold text-[#3B2C23]/80 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    className="w-full px-3.5 h-[48px] rounded-[6px] border border-[#E7E0D8] text-[#3B2C23] focus:outline-none focus:border-[#B35E2E] focus:ring-1 focus:ring-[#B35E2E]/20 transition-all placeholder:text-[#B7AFA7] font-inter text-[15px]"
                    placeholder="Your Full Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-inter font-semibold text-[#3B2C23]/80 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    className="w-full px-3.5 h-[48px] rounded-[6px] border border-[#E7E0D8] text-[#3B2C23] focus:outline-none focus:border-[#B35E2E] focus:ring-1 focus:ring-[#B35E2E]/20 transition-all placeholder:text-[#B7AFA7] font-inter text-[15px]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-inter font-semibold text-[#3B2C23]/80 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3.5 h-[48px] rounded-[6px] border border-[#E7E0D8] text-[#3B2C23] focus:outline-none focus:border-[#B35E2E] focus:ring-1 focus:ring-[#B35E2E]/20 transition-all placeholder:text-[#B7AFA7] font-inter text-[15px]"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-inter font-semibold text-[#3B2C23]/80 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    className="w-full px-3.5 h-[48px] rounded-[6px] border border-[#E7E0D8] text-[#3B2C23] focus:outline-none focus:border-[#B35E2E] focus:ring-1 focus:ring-[#B35E2E]/20 transition-all placeholder:text-[#B7AFA7] font-inter text-[15px]"
                    placeholder="Order Inquiry / Custom Request"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-inter font-semibold text-[#3B2C23]/80 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full p-3.5 rounded-[6px] border border-[#E7E0D8] text-[#3B2C23] focus:outline-none focus:border-[#B35E2E] focus:ring-1 focus:ring-[#B35E2E]/20 transition-all placeholder:text-[#B7AFA7] font-inter text-[15px] resize-none min-h-[140px]"
                  placeholder="How can we help you today?"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 h-[48px] bg-[#B35E2E] text-white rounded-[6px] font-inter font-medium text-[16px] hover:bg-[#964B22] shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
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
