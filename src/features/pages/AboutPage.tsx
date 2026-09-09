"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Heart,
  Award,
  Users,
  Leaf,
  Check,
  ShieldCheck,
  Paintbrush,
} from "lucide-react"

import { PageHero } from "@/components/layout/PageHero"

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // --- Heritage Stats ---
  const stats = [
    { number: "25+", label: "Years of Heritage", sub: "Est. 1999" },
    { number: "50+", label: "Master Artisans", sub: "In-house studio" },
    { number: "100%", label: "Pen Kalamkari", sub: "Natural vegetable dyes" },
  ]

  // --- Team Members ---
  const teamMembers = [
    {
      name: "Shaik Saleem Basha",
      role: "Founder",
      image: "/images/about/shaik-saleem-basha.png",
    },
    {
      name: "Shaik Abdul Vajid",
      role: "Operations Manager",
      image: "/images/about/shaik-abdul-vajid.jpg",
    },
    {
      name: "Yalasiri Anitha",
      role: "Master Artisan",
      image: "/images/about/anitha.png",
    },
    {
      name: "Muni Krishna Reddy",
      role: "Colouring Master",
      image: "/images/about/muni.jpg",
    },
  ]

  // --- Core Values ---
  const values = [
    {
      title: "Authenticity",
      description:
        "Preserving genuine GI-tagged Srikalahasti pen-work techniques, using natural vegetable and mineral dyes without shortcuts.",
      icon: Heart,
    },
    {
      title: "Master Quality",
      description:
        "Crafted on pure handloom silks and fine cottons, each piece undergoes meticulous inspection before it reaches your collection.",
      icon: Award,
    },
    {
      title: "Eco Sustainability",
      description:
        "Committed to 100% natural, biodegradable ingredients—myrobalan, jaggery, iron, and alum—protecting nature and artisans.",
      icon: Leaf,
    },
    {
      title: "Living Heritage",
      description:
        "Sustaining hereditary artisan families in Srikalahasti, passing ancient mythological and floral motifs to future generations.",
      icon: Users,
    },
  ]

  // --- Animation Variants ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  }

  return (
    <div className="w-full min-h-screen bg-white text-[#1A1512] dark:bg-[#0E0907] dark:text-neutral-100">
      {/* ─────────────────────────────────────────────
          1. HERO SECTION — ARCHITECTURAL HERITAGE
      ────────────────────────────────────────────── */}
      <PageHero
        eyebrow="Heritage & Craft · Est. 1999"
        titleStart="Our"
        titleAccent="story"
        description="Preserving the sacred centuries-old bamboo-pen art and empowering hereditary artisan families."
      />

      {/* ─────────────────────────────────────────────
          2. OUR MISSION — PRESERVING TRADITION
      ────────────────────────────────────────────── */}
      <section id="mission" className="py-16 md:py-24 relative bg-white dark:bg-[#0E0907]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-[1120px] mx-auto">
            {/* Image Block */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative mx-auto max-w-[440px] w-full"
            >
              {/* Soft Gold Halo Frame */}
              <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-tr from-[#C19A5B]/20 via-neutral-200/20 to-transparent -rotate-1 pointer-events-none blur-sm" />

              <div className="aspect-[4/5] relative rounded-xl overflow-hidden shadow-[0_16px_36px_rgba(26,21,18,0.08)] border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100 dark:bg-[#1E1510]">
                <Image
                  src="/images/gallery/gallery-3.jpg"
                  alt="Master artisan hand-painting fine Kalamkari artwork in Srikalahasti"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 440px"
                />

                {/* Floating Craft Badge with Gold Accent */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#1A1512]/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#C19A5B]/30 flex items-center gap-2.5 text-white">
                  <div className="w-7 h-7 rounded-full bg-[#C19A5B]/20 flex items-center justify-center text-[hsl(var(--brand-gold-deep))] shrink-0 border border-[#C19A5B]/40">
                    <Paintbrush className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-sans font-medium text-white/90 truncate">
                    Bamboo Pen Work · Srikalahasti, Andhra Pradesh
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Text Block */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2">
                  <span className="h-px w-6 bg-[#854D0E] dark:bg-[#E2BD7A]" />
                  <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                    Our Mission
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.2] text-[#1A1512] dark:text-white font-bold">
                  Preserving Tradition, <br className="hidden sm:block" />
                  <span className="italic font-medium text-[#854D0E] dark:text-[#E2BD7A]">
                    Creating Living Art
                  </span>
                </h2>
              </div>

              <div className="font-sans text-[#1A1512]/80 dark:text-neutral-200 space-y-4 leading-relaxed text-[15px] sm:text-base font-normal">
                <p>
                  Kalamkari is not merely a textile craft—it is an unbroken,
                  centuries-old narrative tradition. Originating from the temple
                  town of Srikalahasti along the sacred Swarnamukhi river in Andhra Pradesh, our art is recognized
                  with a <strong className="font-semibold text-[#1A1512] dark:text-white">Geographical Indication (GI)</strong> tag,
                  celebrating its unique freehand bamboo-pen technique.
                </p>
                <p>
                  At Srikalahasti Kalamkari, we collaborate directly with over
                  fifty hereditary master painters and colouring artisans. Every
                  saree, dupatta, and fabric passes through seventeen traditional
                  purification stages—from river washing and milk treatments to
                  mineral mordanting and fine pen detailing.
                </p>
              </div>

              {/* Verified Heritage Stats Row — Clear, High-Contrast Solid Numbers */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                {stats.map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="font-sans font-extrabold text-3xl sm:text-4xl text-[#1A1512] dark:text-white tracking-tight leading-none mb-1.5">
                      {stat.number}
                    </div>
                    <div className="font-sans text-[12px] sm:text-[13px] text-[#1A1512] dark:text-neutral-100 font-bold uppercase tracking-wider leading-tight">
                      {stat.label}
                    </div>
                    <div className="font-sans text-[11px] text-[#1A1512]/60 dark:text-neutral-400 font-medium mt-0.5">
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Verification Pill */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#854D0E] dark:text-[#E2BD7A] shrink-0" />
                  <span className="font-sans text-[12px] text-[#1A1512]/80 dark:text-neutral-300 font-medium">
                    Registered Artisan Enterprise · Srikalahasti Studio (GSTIN: 37EVOPS6191D1ZX)
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          3. CORE VALUES — CLEAN LUXURY ARTISANAL CARDS
      ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#120D0A] border-y border-neutral-200/80 dark:border-neutral-800">
        <div className="container mx-auto px-6 max-w-[1140px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-[#854D0E] dark:bg-[#E2BD7A]" />
              <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                Natural Dye Heritage
              </span>
              <span className="h-px w-6 bg-[#854D0E] dark:bg-[#E2BD7A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1512] dark:text-white font-bold mb-3">
              Our Core <span className="italic font-medium text-[#854D0E] dark:text-[#E2BD7A]">Values</span>
            </h2>
            <p className="font-sans text-[#1A1512]/70 dark:text-neutral-300 text-[15px] sm:text-base font-normal">
              Rooted in sacred temple ecology, fair-trade artisan welfare, and chemical-free botanical alchemy.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((val, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white dark:bg-[#1A120E] p-7 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_20px_rgba(26,21,18,0.03)] hover:shadow-[0_12px_28px_rgba(26,21,18,0.08)] hover:border-[#854D0E]/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#1A1512] dark:bg-neutral-800 text-[#E2BD7A] flex items-center justify-center mb-5 group-hover:bg-[#854D0E] group-hover:text-white transition-all duration-300 shadow-sm">
                    <val.icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#1A1512] dark:text-white mb-2.5">
                    {val.title}
                  </h3>
                  <p className="font-sans text-[#1A1512]/75 dark:text-neutral-300 text-[14px] leading-relaxed font-normal">
                    {val.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          4. MEET OUR TEAM — ARTISANS & CUSTODIANS
      ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0E0907]">
        <div className="container mx-auto px-6 max-w-[1140px]">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-[#854D0E] dark:bg-[#E2BD7A]" />
              <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                The Creators
              </span>
              <span className="h-px w-6 bg-[#854D0E] dark:bg-[#E2BD7A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1512] dark:text-white font-bold mb-3">
              Meet Our <span className="italic font-medium text-[#854D0E] dark:text-[#E2BD7A]">Artisans</span>
            </h2>
            <p className="font-sans text-[#1A1512]/70 dark:text-neutral-300 text-[15px] sm:text-base font-normal">
              The hereditary master painters, colour specialists, and custodians of Srikalahasti Kalamkari.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7"
          >
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group text-center flex flex-col items-center"
              >
                <div className="relative mb-4 overflow-hidden rounded-xl shadow-md w-full aspect-[3/4] border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 45vw, 260px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1512] dark:text-white mb-0.5 leading-snug">
                  {member.name}
                </h3>
                <p className="font-sans text-[11px] sm:text-[12px] text-[#854D0E] dark:text-[#E2BD7A] font-bold tracking-[0.14em] uppercase mb-2">
                  {member.role}
                </p>
                <div className="w-6 h-[2px] bg-[#854D0E]/30 dark:bg-[#E2BD7A]/40 group-hover:w-12 group-hover:bg-[#854D0E] dark:group-hover:bg-[#E2BD7A] transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. WHY CHOOSE US — CRISP LUMINOUS CRAFT PRESENTATION
      ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0E0907] text-[#1A1512] dark:text-white relative overflow-hidden border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="container mx-auto px-6 max-w-[1140px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Text Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2">
                  <span className="h-px w-6 bg-[#854D0E] dark:bg-[#E2BD7A]" />
                  <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[#854D0E] dark:text-[#E2BD7A]">
                    Heritage Advantage
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1512] dark:text-white font-bold leading-tight">
                  Why Choose <br />
                  <span className="italic font-medium text-[#854D0E] dark:text-[#E2BD7A]">
                    Srikalahasti Kalamkari?
                  </span>
                </h2>
              </div>

              <ul className="space-y-3.5">
                {[
                  "100% authentic hand-painted pen Kalamkari by GI-heritage master artisans",
                  "Pure natural vegetable and mineral dyes extracted from myrobalan, alum, and jaggery",
                  "Direct fair-trade empowerment of over 50 hereditary artisan families in Srikalahasti",
                  "Traditional seventeen-step crafting process with natural riverbank washing",
                  "Each saree is a unique, one-of-a-kind art piece requiring up to 30 days of freehand painting",
                  "Certificate of authenticity provided with every heritage collection piece",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#1A1512] dark:bg-white/10 text-[#C19A5B] flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.75} />
                    </div>
                    <span className="font-sans text-[#1A1512]/85 dark:text-neutral-200 text-[14px] sm:text-[15px] leading-relaxed font-normal">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Image Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-60px" }}
              className="lg:col-span-5 relative max-w-[420px] mx-auto w-full"
            >
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-100">
                <Image
                  src="/images/brand-models/model-saree-01.jpeg"
                  alt="Model wearing authentic hand-painted Srikalahasti Kalamkari saree"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-[center_30%]"
                />

                <div className="absolute bottom-3 left-3 right-3 bg-[#1A1512]/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#C19A5B]/30 text-center">
                  <p className="font-serif italic text-[hsl(var(--brand-gold-deep))] text-xs sm:text-[13px]">
                    &ldquo;Wearable mythology, painted by hand.&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
