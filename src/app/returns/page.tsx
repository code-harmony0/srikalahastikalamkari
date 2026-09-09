import { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"
import { CONTACT, mailtoHref, telHref } from "@/shared/config/contact"

export const metadata: Metadata = {
  title: "Return & Refund Policy | Shri Kalahasti Kalamkari",
  description:
    "Our Return & Refund Policy for Srikalahasti Kalamkari products. Return window, eligibility, exchange conditions, and refund timelines.",
}

export const revalidate = 3600

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      <PageHero
        compact
        eyebrow="Customer Protection"
        titleStart="Return &"
        titleAccent="refund"
        titleEnd="Policy"
        description="Clear, transparent terms on return windows, exchanges, and handcrafted authenticity."
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="bg-white/95 dark:bg-[#1E1510] rounded-xl border border-[hsl(var(--brand-gold)/0.25)] shadow-sm p-6 sm:p-8 md:p-12 backdrop-blur-sm">
          <p className="text-[hsl(var(--brand-gold-deep))] dark:text-[hsl(var(--brand-gold))] mb-6 font-sans text-xs font-bold uppercase tracking-wider">
            Last updated: September 2026
          </p>

          <div className="space-y-8 text-[#1A1512] max-w-[68ch]">
            <p className="font-inter text-[15px] leading-relaxed">
              Every Srikalahasti Kalamkari piece is hand-painted, so slight variations in motif,
              tone and texture are a mark of authenticity rather than a defect. We still want you
              to be completely happy with your purchase — the policy below explains how returns,
              exchanges and refunds work.
            </p>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                1. Return Window
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  You may request a return within <strong>7 days</strong> of delivery. Requests
                  raised after this window cannot be accepted. To start a return, contact us with
                  your order number and photographs of the item as received.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                2. Eligibility Conditions
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>To be eligible for a return, the item must be:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Unused, unwashed and free from stains, perfume or any odour</li>
                  <li>In its original condition with all tags and packaging intact</li>
                  <li>Accompanied by the original invoice or order confirmation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                3. Non-Returnable Items
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>The following cannot be returned or exchanged:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Custom, made-to-order and personalised designs</li>
                  <li>Fabric sold by the metre once it has been cut</li>
                  <li>Items marked as clearance or final sale</li>
                  <li>Products damaged through customer handling, washing or alteration</li>
                </ul>
                <p>
                  Minor irregularities in hand-painted motifs, natural dye tones and weave texture
                  are inherent to the craft and are not treated as defects.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                4. Damaged or Incorrect Items
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  If your order arrives damaged, defective or is not the item you ordered, notify
                  us within <strong>48 hours</strong> of delivery with unboxing photographs. We
                  will arrange a replacement or a full refund, including shipping charges, at no
                  cost to you.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                5. Exchanges
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Exchanges are offered on eligible items subject to availability. Because each
                  piece is handcrafted, an identical replacement may not always be in stock — in
                  that case we will offer an alternative design or a refund.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                6. Refund Process &amp; Timeline
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Once your returned item reaches us and passes quality inspection, your refund is
                  approved and processed within <strong>5–7 business days</strong>. The amount is
                  credited to your original payment method; depending on your bank or card issuer
                  it may take a further 5–10 business days to appear in your account.
                </p>
                <p>
                  Refunds are issued for the product value. Original shipping charges are
                  non-refundable except where the return is due to our error.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                7. Return Shipping
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  For change-of-mind returns, return shipping is arranged and paid for by the
                  customer. Please use a trackable service — we cannot process refunds for parcels
                  that do not reach us. For damaged, defective or incorrect items, we cover the
                  return shipping in full.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                8. Cancellations
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Orders can be cancelled free of charge any time before dispatch. Once an order
                  has been dispatched it must be handled through the return process above. Custom
                  and made-to-order pieces cannot be cancelled once production has begun.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                9. How to Raise a Return
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Email us at{" "}
                  <a href={mailtoHref()} className="inline-flex min-h-[44px] items-center text-[#C19A5B] hover:underline">
                    {CONTACT.email}
                  </a>{" "}
                  or call{" "}
                  <a href={telHref(CONTACT.phones[0])} className="inline-flex min-h-[44px] items-center text-[#C19A5B] hover:underline">
                    {CONTACT.phones[0]}
                  </a>{" "}
                  with your order number, the reason for the return and photographs of the item.
                  Our team will confirm eligibility and share the return address within 2 business
                  days.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
