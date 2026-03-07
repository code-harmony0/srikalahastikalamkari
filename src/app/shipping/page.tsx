import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Srikalahasti Kalamkari",
  description: "Learn about our shipping policies and delivery timelines for Srikalahasti Kalamkari products",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="font-playfair text-4xl font-bold text-[#3B2C23] mb-6">
            Shipping Policy
          </h1>
          
          <div className="space-y-8 text-[#3B2C23]">
            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Domestic Shipping (India)
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  <strong>Standard Delivery:</strong> 5-7 business days
                </p>
                <p>
                  <strong>Express Delivery:</strong> 2-3 business days
                </p>
                <p>
                  <strong>Shipping Charges:</strong> Free shipping on orders above ₹2000. 
                  For orders below ₹2000, a nominal shipping fee of ₹100 will be applied.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                International Shipping
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  <strong>International Delivery:</strong> 10-15 business days
                </p>
                <p>
                  <strong>Shipping Charges:</strong> Calculated at checkout based on location and weight
                </p>
                <p>
                  <strong>Customs Duties:</strong> International customers may be responsible for customs duties and taxes as per their country's regulations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Order Processing
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  All orders are processed within 1-2 business days. You will receive a confirmation email 
                  once your order has been shipped with tracking details.
                </p>
                <p>
                  For custom orders or handcrafted pieces, processing time may vary. We will inform you 
                  about the expected timeline via email.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Shipping Partners
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We partner with reliable courier services including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>DTDC Express</li>
                  <li>Blue Dart</li>
                  <li>India Post (for remote locations)</li>
                  <li>FedEx (for international shipments)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Delivery Issues
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  If you face any issues with delivery, please contact us within 24 hours of the expected delivery date:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email: shrikalahastikalamkari@gmail.com</li>
                  <li>Phone: +91 72888 48881 / +91 72888 48882</li>
                </ul>
                <p>
                  We will work with our shipping partners to resolve the issue as quickly as possible.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                Special Instructions
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  • All our Kalamkari products are handcrafted and delicate. We take utmost care in packaging to ensure safe delivery.
                </p>
                <p>
                  • Please inspect your package carefully upon receipt. If you notice any damage, please inform us immediately with photos.
                </p>
                <p>
                  • For international orders, please provide accurate address details including postal code and contact number to ensure smooth delivery.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
