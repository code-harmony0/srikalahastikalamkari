import { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"

export const metadata: Metadata = {
  title: "Shipping Policy | Shri Kalahasti Kalamkari",
  description:
    "Read our Shipping Policy for Srikalahasti Kalamkari products. Delivery times within India and order tracking.",
}

export const revalidate = 3600

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      <PageHero
        compact
        titleStart="Shipping"
        titleAccent="policy"
        description="Processing times, delivery within India and order tracking."
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="bg-white/95 dark:bg-[hsl(var(--brand-midnight))] rounded-xl border border-[hsl(var(--brand-gold)/0.25)] shadow-sm p-6 sm:p-8 md:p-12 backdrop-blur-sm">
          <p className="text-[hsl(var(--brand-ink-soft))] mb-6 font-sans text-[14px]">
            Last updated: September 2026
          </p>

          <div className="space-y-8 text-[hsl(var(--brand-ink))] max-w-[68ch]">
            <p className="font-inter text-[15px] leading-relaxed">
              At Srikalahasti Kalamkari, we take immense pride in ensuring that your handcrafted authentic pieces reach you safely and securely. Please read our shipping policy below.
            </p>

            <section>
              <h2 className="font-serif text-2xl text-[hsl(var(--brand-ink))] dark:text-white mb-4">
                Processing time
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Since all our products are handcrafted using traditional methods, processing time may vary. Custom orders or pre-orders will take longer as specified at the time of purchase.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[hsl(var(--brand-ink))] dark:text-white mb-4">
                Delivery within India
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We ship within India only, and delivery is free on every order. Delivery usually takes 5–7 business days from the date of dispatch.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[hsl(var(--brand-ink))] dark:text-white mb-4">
                Tracking your order
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Once your order is dispatched, you will receive an email notification containing your tracking details so you can monitor the delivery status.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[hsl(var(--brand-ink))] dark:text-white mb-4">
                Contact us
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  If you have any questions or concerns regarding your order's shipping status, please contact us at{" "}
                  <a
                    href="mailto:srikalahastikalamkari.sk@gmail.com"
                    className="font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--brand-ink))]"
                  >
                    srikalahastikalamkari.sk@gmail.com
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
