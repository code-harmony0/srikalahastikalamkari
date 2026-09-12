import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageHero } from "@/components/layout/PageHero"

// Only facts the business can stand behind: the craft, the place, the GI tag,
// its registration, and the people who actually do the work. Earlier versions
// carried "25+ years", "50+ artisans", "seventeen stages" and a promised
// certificate with every piece — none verifiable, so none are stated.
const team = [
  {
    name: "Shaik Saleem Basha",
    role: "Founder",
    image: "/images/about/shaik-saleem-basha.png",
  },
  {
    name: "Shaik Abdul Vajid",
    role: "Operations manager",
    image: "/images/about/shaik-abdul-vajid.jpg",
  },
  {
    name: "Yalasiri Anitha",
    role: "Master artisan",
    image: "/images/about/anitha.png",
  },
  {
    name: "Muni Krishna Reddy",
    role: "Colouring master",
    image: "/images/about/muni.jpg",
  },
]

export default function AboutPage() {
  return (
    <div className="w-full bg-background text-[hsl(var(--brand-ink))]">
      <PageHero
        titleStart="Our"
        titleAccent="story"
        description="Hand-painted Kalamkari from the artisans of Srikalahasti, Andhra Pradesh."
      />

      {/* ── The craft ─────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-20">
        <div className="relative aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-lg ring-1 ring-[hsl(var(--brand-ink)/0.08)] lg:col-span-5">
          <Image
            src="/images/gallery/gallery-3.jpg"
            alt="An artisan drawing a Kalamkari panel by hand with a bamboo kalam in Srikalahasti"
            fill
            sizes="(max-width: 1024px) 100vw, 460px"
            className="object-cover"
          />
        </div>

        <div className="lg:col-span-7">
          <h2 className="font-serif text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-balance sm:text-[38px]">
            Painted by hand in Srikalahasti
          </h2>
          <div className="mt-5 max-w-[62ch] space-y-4 text-[15px] leading-[1.75] text-[hsl(var(--brand-ink)/0.78)] sm:text-[16px]">
            <p>
              Srikalahasti Kalamkari is drawn freehand with a bamboo{" "}
              <em>kalam</em> and coloured with natural dyes, in the temple town of
              Srikalahasti in Andhra Pradesh. The craft carries a Geographical
              Indication (GI) tag.
            </p>
            <p>
              We work directly with the artisans who paint every saree, dupatta
              and fabric we sell, from their workshop to your order.
            </p>
          </div>

          <p className="mt-6 text-[13px] text-[hsl(var(--brand-ink)/0.6)]">
            Registered enterprise · GSTIN{" "}
            <span className="font-medium tabular-nums text-[hsl(var(--brand-ink)/0.85)]">
              37EVOPS6191D1ZX
            </span>
          </p>

          <Link
            href="/products?category=Sarees"
            className="mt-8 inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[hsl(var(--brand-ink))] px-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-paper))] transition-colors hover:bg-[hsl(var(--brand-ink-soft))]"
          >
            Shop sarees
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── The people ────────────────────────────────────────────── */}
      <section className="border-t border-[hsl(var(--brand-gold)/0.2)]">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="font-serif text-[26px] font-semibold leading-tight sm:text-[32px]">
            The people behind the work
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
            {team.map((member) => (
              <li key={member.name}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[hsl(var(--brand-ink)/0.05)] ring-1 ring-[hsl(var(--brand-ink)/0.08)]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 280px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-[15px] font-semibold leading-snug">
                  {member.name}
                </p>
                <p className="mt-0.5 text-[13px] text-[hsl(var(--brand-ink)/0.6)]">
                  {member.role}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
