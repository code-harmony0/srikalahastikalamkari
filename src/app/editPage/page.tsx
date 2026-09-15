"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { UserCog, Save, X, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/shared/utils"

// --- Types ---
import { useUserProfileStore } from "@/shared/user-profile-store"
import { PageHero } from "@/components/layout/PageHero"

// --- Helper Components ---

const FormSection = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="mb-10">
    <h3 className="font-playfair text-xl font-bold text-[hsl(var(--brand-ink))] mb-6 border-b border-[hsl(var(--brand-gold)/0.3)] pb-2">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
)

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  fullWidth = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean
}) => (
  <div className={cn("space-y-1.5", fullWidth && "md:col-span-2")}>
    <label className="block text-[13px] font-inter font-semibold text-[hsl(var(--brand-ink))] uppercase tracking-wider">
      {label} {required && <span className="text-[hsl(var(--brand-madder))]">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={cn(
        "w-full h-[48px] px-4 rounded-[6px] border bg-white/70 font-inter text-[15px] transition-all",
        "text-[hsl(var(--brand-ink))] placeholder:text-[hsl(var(--brand-muted))]",
        "focus:outline-none focus:border-[hsl(var(--brand-gold))] focus:ring-1 focus:ring-[hsl(var(--brand-gold)/0.2)]",
        disabled
          ? "bg-[hsl(var(--brand-ink)/0.05)] border-[hsl(var(--brand-ink)/0.1)] text-[hsl(var(--brand-ink-soft))] cursor-not-allowed"
          : "border-[hsl(var(--brand-gold)/0.2)]",
      )}
    />
  </div>
)

export default function EditProfilePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  const { profile, updateProfile } = useUserProfileStore()
  
  const [formData, setFormData] = useState({
    fullName: profile.name,
    email: profile.email,
    phone: profile.phone,
    addressLine1: profile.addressLine1 || profile.address.split(",")[0] || "",
    addressLine2: profile.addressLine2 || "",
    city: profile.city || "",
    state: profile.state || "",
    postalCode: profile.postalCode || "",
    country: profile.country || "India",
  })

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      updateProfile({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      })

      toast.success("Profile Updated Successfully", {
        description: "Your personal details have been saved.",
      })
      
      router.push("/profile")
    } catch (error) {
      toast.error("Failed to update profile")
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      {/* 🏛 Page Hero */}
      <PageHero
        eyebrow="Account Settings"
        titleStart="Edit"
        titleAccent="profile"
        description="Update your personal and delivery details."
      />

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT
      ────────────────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-6 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit}>
              {/* SECTION A: Personal Information */}
              <FormSection title="Personal Information">
                <InputField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  type="tel"
                />
                <InputField
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  type="email"
                  fullWidth
                />
              </FormSection>

              {/* SECTION B: Shipping Address */}
              <FormSection title="Shipping Address">
                <InputField
                  label="Address Line 1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                  fullWidth
                />
                <InputField
                  label="Address Line 2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  fullWidth
                />
                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="State / Province"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled
                />
              </FormSection>

              {/* ACTIONS */}
              <div className="pt-6 border-t border-[hsl(var(--brand-gold)/0.2)] flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                <Link href="/profile" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 h-[48px] rounded-[6px] border border-[hsl(var(--brand-gold)/0.3)] bg-white/40 text-[hsl(var(--brand-ink))] font-inter font-medium text-[15px] hover:bg-white hover:text-[hsl(var(--brand-ink))] hover:border-[hsl(var(--brand-gold)/0.5)] transition-all"
                  >
                    Cancel
                  </button>
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 h-[48px] bg-[hsl(var(--brand-midnight))] text-white rounded-[6px] font-inter font-medium text-[15px] hover:bg-[hsl(var(--brand-midnight-hover))] hover:text-white border border-[hsl(var(--brand-gold)/0.2)] shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>

              {/* TRUST SIGNAL */}
              <div className="mt-8 flex items-center justify-center gap-2 text-[hsl(var(--brand-ink-soft))]">
                <Lock className="w-3 h-3" />
                <span className="text-[12px] font-inter">
                  Your information is securely stored and never shared.
                </span>
              </div>
            </form>
          </motion.div>
      </div>
    </div>
  )
}
