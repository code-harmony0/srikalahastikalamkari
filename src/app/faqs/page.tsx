import { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CONTACT, mailtoHref, telHref } from "@/shared/config/contact"

export const metadata: Metadata = {
  title: "FAQs | Sri Kalahasti Kalamkari",
  description:
    "Frequently asked questions about Sri Kalahasti Kalamkari products, shipping, and care instructions",
};

export default function FAQsPage() {
  const faqs = [
    {
      category: "About Kalamkari",
      questions: [
        {
          q: "What is Kalamkari art?",
          a: "Kalamkari is a traditional Indian art form that involves hand-painting or block-printing on fabric using natural dyes. The word 'Kalamkari' comes from 'kalam' (pen) and 'kari' (craftwork). Srikalahasti is one of the two main centers for this ancient art form.",
        },
        {
          q: "How long does it take to create a Kalamkari piece?",
          a: "Depending on the complexity and size, a single Kalamkari piece can take anywhere from 1 week to 3 months to complete. The process involves multiple steps including fabric treatment, drawing, natural dye preparation, coloring, and washing.",
        },
        {
          q: "Are the dyes used in Kalamkari safe?",
          a: "Yes! We use only natural, eco-friendly dyes derived from plants, minerals, and other natural sources. These dyes are completely safe for skin contact and environmentally sustainable.",
        },
        {
          q: "What makes Sri kalahasti Kalamkari special?",
          a: "Sri kalahasti Kalamkari is known for its freehand drawing style (pen kalamkari) and religious themes, particularly depictions from Hindu epics like Ramayana and Mahabharata. Each piece is unique and handcrafted by skilled artisans.",
        },
      ],
    },
    {
      category: "Products & Quality",
      questions: [
        {
          q: "What fabrics do you use for Kalamkari?",
          a: "We primarily use high-quality cotton, silk, and cotton-silk blends. All fabrics are pre-treated to ensure they accept natural dyes well and are comfortable to wear.",
        },
        {
          q: "How do I know if a piece is authentic hand-painted Kalamkari?",
          a: "Authentic Kalamkari pieces have slight variations and imperfections that are characteristic of handwork. The colors are rich but not uniform, and you can often see the pen strokes. Machine-printed versions are perfectly uniform and lack the artistic depth of hand-painted pieces.",
        },
        {
          q: "Do the colors fade over time?",
          a: "With proper care, natural dyes in Kalamkari can last for generations. However, like all natural dyes, they may gradually soften over time, which adds to the character of the piece. Following our care instructions ensures longevity.",
        },
        {
          q: "Can I request custom designs?",
          a: "Yes! We accept custom orders for personalized Kalamkari pieces. Please contact us with your requirements, and our artisans will create something unique for you. Custom pieces typically take 4-8 weeks depending on complexity.",
        },
      ],
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          q: "Do you ship internationally?",
          a: "No. We currently ship within India only, and delivery is free on every order.",
        },
        {
          q: "How is my order packaged?",
          a: "Each Kalamkari piece is carefully wrapped in acid-free tissue paper and placed in a sturdy box with protective materials. We ensure the packaging is both secure and environmentally friendly.",
        },
        {
          q: "Can I track my order?",
          a: "Yes. Once your order ships, the courier name and tracking number appear on your Orders page, where you can follow the delivery with the courier.",
        },
        {
          q: "What if my order arrives damaged?",
          a: "All sales are final, and we do not offer returns, refunds or replacements. Every piece is checked and packed carefully before it leaves us. If you have a question about your delivery, please contact us.",
        },
      ],
    },
    {
      category: "Care & Maintenance",
      questions: [
        {
          q: "Can Kalamkari be machine washed?",
          a: "No, we strongly recommend hand washing only. Machine washing can damage the delicate natural dyes and fabric. Always follow our care instructions for best results.",
        },
        {
          q: "How often should I clean my Kalamkari pieces?",
          a: "Clean only when necessary. For display pieces like wall hangings, gentle dusting every few months is sufficient. For wearable items, wash as needed but avoid frequent washing to preserve the colors.",
        },
        {
          q: "Can I iron Kalamkari fabric?",
          a: "Yes, but with care. Use medium heat, iron on the reverse side, and place a clean cloth between the iron and fabric. Avoid direct heat on heavily painted areas.",
        },
        {
          q: "How should I store Kalamkari when not in use?",
          a: "Store in a cool, dry place away from direct sunlight. Fold neatly and wrap in muslin cloth. Avoid plastic bags as they can trap moisture. Refold every few months to prevent permanent creases.",
        },
      ],
    },
    {
      category: "Orders & Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. All transactions are secure and encrypted.",
        },
        {
          q: "Can I cancel or modify my order?",
          a: "No. Orders are paid online at checkout and cannot be cancelled or changed once payment has been made. Please check your size, colour and address before you pay.",
        },
        {
          q: "Are there any discounts for bulk orders?",
          a: "Yes, we offer discounts for bulk orders and corporate gifts. Please contact us with your requirements, and we'll be happy to provide a custom quote.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      {/* Signature Page Hero */}
      <PageHero
        compact
        eyebrow="Help & Support"
        titleStart="Frequently Asked"
        titleAccent="questions"
        description="Find answers to common questions about authentic Srikalahasti Kalamkari craftsmanship, orders, care, and delivery."
      />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="bg-white/95 dark:bg-[#1E1510] rounded-xl border border-[hsl(var(--brand-gold)/0.25)] shadow-sm p-6 sm:p-8 md:p-12 backdrop-blur-sm">
          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <section key={categoryIndex}>
                <h2 className="font-serif text-2xl font-bold text-[hsl(var(--brand-gold-deep))] dark:text-[hsl(var(--brand-gold))] mb-6 pb-2 border-b border-[hsl(var(--brand-gold)/0.2)]">
                  {category.category}
                </h2>

                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className="border-l-4 border-[#C19A5B]/30 pl-6"
                    >
                      <h3 className="font-inter font-semibold text-[#1A1512] text-lg mb-3">
                        {faq.q}
                      </h3>
                      <p className="font-inter text-[#1A1512]/80 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 p-6 bg-[#1A1512]/5 rounded-lg border border-[#C19A5B]/20">
            <h3 className="font-playfair text-xl font-semibold text-[#1A1512] dark:text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="font-inter text-[#1A1512]/80 dark:text-neutral-200 mb-4">
              We're here to help! Whether you need more information about our
              products, want to discuss a custom order, or have any other
              questions, don't hesitate to reach out.
            </p>
            <div className="space-y-2 font-inter text-sm text-[#1A1512]/80 dark:text-neutral-300">
              <p>
                <strong className="text-[#1A1512] dark:text-white">Email:</strong>{" "}
                <a href={mailtoHref()} className="inline-flex min-h-[44px] items-center text-[#854D0E] dark:text-[#E2BD7A] font-semibold hover:underline break-all">
                  {CONTACT.email}
                </a>
              </p>
              <p>
                <strong className="text-[#1A1512] dark:text-white">Phone:</strong>{" "}
                {CONTACT.phones.slice(0, 2).map((phone, i) => (
                  <span key={phone}>
                    {i > 0 && " / "}
                    <a href={telHref(phone)} className="inline-flex min-h-[44px] items-center text-[#854D0E] dark:text-[#E2BD7A] font-semibold hover:underline">
                      {phone}
                    </a>
                  </span>
                ))}
              </p>
              <p>
                <strong className="text-[#1A1512]">Visit:</strong> # 17-68, Bharathi Nagar, Tirupati Main
                Road, Srikalahasti-517640
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
