import { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"

export const metadata: Metadata = {
  title: "Shipping Policy | Shri Kalahasti Kalamkari",
  description:
    "Read our Shipping Policy for Srikalahasti Kalamkari products. Information on delivery times, international shipping, and tracking.",
}

export const revalidate = 3600

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      <PageHero
        compact
        eyebrow="Delivery Information"
        titleStart="Shipping"
        titleAccent="policy"
        description="Detailed information on processing timelines, domestic dispatches, and international delivery."
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="bg-white/95 dark:bg-[#1E1510] rounded-xl border border-[hsl(var(--brand-gold)/0.25)] shadow-sm p-6 sm:p-8 md:p-12 backdrop-blur-sm">
          <p className="text-[hsl(var(--brand-gold-deep))] dark:text-[hsl(var(--brand-gold))] mb-6 font-sans text-xs font-bold uppercase tracking-wider">
            Last updated: November 2025
          </p>

          <div className="space-y-8 text-[#1A1512] max-w-[68ch]">
            <p className="font-inter text-[15px] leading-relaxed">
              At Srikalahasti Kalamkari, we take immense pride in ensuring that your handcrafted authentic pieces reach you safely and securely. Please read our shipping policy below.
            </p>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                1. Processing Time
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Since all our products are handcrafted using traditional methods, processing time may vary. Ready-to-ship items are typically dispatched within 2-4 business days. Custom orders or pre-orders will take longer as specified at the time of purchase.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                2. Domestic Shipping
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We offer standard and expedited shipping options within India. Standard shipping usually takes 5-7 business days from the date of dispatch. Expedited shipping options will be displayed at checkout.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                3. International Shipping
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We proudly ship internationally to select countries. International shipping times range from 10-21 business days. Please note that customs duties, taxes, and import fees are the responsibility of the customer and are not included in the shipping cost.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                4. Tracking Your Order
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Once your order is dispatched, you will receive an email notification containing your tracking details so you can monitor the delivery status.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                5. Contact Us
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  If you have any questions or concerns regarding your order's shipping status, please contact us at{" "}
                  <a
                    href="mailto:srikalahastikalamkari.sk@gmail.com"
                    className="text-[hsl(var(--brand-gold-deep))] hover:underline"
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
