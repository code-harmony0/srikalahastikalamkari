import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import {
  CornerFlorals,
  JharokhaFrame,
  KalashDivider,
  TempleTowerDivider,
} from "@/shared/ui/heritage-ornaments"

// Only facts the business can stand behind: the craft, the place, the GI tag,
// its registration, and the people who actually do the work. Earlier versions
// carried "25+ years", "50+ artisans", "seventeen stages" and a promised
// certificate with every piece — none verifiable, so none are stated.
const team = [
  {
    name: "Shaik Saleem Basha",
    role: "Founder",
    image: "/images/about/shaik-saleem-basha-v2.jpg",
  },
  {
    name: "Shaik Abdul Vajid",
    role: "Operations manager",
    image: "/images/about/shaik-abdul-vajid-v2.jpg",
  },
  {
    name: "Yalasiri Anitha",
    role: "Master artisan",
    image: "/images/about/anitha-v2.jpg",
  },
  {
    name: "Muni Krishna Reddy",
    role: "Colouring master",
    image: "/images/about/muni-v2.jpg",
  },
]

// Main button as on the home page: midnight with white text.
const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[hsl(var(--brand-midnight))] px-8 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"

export default function AboutPage() {
  return (
    <div className="w-full bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]">
      {/* Page band: pale indigo, temple tower divider and corner temple drawings */}
      <section className="relative overflow-hidden border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))]">
        <CornerFlorals className="absolute left-2 top-3 h-14 w-14 opacity-70 md:left-4 md:h-24 md:w-24" />
        <CornerFlorals className="absolute bottom-3 right-2 hidden h-14 w-14 rotate-180 opacity-70 sm:block md:right-4 md:h-24 md:w-24" />
        <div className="relative mx-auto max-w-2xl px-6 py-10 text-center md:py-14">
          <h1 className="font-serif text-[32px] leading-tight md:text-[46px]">Our story</h1>
          <TempleTowerDivider className="mt-3" />
          <p className="mx-auto mt-3 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))] md:text-[16px]">
            Hand-painted Kalamkari from the artisans of Srikalahasti, Andhra Pradesh.
          </p>
        </div>
      </section>

      {/* The craft: turmeric band with the photo in a temple-arch frame, like the home story */}
      <section aria-labelledby="the-craft" className="bg-[hsl(var(--brand-turmeric-tint))] py-16 md:py-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-5 sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
          <div className="mx-auto w-full max-w-[380px] pt-6">
            <JharokhaFrame>
              <Image
                src="/images/gallery/gallery-3.jpg"
                alt="An artisan drawing a Kalamkari panel by hand with a bamboo kalam in Srikalahasti"
                fill
                sizes="(max-width: 768px) 90vw, 380px"
                className="object-cover"
              />
            </JharokhaFrame>
          </div>

          <div>
            <h2 id="the-craft" className="text-balance font-serif text-[30px] leading-tight md:text-[38px]">
              Rooted in Srikalahasti.<br />Created to Reach the World.
            </h2>
            <div className="mt-6 max-w-[38rem] space-y-4 font-sans text-[15.5px] leading-relaxed text-[hsl(var(--brand-ink-soft))] md:text-[16px]">
              <p>
                Srikalahasti Kalamkari was founded by Mr. Shaik Saleem Basha with a vision to preserve the rich heritage of Srikalahasti Kalamkari and share its beauty with the world.
              </p>
              <p>
                We work closely with local artisans and their families, creating opportunities that help sustain the people and skills behind this traditional craft.
              </p>
              <p>
                What makes our studio special is our ability to create custom Kalamkari designs. From colours and motifs to themes and personal ideas, we work with our customers to bring their vision to life through the hands of skilled artisans.
              </p>
              <p>
                Today, our Kalamkari has found its way to happy customers across India and around the world.
              </p>
              <p className="font-medium text-[hsl(var(--brand-ink))]">
                Our purpose is simple: preserve the craft, support the artisans, and carry the story of Srikalahasti Kalamkari to the world.
              </p>
            </div>

            <p className="mt-8 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
              Registered business · GSTIN{" "}
              <span className="font-medium tabular-nums text-[hsl(var(--brand-ink))]">37EVOPS6191D1ZX</span>
            </p>

            <Link href="/products?category=Sarees" className={`${primaryButton} mt-8`}>
              Shop sarees
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* The people: centred heading with the kalash, photos in a thin gold frame */}
      <section aria-labelledby="our-people" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="our-people" className="text-balance font-serif text-[30px] leading-tight md:text-[40px]">
              The people behind the work
            </h2>
            <KalashDivider className="mt-3" />
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:mt-12 md:grid-cols-4 lg:gap-x-6">
            {team.map((member) => (
              <li key={member.name} className="text-center">
                <div className="relative mx-auto aspect-square w-[85%] overflow-hidden rounded-full bg-[hsl(var(--brand-indigo-tint))] shadow-[0_18px_36px_-26px_rgba(33,30,36,0.55)] sm:w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 280px"
                    className="object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[7px] rounded-full border border-[hsl(var(--brand-gold-soft)/0.9)]"
                  />
                </div>
                <p className="mt-5 font-serif text-[17px] leading-snug md:text-[19px]">{member.name}</p>
                <p className="mt-1 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">{member.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
