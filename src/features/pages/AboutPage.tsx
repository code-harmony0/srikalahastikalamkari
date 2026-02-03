"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Award, Users, Leaf, Check } from "lucide-react";
import { cn } from "@/shared/utils";

export default function AboutPage() {
  // --- Data ---
  const stats = [
    { number: "50+", label: "Master Artisans" },
    { number: "1000+", label: "Happy Customers" },
    { number: "4", label: "Years of Heritage" },
  ];

  const teamMembers = [
    {
      name: "Priya Sharma",
      role: "Founder & Creative Director",
      image:
        "https://static.wixstatic.com/media/07221c_a472c3ef713149fc9e659225e7b494f5~mv2.png/v1/fill/w_448,h_640,al_c,q_85,usm_0.66_1.00_0.01/Founder.png",
    },
    {
      name: "Rajesh Kumar",
      role: "Master Artisan",
      image:
        "https://static.wixstatic.com/media/07221c_24d1a5224a3a4efdba5941d80526de9d~mv2.png/v1/fill/w_448,h_640,al_c,q_85,usm_0.66_1.00_0.01/Artisan.png",
    },
    {
      name: "Anjali Patel",
      role: "Operations Manager",
      image:
        "https://static.wixstatic.com/media/07221c_b9f5ac481d3e4258b0892671da656df3~mv2.png/v1/fill/w_448,h_640,al_c,q_85,usm_0.66_1.00_0.01/Manager.png",
    },
  ];

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
  ];

  // --- Animation Variants ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF3EC] text-[#3B2C23]">
      {/* ─────────────────────────────────────────────
          1. HERO SECTION — OUR STORY
      ────────────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png"
            alt="Kalamkari artisans working"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#28140A]/55" />{" "}
          {/* Darker Overlay for readability */}
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-[#FFF8F0]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-6"
          >
            <h1 className="font-playfair font-bold text-4xl md:text-[54px] leading-tight">
              Our Story
            </h1>
            <p className="font-inter text-base md:text-lg text-[#F3DEC8] max-w-[680px] mx-auto leading-relaxed">
              Celebrating the timeless art of Kalamkari and the master artisans
              who keep this ancient heritage alive through every brushstroke.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <button className="h-[48px] px-8 bg-[#B35E2E] text-white font-inter font-medium text-sm rounded-[6px] hover:bg-[#964B22] transition-colors shadow-lg shadow-[#B35E2E]/20 flex items-center gap-2">
                  Shop Collection <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="#mission">
                <button className="h-[48px] px-8 border border-[#FFF8F0]/30 text-[#FFF8F0] font-inter font-medium text-sm rounded-[6px] hover:bg-[#FFF8F0]/10 transition-colors">
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
      <section id="mission" className="py-20 md:py-24">
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
              <div className="aspect-[4/5] relative rounded-[12px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <Image
                  src="https://static.wixstatic.com/media/07221c_2d9705923c15466887b842567c2d0261~mv2.png"
                  alt="Artisan painting Kalamkari"
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
              <span className="font-inter font-bold text-[#B35E2E] text-sm tracking-widest uppercase">
                Our Mission
              </span>
              <h2 className="font-playfair font-bold text-3xl md:text-[42px] leading-[1.2] text-[#3B2C23]">
                Preserving Tradition, <br className="hidden md:block" />{" "}
                Creating Beauty
              </h2>

              <div className="font-inter text-[#3B2C23]/80 space-y-4 leading-relaxed text-base">
                <p>
                  Kalamkari is more than just a textile art form—it is a living
                  narrative of centuries-old craftsmanship. At Srikalahasti
                  Kalamkari, we are dedicated to preserving this ancient
                  tradition while making it accessible to the modern world.
                </p>
                <p>
                  From our studio in Srikalahasti, we create authentic hand-painted
                  masterpieces including Sarees, Duppatas, and exquisite Wall Paintings.
                  Each piece is a testament to the skill of our master artisans and
                  the rich heritage of the region.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#3B2C23]/10">
                {[
                    { number: "200+", label: "Master Artisans" },
                    { number: "GSTIN", label: "37EVOPS6191D1ZX" },
                    { number: "EST.", label: "2026" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="font-playfair font-bold text-xl md:text-2xl text-[#B35E2E] mb-1">
                      {stat.number}
                    </div>
                    <div className="font-inter text-[10px] md:text-xs text-[#7A6A5C] font-bold uppercase tracking-wider">
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
      <section className="py-20 bg-[#FDFBF7] border-y border-[#3B2C23]/5">
        <div className="container mx-auto px-6 max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-playfair font-bold text-3xl md:text-[42px] text-[#3B2C23] mb-4">
              Our Core Values
            </h2>
            <p className="font-inter text-[#7A6A5C] text-base">
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
                className="bg-white p-8 rounded-[12px] border border-[#EAD6C3]/40 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFF4E8] flex items-center justify-center mb-6 group-hover:bg-[#B35E2E] transition-colors duration-300">
                  <val.icon
                    className="w-6 h-6 text-[#B35E2E] group-hover:text-white transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-playfair font-bold text-xl text-[#3B2C23] mb-3">
                  {val.title}
                </h3>
                <p className="font-inter text-[#7A6A5C] text-sm leading-relaxed">
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
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6 max-w-[1080px]">
          <div className="text-center mb-16">
            <h2 className="font-playfair font-bold text-3xl md:text-[42px] text-[#3B2C23] mb-4">
              Meet Our Team
            </h2>
            <p className="font-inter text-[#7A6A5C] text-base">
              The passionate individuals behind Srikalahasti Kalamkari.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center"
          >
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group text-center"
              >
                <div className="relative mb-6 overflow-hidden rounded-[12px] shadow-sm max-w-[340px] mx-auto aspect-[3/4]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-playfair font-bold text-xl text-[#3B2C23] mb-1">
                  {member.name}
                </h3>
                <p className="font-inter text-sm text-[#7A6A5C] font-medium mb-3">
                  {member.role}
                </p>
                <div className="w-8 h-[2px] bg-[#E6B162] mx-auto opacity-60 group-hover:w-16 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. WHY CHOOSE US
      ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#FFF9F3]">
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
              <h2 className="font-playfair font-bold text-3xl md:text-[42px] text-[#3B2C23] leading-tight">
                Why Choose <br />
                <span className="text-[#B35E2E]">Srikalahasti Kalamkari?</span>
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
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#FFF4E8] flex items-center justify-center">
                      <Check
                        className="w-3 h-3 text-[#E6B162]"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="font-inter text-[#3B2C23]/80 text-base leading-relaxed">
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
              <div className="aspect-[3/4] rounded-[12px] overflow-hidden shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500">
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
          6. CTA SECTION
      ────────────────────────────────────────────── */}
      <section className="py-24 text-center bg-[#FAF3EC]">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-[640px] mx-auto space-y-6"
          >
            <h2 className="font-playfair font-bold text-3xl md:text-[42px] text-[#3B2C23] leading-tight">
              Experience the{" "}
              <span className="text-[#B35E2E]">Kalamkari Difference</span>
            </h2>
            <p className="font-inter text-lg text-[#3B2C23]/80 leading-relaxed">
              Explore our collection and discover the beauty of handcrafted
              sarees that tell stories of tradition, artistry, and timeless
              elegance.
            </p>

            <div className="pt-4">
              <Link href="/products">
                <button className="h-[52px] px-10 bg-[#B35E2E] text-white font-inter font-semibold text-base rounded-[6px] hover:bg-[#964B22] hover:scale-105 transition-all shadow-lg shadow-[#B35E2E]/25">
                  Shop Our Collection
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
