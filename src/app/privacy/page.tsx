import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Shri Kalahasti Kalamkari",
  description: "Read our Privacy Policy to understand how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="font-playfair text-4xl font-bold text-[#3B2C23] mb-2">
            Privacy Policy
          </h1>
          <p className="text-[#3B2C23]/60 mb-8 font-inter text-sm">
            Last updated: November 2025
          </p>
          
          <div className="space-y-8 text-[#3B2C23]">
            <p className="font-inter text-[15px] leading-relaxed">
              Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this policy carefully to understand our practices and how we protect your personal data.
            </p>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We may collect information that you voluntarily provide such as your name, email address, and contact details. We also collect non-personal data automatically through cookies, analytics, and usage logs to enhance your browsing experience.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To improve website functionality and user experience.</li>
                  <li>To respond to your inquiries or feedback.</li>
                  <li>To send updates or promotional content (only with your consent).</li>
                  <li>To analyze site traffic and performance.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                3. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Our website uses cookies to remember your preferences and gather analytics data. You can control or delete cookies in your browser settings. By using our site, you consent to our use of cookies as described in this policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                4. Data Sharing and Disclosure
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We do not sell or rent your personal data. We may share limited information with trusted partners (like hosting or analytics providers) only to operate and improve our website, under strict confidentiality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                5. Your Rights and Choices
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access, correct, or delete your personal data.</li>
                  <li>Withdraw consent for marketing communications.</li>
                  <li>Opt-out of cookies via your browser settings.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                6. Data Security
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We use secure technologies and best practices to protect your data from unauthorized access, alteration, or disclosure. However, no online system is completely secure, and we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                7. Third-Party Links
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  Our website may contain links to external sites. We are not responsible for the content or privacy practices of those websites. We encourage you to review their respective privacy policies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                8. Changes to This Policy
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  We may update this Privacy Policy periodically. The updated version will be posted on this page with a revised date. Continued use of our website after changes means you accept those updates.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-semibold text-[#B35E2E] mb-4">
                9. Contact Us
              </h2>
              <div className="space-y-4 font-inter text-[15px] leading-relaxed">
                <p>
                  If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:srikalahastikalamkari.sk@gmail.com" className="text-[#B35E2E] hover:underline">srikalahastikalamkari.sk@gmail.com</a>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
