/**
 * Shown on every route while SITE_OFFLINE is true.
 *
 * Deliberately carries no brand name, logo, contact details or outbound links.
 */
export default function UnavailablePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-6 py-16">
      <div className="w-full max-w-[420px] text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-8 h-px w-12 bg-white/25"
        />

        <h1 className="font-sans text-[19px] font-normal leading-snug tracking-[0.01em] text-white/90 sm:text-[21px]">
          This site is temporarily unavailable
        </h1>

        <p className="mt-4 text-[14px] leading-relaxed text-white/45">
          Please check back later.
        </p>

        <div
          aria-hidden="true"
          className="mx-auto mt-8 h-px w-12 bg-white/25"
        />
      </div>
    </main>
  )
}
