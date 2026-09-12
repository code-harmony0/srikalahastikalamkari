import { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { CONTACT, mailtoHref, telHref } from "@/shared/config/contact"

// Kept at /returns: Razorpay's merchant checks look for a published refund and
// cancellation policy. The business does not offer returns or refunds, so the
// page says exactly that.
export const metadata: Metadata = {
  title: "Refund Policy | Shri Kalahasti Kalamkari",
  description:
    "Srikalahasti Kalamkari refund policy. All sales are final: we do not accept returns or exchanges, and we do not issue refunds.",
}

export const revalidate = 3600

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-[hsl(var(--brand-ink))]">
      <PageHero
        compact
        titleStart="Refund"
        titleAccent="policy"
        description="All sales are final."
      />
      <div className="mx-auto max-w-[68ch] px-4 py-10 sm:px-6 md:py-14">
        <p className="text-[13px] text-[hsl(var(--brand-ink)/0.55)]">
          Last updated: September 2026
        </p>

        <div className="mt-6 space-y-9 text-[15px] leading-[1.75] text-[hsl(var(--brand-ink)/0.85)]">
          <section>
            <h2 className="font-serif text-[22px] font-semibold leading-snug text-[hsl(var(--brand-ink))]">
              No returns, exchanges or refunds
            </h2>
            <p className="mt-3">
              All sales are final. We do not accept returns or exchanges, and we
              do not issue refunds or replacements for any order.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-[22px] font-semibold leading-snug text-[hsl(var(--brand-ink))]">
              Cancellations
            </h2>
            <p className="mt-3">
              Orders are paid online at checkout. Because we do not issue
              refunds, an order cannot be cancelled once payment has been made.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-[22px] font-semibold leading-snug text-[hsl(var(--brand-ink))]">
              Hand-painted variation
            </h2>
            <p className="mt-3">
              Every piece is painted by hand with natural dyes, so small
              differences in motif, tone and texture from the photographs are
              part of the craft.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-[22px] font-semibold leading-snug text-[hsl(var(--brand-ink))]">
              Questions before you buy
            </h2>
            <p className="mt-3">
              To check a colour, size or detail before you order, email{" "}
              <a
                href={mailtoHref()}
                className="font-medium text-[hsl(var(--brand-ink))] underline underline-offset-4"
              >
                {CONTACT.email}
              </a>{" "}
              or call{" "}
              <a
                href={telHref(CONTACT.phones[0])}
                className="font-medium tabular-nums text-[hsl(var(--brand-ink))] underline underline-offset-4"
              >
                {CONTACT.phones[0]}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
