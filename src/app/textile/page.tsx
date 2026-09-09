import { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"

export const metadata: Metadata = {
  title: "Textile Care | Shri Kalahasti Kalamkari",
  description:
    "Learn how to care for your authentic Srikalahasti Kalamkari sarees, dupattas, and fabrics to preserve their beauty for generations.",
}

export const revalidate = 3600

export default function TextileCarePage() {
  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      <PageHero
        eyebrow="Preservation Guide"
        titleStart="Textile"
        titleAccent="care"
        titleEnd="Guide"
        description="Preserving your authentic handcrafted Kalamkari textiles and organic natural dyes for generations."
      />
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="bg-white/95 rounded-[14px] border border-[#C19A5B]/20 shadow-sm p-8 md:p-12 backdrop-blur-sm">

          <div className="space-y-8 text-[#1A1512]">
            <p className="font-inter text-[15px] leading-relaxed">
              Authentic Srikalahasti Kalamkari is a labor of love, crafted entirely by hand using natural dyes extracted from roots, leaves, and minerals. Because of these traditional organic processes, your Kalamkari pieces require gentle and specific care to maintain their vibrancy and longevity.
            </p>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                1. Washing Instructions
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Dry Clean Only:</strong> For the first few washes, we highly recommend professional dry cleaning to set the natural dyes and preserve the intricate hand-painted artwork.</li>
                  <li><strong>Subsequent Washes:</strong> If you choose to wash at home later, gently hand wash in cold water using a mild, pH-neutral detergent like baby shampoo. Do not soak the fabric.</li>
                  <li><strong>No Bleach or Harsh Chemicals:</strong> Never use bleach, harsh stain removers, or vigorous scrubbing, as natural dyes are delicate and will fade or run.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                2. Drying
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Dry in Shade:</strong> Always dry your Kalamkari textiles in the shade. Direct sunlight will cause the natural vegetable dyes to fade significantly.</li>
                  <li><strong>Avoid Wringing:</strong> Do not wring or twist the fabric to remove excess water. Instead, gently squeeze the water out or roll it in a clean, dry towel.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                3. Ironing
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Iron the fabric on the reverse side while it is slightly damp. Use a low to medium heat setting appropriate for cotton or silk, depending on the base fabric of your piece.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                4. Storage
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Store your Kalamkari sarees and fabrics wrapped in a pure cotton cloth or muslin bag to allow the natural fibers to breathe. Avoid storing them in plastic bags, which can trap moisture and damage the dyes. It is also good practice to periodically refold the textiles to prevent permanent creasing.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#1A1512] dark:text-white mb-4">
                Understanding Natural Dyes
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Please note that minor color bleeding during the first wash is a natural characteristic of authentic vegetable-dyed Kalamkari. This is not a defect, but a hallmark of the traditional, organic process used by our artisans.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
