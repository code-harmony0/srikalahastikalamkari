import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DecorativePattern, FloatingDots, DecorativeBorder } from '@/components/ui/decorative-pattern';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Priya Sharma',
      role: 'Founder & Creative Director',
      image: 'https://static.wixstatic.com/media/07221c_a472c3ef713149fc9e659225e7b494f5~mv2.png?originWidth=448&originHeight=640',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Master Artisan',
      image: 'https://static.wixstatic.com/media/07221c_24d1a5224a3a4efdba5941d80526de9d~mv2.png?originWidth=448&originHeight=640',
    },
    {
      name: 'Anjali Patel',
      role: 'Operations Manager',
      image: 'https://static.wixstatic.com/media/07221c_b9f5ac481d3e4258b0892671da656df3~mv2.png?originWidth=448&originHeight=640',
    },
  ];

  const values = [
    {
      title: 'Authenticity',
      description: 'We preserve traditional Kalamkari techniques while embracing contemporary design sensibilities.',
    },
    {
      title: 'Quality',
      description: 'Every saree is crafted with premium natural fabrics and traditional dyes for unparalleled quality.',
    },
    {
      title: 'Sustainability',
      description: 'We are committed to eco-friendly practices and supporting local artisan communities.',
    },
    {
      title: 'Heritage',
      description: 'Our mission is to keep the rich heritage of Indian textile traditions alive for future generations.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background relative">
      <DecorativePattern className="text-primary/5" opacity="opacity-3" />
      <FloatingDots className="text-accent-color" count={10} />
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=1920&originHeight=1024"
            alt="Kalamkari artisans at work"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 max-w-[100rem] mx-auto px-4 md:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-heading font-bold text-primary-foreground mb-4"
          >
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto"
          >
            Celebrating the timeless art of Kalamkari and the artisans who keep this heritage alive.
          </motion.p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image
                src="https://static.wixstatic.com/media/07221c_2d9705923c15466887b842567c2d0261~mv2.png?originWidth=768&originHeight=768"
                alt="Kalamkari artisan painting fabric"
                className="w-full h-auto rounded-lg shadow-sm"
                width={600}
                height={600}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="font-heading text-primary text-lg mb-2">Our Mission</p>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
                Preserving Tradition, Creating Beauty
              </h2>
              <div className="font-paragraph text-lg text-foreground/80 space-y-4 leading-relaxed">
                <p>
                  Kalamkari is more than just a textile art form—it is a living narrative of centuries-old craftsmanship. At Kalamkari Collective, we are dedicated to preserving this ancient tradition while making it accessible to the modern world.
                </p>
                <p>
                  Founded in 2020, our journey began with a simple vision: to celebrate the extraordinary talent of master artisans and bring their handcrafted creations to those who appreciate true artistry and cultural heritage.
                </p>
                <p>
                  Every saree in our collection is a testament to the skill, patience, and passion of our artisans. We work directly with these talented craftspeople, ensuring fair compensation and sustainable practices that honor both the art and the artists.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="w-full py-24 md:py-32 bg-secondary/30">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Our Core Values
            </h2>
            <p className="font-paragraph text-lg text-foreground/80">
              These principles guide everything we do, from sourcing materials to serving our customers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 relative"
              >
                <DecorativeBorder position="left" className="opacity-30" />
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-heading font-bold text-primary">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="font-paragraph text-foreground/70 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Meet Our Team
            </h2>
            <p className="font-paragraph text-lg text-foreground/80">
              Passionate individuals dedicated to bringing Kalamkari to the world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-6 overflow-hidden rounded-lg">
                  <Image
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                    width={400}
                    height={500}
                  />
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {member.name}
                </h3>
                <p className="font-paragraph text-lg text-primary mb-4">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full py-24 md:py-32 bg-secondary/30">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
                Why Choose Kalamkari Collective?
              </h2>
              <div className="space-y-6">
                {[
                  'Authentic hand-painted sarees crafted by master artisans',
                  'Premium natural fabrics and traditional dyes',
                  'Direct support to artisan communities',
                  'Eco-friendly and sustainable practices',
                  'Unique, one-of-a-kind pieces',
                  'Exceptional customer service and support',
                ].map((reason, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-paragraph text-lg text-foreground/80">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image
                src="https://static.wixstatic.com/media/07221c_34372093ed9d4c35aa96a263080fe962~mv2.png?originWidth=448&originHeight=640"
                alt="Stack of colorful Kalamkari sarees"
                className="w-full h-auto rounded-lg shadow-sm"
                width={500}
                height={700}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Experience the Kalamkari Difference
            </h2>
            <p className="font-paragraph text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
              Explore our collection and discover the beauty of handcrafted Kalamkari sarees.
            </p>
            <Link to="/shop">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg rounded-sm font-paragraph group">
                Shop Now <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
