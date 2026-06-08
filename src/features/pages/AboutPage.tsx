"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart, Award, Users, Leaf, Check } from "lucide-react"

export default function AboutPage() {
  // --- Data ---
  const stats = [
    { number: "50+", label: "Master Artisans" },
    { number: "1000+", label: "Happy Customers" },
    { number: "4", label: "Years of Heritage" },
  ]

  const teamMembers = [
    {
      name: "Shaik Saleem Basha",
      role: "Founder",
      image: "/images/about/shaik-saleem-basha.jpg",
    },
    {
      name: "Shaik Abdul Vajid",
      role: "Operation Manager",
      image: "/images/about/shaik-abdul-vajid.jpg",
    },
    {
      name: "Yalasiri Anitha",
      role: "Master Artisan",
      image: "/images/about/anitha.jpg",
    },
    {
      name: "Muni Krishna Reddy",
      role: "Colouring Master",
      image: "/images/about/muni.jpg",
    },
  ]

  const values = [
    {
      title: "Authenticity",
      description:
        "We preserve traditional Kalamkari techniques while embracing contemporary design.",
      icon: Heart,
    },
    {
      title: "Quality",
      description:
        "Crafted with premium natural fabrics and traditional dyes for unparalleled quality.",
      icon: Award,
    },
    {
      title: "Sustainability",
      description:
        "Committed to eco-friendly practices and supporting local artisan communities.",
      icon: Leaf,
    },
    {
      title: "Heritage",
      description:
        "Keeping the rich heritage of Indian textile traditions alive for future generations.",
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
      transition: { staggerChildren: 0.15 },
    },
  }

  return (
    <div className="w-full min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      {/* ─────────────────────────────────────────────
          1. HERO SECTION — OUR STORY
      ────────────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about/about_us.webp"
            alt="Kalamkari artisans working"
            fill
            className="object-cover object-center scale-125"
            priority
          />
          <div className="absolute inset-0 bg-[#1A1512]/65" />{" "}
        </div>

        {/* Corner borders for premium touch */}
        <div className="absolute inset-0 z-[6] pointer-events-none">
          <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/40 to-transparent" />
          <div className="absolute top-8 bottom-8 left-8 w-px bg-gradient-to-b from-transparent via-[#C19A5B]/30 to-transparent" />
          <div className="absolute top-8 bottom-8 right-8 w-px bg-gradient-to-b from-transparent via-[#C19A5B]/30 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-6"
          >
            <span className="font-sans text-[11px] font-bold tracking-[0.3em] uppercase text-[#C19A5B] leading-none mb-2 block">
              Heritage & Craft
            </span>
            <h1 className="font-serif font-bold text-4xl md:text-[54px] leading-tight uppercase tracking-wide">
              Our <span className="italic text-[#C19A5B] font-normal lowercase">Story</span>
            </h1>
            <p className="font-sans text-base md:text-lg text-white/80 max-w-[680px] mx-auto leading-relaxed font-light">
              Celebrating the timeless art of Kalamkari and the master artisans
              who keep this ancient heritage alive through every brushstroke.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <button className="h-[48px] px-8 bg-white text-[#1A1512] hover:bg-[#C19A5B] hover:text-white font-sans font-bold text-[12px] uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-2">
                  Shop Collection <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="#mission">
                <button className="h-[48px] px-8 border border-white/30 text-white font-sans font-bold text-[12px] uppercase tracking-wider hover:bg-white/10 transition-colors">
                  Our Mission
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          2. OUR MISSION — PRESERVING TRADITION
      ────────────────────────────────────────────── */}
      <section id="mission" className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-[1080px] mx-auto">
            {/* Image Block */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="relative mx-auto md:mx-0 max-w-[480px] w-full"
            >
              <div className="aspect-[4/5] relative rounded-[12px] overflow-hidden shadow-[0_8px_30px_rgba(26,21,18,0.06)] border border-[#C19A5B]/20">
                <Image
                  src="/images/gallery/gallery-3.jpg"
                  alt="Elderly master artisan painting fine Kalamkari artwork"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>

            {/* Text Block */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="space-y-6"
            >
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#C19A5B]">
                Our Mission
              </span>
              <h2 className="font-serif text-3xl md:text-[42px] leading-[1.2] text-[#1A1512] mb-4">
                Preserving Tradition, <br className="hidden md:block" />{" "}
                <span className="italic text-[#C19A5B]">Creating Beauty</span>
              </h2>

              <div className="font-sans text-[#1A1512]/80 space-y-4 leading-relaxed text-base font-light">
                <p>
                  Kalamkari is more than just a textile art form—it is a living
                  narrative of centuries-old craftsmanship. At Srikalahasti
                  Kalamkari, we are dedicated to preserving this ancient
                  tradition while making it accessible to the modern world.
                </p>
                <p>
                  From our studio in Srikalahasti, we create authentic
                  hand-painted masterpieces including Sarees, Duppatas, and
                  exquisite Wall Paintings. Each piece is a testament to the
                  skill of our master artisans and the rich heritage of the
                  region.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#1A1512]/10">
                {[
                  { number: "200+", label: "Master Artisans" },
                  { number: "GSTIN", label: "37EVOPS6191D1ZX" },
                  { number: "EST.", label: "1999" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="font-serif font-bold text-xl md:text-2xl text-[#C19A5B] mb-1">
                      {stat.number}
                    </div>
                    <div className="font-sans text-[9px] text-[#1A1512]/50 font-bold uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          3. CORE VALUES
      ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#FAFAF8] border-y border-[#1A1512]/5">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#C19A5B] mb-2 block">
              Our Foundations
            </span>
            <h2 className="font-serif text-3xl md:text-[42px] text-[#1A1512] mb-4">
              Our Core <span className="italic text-[#C19A5B]">Values</span>
            </h2>
            <p className="font-sans text-[#1A1512]/60 text-base font-light">
              Principles that guide our craftsmanship and community.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((val, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-white p-8 rounded-[12px] border border-[#C19A5B]/20 shadow-[0_1px_3px_rgba(26,21,18,0.02)] hover:shadow-[0_12px_30px_rgba(26,21,18,0.06)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFF8F0] flex items-center justify-center mb-6 group-hover:bg-[#C19A5B] border border-[#C19A5B]/30 transition-colors duration-300">
                  <val.icon
                    className="w-6 h-6 text-[#C19A5B] group-hover:text-white transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#1A1512] mb-3">
                  {val.title}
                </h3>
                <p className="font-sans text-[#1A1512]/60 text-sm leading-relaxed font-light">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          4. MEET OUR TEAM
      ────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-[1080px]">
          <div className="text-center mb-16">
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#C19A5B] mb-2 block">
              The Creators
            </span>
            <h2 className="font-serif text-3xl md:text-[42px] text-[#1A1512] mb-4">
              Meet Our <span className="italic text-[#C19A5B]">Team</span>
            </h2>
            <p className="font-sans text-[#1A1512]/60 text-base font-light">
              The passionate individuals behind Srikalahasti Kalamkari.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-center"
          >
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group text-center"
              >
                <div className="relative mb-6 overflow-hidden rounded-[12px] shadow-sm max-w-[340px] mx-auto aspect-[3/4] border border-[#C19A5B]/20">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#1A1512] mb-1">
                  {member.name}
                </h3>
                <p className="font-sans text-xs text-[#1A1512]/60 tracking-wider uppercase mb-3 font-semibold">
                  {member.role}
                </p>
                <div className="w-8 h-[2px] bg-[#C19A5B]/40 mx-auto group-hover:w-16 group-hover:bg-[#C19A5B] transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. WHY CHOOSE US
      ────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#FFF8F0]/50 border-t border-[#1A1512]/5">
        <div className="container mx-auto px-6 max-w-[1080px]">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="md:w-[55%] space-y-8"
            >
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#C19A5B] block">
                Heritage Advantage
              </span>
              <h2 className="font-serif text-3xl md:text-[42px] text-[#1A1512] leading-tight">
                Why Choose <br />
                <span className="italic text-[#C19A5B]">Srikalahasti Kalamkari?</span>
              </h2>

              <ul className="space-y-4">
                {[
                  "Authentic hand-painted sarees crafted by master artisans",
                  "Premium natural fabrics and traditional dyes",
                  "Direct support to artisan communities",
                  "Eco-friendly and sustainable practices",
                  "Unique, one-of-a-kind pieces",
                  "Exceptional customer service",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#FAFAF8] border border-[#C19A5B]/30 flex items-center justify-center">
                      <Check
                        className="w-3 h-3 text-[#C19A5B]"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="font-sans text-[#1A1512]/80 text-base leading-relaxed font-light">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Image Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:w-[45%] relative"
            >
              <div className="aspect-[3/4] rounded-[12px] overflow-hidden shadow-lg border border-[#C19A5B]/20 rotate-1 hover:rotate-0 transition-transform duration-500 bg-white">
                <Image
                  src="https://static.wixstatic.com/media/07221c_34372093ed9d4c35aa96a263080fe962~mv2.png"
                  alt="Kalamkari Saree Collection"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          6. CTA SECTION — Premium Dark Charcoal Box
      ────────────────────────────────────────────── */}
      <section className="py-24 text-center bg-[#1A1512] relative overflow-hidden">
        {/* Decorative corner accents & border */}
        <div className="absolute inset-0 z-[6] pointer-events-none">
          <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
          <div className="absolute top-8 bottom-8 left-8 w-px bg-gradient-to-b from-transparent via-[#C19A5B]/20 to-transparent" />
          <div className="absolute top-8 bottom-8 right-8 w-px bg-gradient-to-b from-transparent via-[#C19A5B]/20 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-[640px] mx-auto space-y-6"
          >
            <span className="font-sans text-[10px] font-bold tracking-[0.4em] uppercase text-[#C19A5B]">
              Discover Heritage
            </span>
            <h2 className="font-serif text-3xl md:text-[42px] text-white leading-tight">
              Experience the{" "}
              <span className="italic text-[#C19A5B] font-normal lowercase">Kalamkari</span> Difference
            </h2>
            <p className="font-sans text-lg text-white/70 leading-relaxed font-light">
              Explore our collection and discover the beauty of handcrafted
              sarees that tell stories of tradition, artistry, and timeless
              elegance.
            </p>

            <div className="pt-4">
              <Link href="/products">
                <button className="h-[52px] px-10 bg-[#C19A5B] text-white font-sans font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-[#1A1512] hover:scale-102 transition-all duration-300 shadow-md">
                  Shop Our Collection
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
