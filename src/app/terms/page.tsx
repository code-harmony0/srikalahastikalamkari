import { Metadata } from "next"
import { PageHero } from "@/components/layout/PageHero"

export const metadata: Metadata = {
  title: "Terms & Conditions | Shri Kalahasti Kalamkari",
  description:
    "Read our Terms and Conditions for using the Srikalahasti Kalamkari website and services.",
}

// Revalidate page every hour to prevent stale cache
export const revalidate = 3600

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      <PageHero
        compact
        eyebrow="Legal & Policies"
        titleStart="Terms &"
        titleAccent="conditions"
        description="Guidelines and agreements governing your use of Srikalahasti Kalamkari services."
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="bg-white/95 dark:bg-[#1E1510] rounded-xl border border-[hsl(var(--brand-gold)/0.25)] shadow-sm p-6 sm:p-8 md:p-12 backdrop-blur-sm">
          <p className="text-[hsl(var(--brand-gold-deep))] dark:text-[hsl(var(--brand-gold))] mb-6 font-sans text-xs font-bold uppercase tracking-wider">
            Last updated: November 2025
          </p>

          <div className="space-y-8 text-[#1A1512] max-w-[68ch]">
            <p className="font-inter text-[15px] leading-relaxed">
              Welcome to our website. By accessing or using this website, you
              agree to be bound by these Terms and Conditions. Please read them
              carefully before using our services. If you do not agree with any
              part of these terms, you must not use this website.
            </p>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  By accessing or using our website, you confirm that you have
                  read, understood, and agreed to comply with these Terms and
                  Conditions and our Privacy Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                2. Use of the Website
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    You agree to use this website only for lawful purposes.
                  </li>
                  <li>
                    You shall not attempt to gain unauthorized access to any
                    part of the website or interfere with its operation.
                  </li>
                  <li>
                    You must not use the website to distribute harmful or
                    malicious content (including viruses or malware).
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                3. Intellectual Property Rights
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  All content on this website, including text, graphics, logos,
                  and designs, is the property of Shri Kalahasti Kalamkari or
                  its licensors and is protected by copyright and trademark
                  laws. You may not copy, reproduce, or distribute any part of
                  this content without written permission.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                4. User Accounts
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  If you create an account on our website, you are responsible
                  for maintaining the confidentiality of your login information
                  and for all activities that occur under your account. You
                  agree to notify us immediately of any unauthorized access or
                  use of your account.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                5. Limitation of Liability
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We strive to keep all information accurate and up to date, but
                  we do not guarantee that the website will always be available,
                  error-free, or complete. We are not responsible for any
                  direct, indirect, or consequential losses arising from the use
                  of our website.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                6. Third-Party Links
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Our website may contain links to third-party websites. We are
                  not responsible for the content, policies, or practices of
                  those sites. Accessing them is at your own risk.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                7. Termination of Access
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We reserve the right to suspend or terminate your access to
                  the website at any time, without notice, for any reason,
                  including violation of these terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                8. Changes to Terms
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We may update these Terms and Conditions from time to time.
                  The updated version will be posted on this page with the
                  revised date. Continued use of the website after any changes
                  constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                9. Governing Law
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  These Terms and Conditions are governed by and construed in
                  accordance with the laws of your local jurisdiction. Any
                  disputes will be subject to the exclusive jurisdiction of the
                  courts in that area.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#C19A5B] mb-4">
                10. Contact Us
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  For any questions about these Terms and Conditions, please
                  contact us at{" "}
                  <a
                    href="mailto:srikalahastikalamkari.sk@gmail.com"
                    className="text-[#C19A5B] hover:underline"
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
