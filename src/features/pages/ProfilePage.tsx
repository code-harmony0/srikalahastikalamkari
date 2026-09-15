"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Edit2, Heart, LogOut, Mail, MapPin, Package, Phone, User } from "lucide-react"
import { cn } from "@/shared/utils"

import { useRouter } from "next/navigation"
import { useAuth } from "@/shared/contexts/AuthContext"
import { toast } from "sonner"

import { useUserProfileStore } from "@/shared/user-profile-store"
import { PageHero } from "@/components/layout/PageHero"

// Colour roles as on the home page: charcoal text, midnight main button,
// white outline second button, gold for lines only, royal blue for focus rings.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
const primaryButton = `inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--brand-midnight))] px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] ${focusRing}`
const secondaryButton = `inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white px-6 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-turmeric-tint))] ${focusRing}`
const panel = "rounded-sm border border-[hsl(var(--brand-gold)/0.45)] bg-white"

const navLinks = [
  { href: "/profile", icon: User, label: "My profile", active: true },
  { href: "/orders", icon: Package, label: "My orders", active: false },
  { href: "/wishlist", icon: Heart, label: "Wishlist", active: false },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user: firebaseUser, signOut } = useAuth()
  const { profile: user, updateProfile } = useUserProfileStore()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!firebaseUser) {
      router.push("/login")
      return
    }
    // Sync Firebase auth data into the profile store
    const updates: Record<string, string> = {}
    if (firebaseUser.phoneNumber && user.phone !== firebaseUser.phoneNumber)
      updates.phone = firebaseUser.phoneNumber
    if (firebaseUser.email && user.email !== firebaseUser.email)
      updates.email = firebaseUser.email
    if (Object.keys(updates).length > 0) updateProfile(updates)
  }, [firebaseUser])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out")
      router.push("/login")
    } catch (error) {
      toast.error("Could not sign out. Please try again.")
    }
  }

  const details = [
    { icon: User, label: "Full name", value: user.name },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Mobile number", value: user.phone },
    { icon: MapPin, label: "Delivery address", value: user.address },
  ]

  return (
    <div className="min-h-screen bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]">
      <PageHero
        titleStart="My"
        titleAccent="profile"
        description="Your details, orders and wishlist in one place."
      />

      <div className="mx-auto max-w-[1120px] px-4 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: who is signed in, and the account menu */}
          <div className="space-y-6">
            <section className={cn(panel, "p-6 text-center md:p-7")}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[hsl(var(--brand-gold-ornament))] bg-[hsl(var(--brand-indigo-tint))]">
                <User className="h-9 w-9 text-[hsl(var(--brand-ink))]" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-serif text-[22px] leading-tight">{user.name || "Welcome"}</h2>
              {user.email && (
                <p className="mt-1 break-all font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">{user.email}</p>
              )}
              <Link href="/editPage" className={cn(secondaryButton, "mt-5 w-full")}>
                <Edit2 className="h-4 w-4" aria-hidden="true" />
                Edit profile
              </Link>
            </section>

            <nav aria-label="Account" className={cn(panel, "p-2")}>
              <ul>
                {navLinks.map(({ href, icon: Icon, label, active }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-[48px] items-center gap-3 rounded-sm px-4 font-sans text-[15px] transition-colors",
                        focusRing,
                        active
                          ? "bg-[hsl(var(--brand-indigo-tint))] font-semibold"
                          : "hover:bg-[hsl(var(--brand-indigo-tint)/0.6)]",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      {label}
                      <ChevronRight className="ml-auto h-4 w-4 text-[hsl(var(--brand-ink-soft))]" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mx-4 my-1 h-px bg-[hsl(var(--brand-gold)/0.45)]" />
              <button
                type="button"
                onClick={handleSignOut}
                className={cn(
                  "flex min-h-[48px] w-full items-center gap-3 rounded-sm px-4 font-sans text-[15px] transition-colors hover:bg-[hsl(var(--brand-indigo-tint)/0.6)]",
                  focusRing,
                )}
              >
                <LogOut className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                Sign out
              </button>
            </nav>
          </div>

          {/* Right: details and orders */}
          <div className="space-y-8 lg:col-span-2">
            <section aria-labelledby="personal-details" className={cn(panel, "p-6 md:p-8")}>
              <h2 id="personal-details" className="font-serif text-[24px] leading-tight">
                Personal details
              </h2>
              <dl className="mt-5 grid grid-cols-1 border-t border-[hsl(var(--brand-gold)/0.35)] sm:grid-cols-2 sm:gap-x-8">
                {details.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex gap-3 border-b border-[hsl(var(--brand-gold-ornament)/0.3)] py-4"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <div className="min-w-0 font-sans">
                      <dt className="text-[14px] text-[hsl(var(--brand-ink-soft))]">{label}</dt>
                      <dd
                        className={cn(
                          "mt-0.5 break-words text-[15px]",
                          value ? "font-medium text-[hsl(var(--brand-ink))]" : "text-[hsl(var(--brand-muted))]",
                        )}
                      >
                        {value || "Not added yet"}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            <section
              aria-labelledby="your-orders"
              className="rounded-sm border border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-turmeric-tint))] p-6 md:p-8"
            >
              <h2 id="your-orders" className="font-serif text-[24px] leading-tight">
                Your orders
              </h2>
              <p className="mt-2 font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
                See what you have ordered and where each order is.
              </p>
              <Link href="/orders" className={cn(primaryButton, "mt-5")}>
                <Package className="h-4 w-4" aria-hidden="true" />
                View my orders
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
