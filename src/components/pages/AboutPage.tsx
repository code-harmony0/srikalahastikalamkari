import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Award, Users, Leaf } from 'lucide-react';
import { ChanderiPattern, DecorativeBorder } from '@/components/ui/decorative-pattern';

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
      icon: Heart,
      color: 'from-rose-500/10 to-pink-500/10',
      iconColor: 'text-rose-600'
    },
    {
      title: 'Quality',
      description: 'Every saree is crafted with premium natural fabrics and traditional dyes for unparalleled quality.',
      icon: Award,
      color: 'from-amber-500/10 to-orange-500/10',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Sustainability',
      description: 'We are committed to eco-friendly practices and supporting local artisan communities.',
      icon: Leaf,
      color: 'from-green-500/10 to-emerald-500/10',
      iconColor: 'text-green-600'
    },
    {
      title: 'Heritage',
      description: 'Our mission is to keep the rich heritage of Indian textile traditions alive for future generations.',
      icon: Users,
      color: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-600'
    },
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Our Story - Kalamkari Heritage | Authentic Handcrafted Sarees</title>
      <meta 
        name="description" 
        content="Discover the story behind Kalamkari Heritage. Learn about our mission to preserve traditional Indian textile arts, our master artisans, and our commitment to sustainable, authentic handcrafted sarees." 
      />
      <meta name="keywords" content="Kalamkari story, traditional Indian textiles, handcrafted sarees, artisan heritage, sustainable fashion, authentic Kalamkari" />
      <meta property="og:title" content="Our Story - Kalamkari Heritage | Authentic Handcrafted Sarees" />
      <meta property="og:description" content="Discover the story behind Kalamkari Heritage and our mission to preserve traditional Indian textile arts through authentic handcrafted sarees." />
      <meta property="og:image" content="https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=1920&originHeight=1024" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Our Story - Kalamkari Heritage" />
      <meta name="twitter:description" content="Discover our mission to preserve traditional Indian textile arts through authentic handcrafted Kalamkari sarees." />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Kalamkari Heritage",
          "description": "Authentic handcrafted Kalamkari sarees preserving traditional Indian textile arts",
          "url": "https://kalamkariheritage.com/about",
          "logo": "https://kalamkariheritage.com/logo.png",
          "foundingDate": "2020",
          "founder": [
            {
              "@type": "Person",
              "name": "Priya Sharma",
              "jobTitle": "Founder & Creative Director"
            }
          ],
          "employee": [
            {
              "@type": "Person",
              "name": "Rajesh Kumar",
              "jobTitle": "Master Artisan"
            },
            {
              "@type": "Person", 
              "name": "Anjali Patel",
              "jobTitle": "Operations Manager"
            }
          ],
          "sameAs": [
            "https://www.instagram.com/kalamkariheritage",
            "https://www.facebook.com/kalamkariheritage"
          ]
        })}
      </script>

    <div className="w-full min-h-screen bg-background relative">
      <ChanderiPattern className="text-primary/5" opacity="opacity-3" />
      
      {/* Hero Section - Optimized spacing */}
      <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=1920&originHeight=1024"
            alt="Master Kalamkari artisans carefully hand-painting intricate traditional patterns on natural fabric in their heritage workshop"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            loading="eager"
            sizes="100vw"
            srcSet="
              https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=768&originHeight=410 768w,
              https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=1200&originHeight=640 1200w,
              https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=1920&originHeight=1024 1920w
            "
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground leading-tight tracking-tight">
              Our Story
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl text-primary-foreground/95 max-w-3xl mx-auto leading-relaxed font-paragraph"
            >
              Celebrating the timeless art of Kalamkari and the master artisans who keep this ancient heritage alive through every brushstroke.
            </motion.p>
            
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
                className="w-6 h-10 border-2 border-primary-foreground/60 rounded-full mx-auto flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-3 bg-primary-foreground/80 rounded-full mt-2"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Mission - Optimized spacing and balanced columns */}
      <section className="w-full py-20 md:py-24">
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
                  alt="Skilled Kalamkari artisan delicately hand-painting traditional motifs with natural dyes on premium cotton fabric"
                  className="w-full h-auto rounded-xl shadow-lg transition-all duration-500 group-hover:shadow-xl"
                  width={600}
                  height={600}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  srcSet="
                    https://static.wixstatic.com/media/07221c_2d9705923c15466887b842567c2d0261~mv2.png?originWidth=400&originHeight=400 400w,
                    https://static.wixstatic.com/media/07221c_2d9705923c15466887b842567c2d0261~mv2.png?originWidth=600&originHeight=600 600w,
                    https://static.wixstatic.com/media/07221c_2d9705923c15466887b842567c2d0261~mv2.png?originWidth=768&originHeight=768 768w
                  "
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
                  Preserving Tradition,{' '}
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
                  Kalamkari is more than just a textile art form—it is a living narrative of centuries-old craftsmanship. At Kalamkari Heritage, we are dedicated to preserving this ancient tradition while making it accessible to the modern world.
                </p>
                <p>
                  Founded in 2020, our journey began with a simple vision: to celebrate the extraordinary talent of master artisans and bring their handcrafted creations to those who appreciate true artistry and cultural heritage.
                </p>
                <p>
                  Every saree in our collection is a testament to the skill, patience, and passion of our artisans. We work directly with these talented craftspeople, ensuring fair compensation and sustainable practices that honor both the art and the artists.
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
                {[
                  { number: "50+", label: "Master Artisans" },
                  { number: "1000+", label: "Happy Customers" },
                  { number: "4", label: "Years of Heritage" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl md:text-2xl font-heading font-bold text-primary">{stat.number}</div>
                    <div className="text-xs md:text-sm text-foreground/70 font-paragraph">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values - Modernized card grid with reduced padding */}
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
              These principles guide everything we do, from sourcing materials to serving our customers with excellence.
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
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-md border border-gray-100/60 relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-primary/15">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    {/* Decorative border */}
                    <DecorativeBorder position="left" className="opacity-15 group-hover:opacity-30 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent-color/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <IconComponent className={`w-6 h-6 ${value.iconColor} group-hover:scale-105 transition-transform duration-300`} />
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

      {/* Our Team - Aligned and refined spacing */}
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
              Passionate individuals dedicated to bringing the beauty of Kalamkari to the world through authentic craftsmanship.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group text-center"
              >
                {/* Enhanced image container */}
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src={member.image}
                      alt={`${member.name}, ${member.role} at Kalamkari Heritage, dedicated to preserving traditional textile arts`}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      width={400}
                      height={500}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      srcSet="
                        https://static.wixstatic.com/media/07221c_a472c3ef713149fc9e659225e7b494f5~mv2.png?originWidth=300&originHeight=400 300w,
                        https://static.wixstatic.com/media/07221c_a472c3ef713149fc9e659225e7b494f5~mv2.png?originWidth=400&originHeight=500 400w,
                        https://static.wixstatic.com/media/07221c_a472c3ef713149fc9e659225e7b494f5~mv2.png?originWidth=448&originHeight=640 448w
                      "
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
                  <p className="font-paragraph text-base text-primary/80 font-medium">
                    {member.role}
                  </p>
                  
                  {/* Decorative line */}
                  <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent-color mx-auto opacity-60 group-hover:opacity-100 group-hover:w-16 transition-all duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Balanced layout with consistent spacing */}
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
                  Why Choose{' '}
                  <span className="text-primary">Kalamkari Heritage?</span>
                </h2>
              </div>
              
              <div className="space-y-4">
                {[
                  'Authentic hand-painted sarees crafted by master artisans',
                  'Premium natural fabrics and traditional dyes',
                  'Direct support to artisan communities',
                  'Eco-friendly and sustainable practices',
                  'Unique, one-of-a-kind pieces',
                  'Exceptional customer service and support',
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
                      <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
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
                alt="Beautiful collection of vibrant handcrafted Kalamkari sarees showcasing traditional patterns and premium natural fabrics"
                className="w-full h-auto rounded-xl shadow-lg transition-all duration-500 group-hover:shadow-xl"
                width={500}
                height={700}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                srcSet="
                  https://static.wixstatic.com/media/07221c_34372093ed9d4c35aa96a263080fe962~mv2.png?originWidth=300&originHeight=428 300w,
                  https://static.wixstatic.com/media/07221c_34372093ed9d4c35aa96a263080fe962~mv2.png?originWidth=400&originHeight=571 400w,
                  https://static.wixstatic.com/media/07221c_34372093ed9d4c35aa96a263080fe962~mv2.png?originWidth=448&originHeight=640 448w
                "
              />
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/5 to-accent-color/5 rounded-2xl -z-10 transition-all duration-500 group-hover:from-primary/8 group-hover:to-accent-color/8"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Polished with consistent spacing */}
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
                Experience the{' '}
                <span className="text-primary">Kalamkari Difference</span>
              </h2>
              <p className="font-paragraph text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                Explore our collection and discover the beauty of handcrafted Kalamkari sarees that tell stories of tradition, artistry, and timeless elegance.
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="pt-2"
            >
              <Link to="/shop">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg rounded-lg font-paragraph group transition-all duration-300 hover:shadow-lg hover:scale-102"
                  aria-label="Shop our collection of authentic Kalamkari sarees"
                >
                  Shop Our Collection
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}
