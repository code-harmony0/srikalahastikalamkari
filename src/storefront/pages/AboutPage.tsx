"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HeroButton, HeroOutlineButton, PrimaryButton } from "@/shared/ui/theme-buttons";
import { ArrowRight, Heart, Award, Users, Leaf, Check } from "lucide-react";

export default function AboutPage() {
  // Stats data
  const stats = [
    { number: "50+", label: "Master Artisans" },
    { number: "1000+", label: "Happy Customers" },
    { number: "4", label: "Years of Heritage" },
  ];

  const teamMembers = [
    {
      name: "Priya Sharma",
      role: "Founder & Creative Director",
      image: "https://static.wixstatic.com/media/07221c_a472c3ef713149fc9e659225e7b494f5~mv2.png?originWidth=448&originHeight=640",
    },
    {
      name: "Rajesh Kumar",
      role: "Master Artisan",
      image: "https://static.wixstatic.com/media/07221c_24d1a5224a3a4efdba5941d80526de9d~mv2.png?originWidth=448&originHeight=640",
    },
    {
      name: "Anjali Patel",
      role: "Operations Manager",
      image: "https://static.wixstatic.com/media/07221c_b9f5ac481d3e4258b0892671da656df3~mv2.png?originWidth=448&originHeight=640",
    },
  ];

  const values = [
    {
      title: "Authenticity",
      description:
        "We preserve traditional Kalamkari techniques while embracing contemporary design sensibilities.",
      icon: Heart,
      color: "from-rose-500/10 to-pink-500/10",
      iconColor: "text-rose-600",
    },
    {
      title: "Quality",
      description:
        "Every saree is crafted with premium natural fabrics and traditional dyes for unparalleled quality.",
      icon: Award,
      color: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600",
    },
    {
      title: "Sustainability",
      description:
        "We are committed to eco-friendly practices and supporting local artisan communities.",
      icon: Leaf,
      color: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-600",
    },
    {
      title: "Heritage",
      description:
        "Our mission is to keep the rich heritage of Indian textile traditions alive for future generations.",
      icon: Users,
      color: "from-blue-500/10 to-indigo-500/10",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background relative">
      {/* Hero Section */}
      <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=1920&originHeight=1024"
            alt="Master Kalamkari artisans carefully hand-painting intricate traditional patterns on natural fabric"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20"></div>
        </div>

        <div className="relative z-10 max-w-[100rem] mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-snug tracking-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
              Our Story
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-paragraph [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
            >
              Celebrating the timeless art of Kalamkari and the master artisans
              who keep this ancient heritage alive through every brushstroke.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Link href="/products">
                <HeroButton>
                  Shop The Collection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </HeroButton>
              </Link>
              <a href="#our-mission">
                <HeroOutlineButton>
                  Our Mission
                </HeroOutlineButton>
              </a>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="pt-8"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-6 h-10 border-2 border-white/60 rounded-full mx-auto flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-3 bg-white/80 rounded-full mt-2"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section id="our-mission" className="w-full py-20 md:py-24">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-2 lg:order-1"
            >
              <div className="relative group">
                <Image
                  src="https://static.wixstatic.com/media/07221c_2d9705923c15466887b842567c2d0261~mv2.png?originWidth=768&originHeight=768"
                  alt="Skilled Kalamkari artisan delicately hand-painting traditional motifs with natural dyes"
                  width={600}
                  height={600}
                  className="w-full h-auto rounded-xl shadow-lg transition-shadow duration-500 group-hover:shadow-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/5 to-accent-color/5 rounded-2xl -z-10 transition-all duration-500 group-hover:from-primary/8 group-hover:to-accent-color/8"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-1 lg:order-2 space-y-6"
            >
              <div className="space-y-3">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="inline-block font-heading text-primary text-lg font-semibold tracking-wide uppercase"
                >
                  Our Mission
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight"
                >
                  Preserving Tradition,{" "}
                  <span className="text-primary">Creating Beauty</span>
                </motion.h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="font-paragraph text-base md:text-lg text-foreground/80 space-y-4 leading-relaxed"
              >
                <p>
                  Kalamkari is more than just a textile art form—it is a living
                  narrative of centuries-old craftsmanship. At Shri Kailash
                  Kalamkari, we are dedicated to preserving this ancient
                  tradition while making it accessible to the modern world.
                </p>
                <p>
                  Founded in 2020, our journey began with a simple vision: to
                  celebrate the extraordinary talent of master artisans and bring
                  their handcrafted creations to those who appreciate true
                  artistry and cultural heritage.
                </p>
                <p>
                  Every saree in our collection is a testament to the skill,
                  patience, and passion of our artisans. We work directly with
                  these talented craftspeople, ensuring fair compensation and
                  sustainable practices that honor both the art and the artists.
                </p>
              </motion.div>

              {/* Stats section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="grid grid-cols-3 gap-4 pt-6 border-t border-primary/20"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl md:text-2xl font-heading font-bold text-primary">
                      {stat.number}
                    </div>
                    <div className="text-xs md:text-sm text-foreground/70 font-paragraph">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="w-full py-20 md:py-24 bg-gradient-to-br from-secondary/15 via-background to-secondary/8">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 leading-tight">
              Our Core <span className="text-primary">Values</span>
            </h2>
            <p className="font-paragraph text-lg text-foreground/80 leading-relaxed">
              These principles guide everything we do, from sourcing materials to
              serving our customers with excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -4 }}
                  whileFocus={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-md border border-gray-100/60 relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg focus-within:shadow-lg hover:border-primary/15 focus-within:border-primary/15 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    {/* Background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent-color/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <IconComponent
                            className={`w-6 h-6 ${value.iconColor} group-hover:scale-105 transition-transform duration-300`}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {value.title}
                      </h3>
                      <p className="font-paragraph text-foreground/70 leading-relaxed text-base group-hover:text-foreground/80 transition-colors duration-300">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="w-full py-20 md:py-24">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 leading-tight">
              Meet Our <span className="text-primary">Team</span>
            </h2>
            <p className="font-paragraph text-lg text-foreground/80 leading-relaxed">
              Passionate individuals dedicated to bringing the beauty of Kalamkari
              to the world through authentic craftsmanship.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -6 }}
                whileFocus={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group text-center"
              >
                {/* Enhanced image container */}
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src={member.image}
                      alt={`${member.name}, ${member.role} at Shri Kailash Kalamkari`}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Decorative frame */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-primary/8 to-accent-color/8 rounded-2xl -z-10 transition-all duration-300 group-hover:from-primary/15 group-hover:to-accent-color/15"></div>
                </div>

                {/* Enhanced text content */}
                <div className="space-y-2">
                  <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="font-paragraph text-base text-foreground/75 font-medium">
                    {member.role}
                  </p>

                  {/* Decorative line */}
                  <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent-color mx-auto opacity-60 group-hover:opacity-100 group-hover:w-16 transition-[width,opacity] duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full py-20 md:py-24 bg-gradient-to-br from-secondary/12 via-background to-secondary/5">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">
                  Why Choose{" "}
                  <span className="text-primary">Shri Kailash Kalamkari?</span>
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  "Authentic hand-painted sarees crafted by master artisans",
                  "Premium natural fabrics and traditional dyes",
                  "Direct support to artisan communities",
                  "Eco-friendly and sustainable practices",
                  "Unique, one-of-a-kind pieces",
                  "Exceptional customer service and support",
                ].map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className="flex gap-3 items-start group"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent-color rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-300">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <p className="font-paragraph text-base md:text-lg text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      {reason}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative group"
            >
              <Image
                src="https://static.wixstatic.com/media/07221c_34372093ed9d4c35aa96a263080fe962~mv2.png?originWidth=448&originHeight=640"
                alt="Beautiful collection of vibrant handcrafted Kalamkari sarees"
                width={500}
                height={700}
                className="w-full h-auto rounded-xl shadow-lg transition-shadow duration-500 group-hover:shadow-xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/5 to-accent-color/5 rounded-2xl -z-10 transition-all duration-500 group-hover:from-primary/8 group-hover:to-accent-color/8"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-24">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">
                Experience the{" "}
                <span className="text-primary">Kalamkari Difference</span>
              </h2>
              <p className="font-paragraph text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                Explore our collection and discover the beauty of handcrafted
                Kalamkari sarees that tell stories of tradition, artistry, and
                timeless elegance.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <Link href="/products">
                <PrimaryButton className="group h-14 px-10 text-lg rounded-xl">
                  Shop Our Collection
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </PrimaryButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
