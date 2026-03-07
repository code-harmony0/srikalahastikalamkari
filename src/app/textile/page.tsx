import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Textile Care | Srikalahasti Kalamkari",
  description: "Learn how to care for your Kalamkari textiles and preserve their beauty for years to come",
};

export default function TextileCarePage() {
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="font-playfair text-4xl font-bold text-[#3B2C23] mb-6">
            Textile Care Instructions
          </h1>
          
          <div className="space-y-8 text-[#3B2C23]">
            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                General Care for Kalamkari Textiles
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Kalamkari is a traditional art form that uses natural dyes and meticulous hand-painting techniques. 
                  Proper care will ensure your Kalamkari pieces remain vibrant and beautiful for generations.
                </p>
                <div className="bg-[#FFF9F4] p-4 rounded-lg border border-[#EAD6C3]">
                  <p className="font-semibold text-[#B35E2E]">
                    💡 Golden Rule: Always treat your Kalamkari textiles as delicate artworks
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Washing Instructions
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-700 mb-2">❌ What to Avoid</h3>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      <li>Machine washing</li>
                      <li>Hot water</li>
                      <li>Harsh detergents</li>
                      <li>Bleaching</li>
                      <li>Dry cleaning</li>
                      <li>Vigorous scrubbing</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-700 mb-2">✅ Recommended Method</h3>
                    <ul className="list-disc list-inside space-y-1 text-green-600">
                      <li>Gentle hand wash in cold water</li>
                      <li>Mild, pH-neutral detergent</li>
                      <li>Separate wash (first few times)</li>
                      <li>Soak for max 5 minutes</li>
                      <li>Rinse thoroughly</li>
                      <li>Do not wring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Drying Instructions
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Proper drying is crucial to maintain the fabric's integrity and color vibrancy:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Best Method:</strong> Dry in shade on a flat surface</li>
                  <li><strong>Avoid:</strong> Direct sunlight (can cause fading)</li>
                  <li><strong>Avoid:</strong> Clothes dryer (heat can damage natural dyes)</li>
                  <li><strong>Tip:</strong> Use a clean, light-colored towel underneath to absorb excess moisture</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Ironing & Pressing
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Iron on medium heat setting</li>
                  <li>Iron on the reverse side of the fabric</li>
                  <li>Use a clean cloth between iron and fabric for extra protection</li>
                  <li>Avoid steam on heavily painted areas</li>
                  <li>For best results, iron while slightly damp</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Storage Tips
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Sarees & Dupattas</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Fold neatly and store in muslin cloth</li>
                      <li>Avoid plastic bags (can trap moisture)</li>
                      <li>Refold every 3-4 months to prevent crease lines</li>
                      <li>Add neem leaves for natural protection</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Wall Hangings & Paintings</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Display away from direct sunlight</li>
                      <li>Avoid humid areas</li>
                      <li>Dust gently with soft, dry cloth</li>
                      <li>Professional framing recommended for valuable pieces</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Stain Removal
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Act quickly and gently for best results:
                </p>
                <div className="bg-[#FFF9F4] p-4 rounded-lg border border-[#EAD6C3]">
                  <h3 className="font-semibold mb-2">Emergency Stain Guide:</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Food/Oil:</strong> Sprinkle talcum powder, let absorb, then gently brush off</li>
                    <li><strong>Dust:</strong> Shake gently, then use soft brush</li>
                    <li><strong>Water-based:</strong> Dab with clean white cloth (don't rub)</li>
                    <li><strong>Tough stains:</strong> Contact us for professional cleaning advice</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Professional Care
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  For valuable or antique Kalamkari pieces, we recommend:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Professional textile conservator for restoration</li>
                  <li>Museum-quality framing for display pieces</li>
                  <li>Climate-controlled storage for heirloom items</li>
                  <li>Regular professional cleaning for heavily used pieces</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Contact Us for Care Advice
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Each Kalamkari piece is unique and may have specific care requirements. 
                  If you have any questions about caring for your particular item, please don't hesitate to contact us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email: shrikalahastikalamkari@gmail.com</li>
                  <li>Phone: +91 72888 48881 / +91 72888 48882</li>
                  <li>Visit: # 17-68, Bharathi Nagar, Tirupati Main Road, Srikalahasti-517640</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
