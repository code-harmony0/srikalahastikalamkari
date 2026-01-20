"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useAnimation, useInView } from 'framer-motion';
import { productsService } from '@/backend/products';
import { promotionsService } from '@/backend/promotions';
import { Product, Promotion } from '@/shared/types';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { ArrowRight, ShoppingBag, Sparkles, Star, Heart, Award, Users, Palette, Scissors } from 'lucide-react';
import { KanjeevaramPattern, DiagonalKalamkariPattern } from '@/shared/ui/decorative-pattern';

type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className, delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    element.classList.add('is-visible');
                }, delay);
                observer.unobserve(element);
            }
        }, { threshold: 0.1 });

        observer.observe(element);
        return () => observer.disconnect();
    }, [delay]);

    return <div ref={ref} className={`${className || ''} animate-reveal`}>{children}</div>;
};

// Count-up animation component for numbers
const CountUpNumber = ({ 
  end, 
  duration = 2000, 
  className = '', 
  suffix = '',
  prefix = ''
}: { 
  end: number; 
  duration?: number; 
  className?: string; 
  suffix?: string;
  prefix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isInView]);

  return (
    <div ref={ref} className={className}>
      {prefix}{count}{suffix}
    </div>
  );
};

// Premium decorative pattern component for sophisticated heritage branding
const DecorativePattern = ({ className = '', animated = false }: { className?: string; animated?: boolean }) => (
  <KanjeevaramPattern className={className} opacity="opacity-5" />
);

// Kalamkari Hero Background - Diagonal flowing paisley pattern with fabric depth
const KalamkariHeroBackground = ({ className = '', animated = false }: { className?: string; animated?: boolean }) => (
  <DiagonalKalamkariPattern className={className} opacity="opacity-10" animated={animated} />
);

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [textColor] = useState('text-white'); // Fixed to white for maximum clarity
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroControls = useAnimation();
  
  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // High-quality REAL Kalamkari saree fabric photographs with handcrafted patterns (LOCAL)
  const heroBackgroundImages = [
    {
      src: '/images/hero/hero-1.png',
      alt: 'High-quality photograph of authentic Kalamkari saree fabric showing real handcrafted floral vine patterns with delicate leaves, natural dyes in warm earthy tones, soft cloth folds visible',
      brightness: 'medium'
    },
    {
      src: '/images/hero/hero-2.png',
      alt: 'High-quality photograph of authentic Kalamkari saree fabric showing real handcrafted peacock patterns with elaborate feather details, natural dyes in warm earthy tones, soft cloth folds visible',
      brightness: 'medium'
    },
    {
      src: '/images/hero/hero-3.png',
      alt: 'High-quality photograph of authentic Kalamkari saree fabric showing real handcrafted intricate paisley patterns, natural dyes in warm earthy tones, soft cloth folds visible',
      brightness: 'medium'
    },
    {
      src: '/images/hero/hero-4.png',
      alt: 'High-quality photograph of authentic Kalamkari saree fabric showing real handcrafted lotus flower patterns with botanical elements, natural dyes in warm earthy tones, soft cloth folds visible',
      brightness: 'medium'
    },
    {
      src: '/images/hero/hero-5.png',
      alt: 'High-quality photograph of authentic Kalamkari saree fabric showing real handcrafted mixed traditional patterns with floral vines and paisleys, natural dyes in warm earthy tones, soft cloth folds visible',
      brightness: 'medium'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProducts, activePromotions] = await Promise.all([
          productsService.getAll(),
          promotionsService.getActive(),
        ]);

        const featured = allProducts.filter(p => p.isFeatured).slice(0, 4);

        setFeaturedProducts(featured);
        setPromotions(activePromotions.slice(0, 2));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Slow fade between images every 4-6 seconds as requested
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroBackgroundImages.length
      );
    }, 4500); // 4.5 seconds - within 4-6s range for optimal viewing

    return () => clearInterval(interval);
  }, [heroBackgroundImages.length]);

  // GSAP-style hero entrance animation
  useEffect(() => {
    heroControls.start({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 2.5,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for GSAP feel
        staggerChildren: 0.3
      }
    });
  }, [heroControls]);

  // Remove duplicate background image carousel effect
  // (keeping only the one above for 5-second intervals)

  // Auto-scroll gallery
  useEffect(() => {
    const scrollContainer = galleryScrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    let isAutoScrolling = true;
    let lastInteractionTime = Date.now();

    const autoScroll = () => {
      if (!isAutoScrolling || !scrollContainer) return;

      // Check if user has interacted recently (pause auto-scroll for 5 seconds after interaction)
      if (Date.now() - lastInteractionTime < 5000) {
        return;
      }

      scrollPosition += 2;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      if (scrollPosition >= maxScroll) {
        scrollPosition = 0; // Loop back to start
      }

      scrollContainer.scrollLeft = scrollPosition;
    };

    const scrollInterval = setInterval(autoScroll, 50);

    // Pause auto-scroll on user interaction
    const handleUserInteraction = () => {
      lastInteractionTime = Date.now();
    };

    scrollContainer.addEventListener('wheel', handleUserInteraction);
    scrollContainer.addEventListener('touchstart', handleUserInteraction);
    scrollContainer.addEventListener('mousedown', handleUserInteraction);

    return () => {
      clearInterval(scrollInterval);
      scrollContainer.removeEventListener('wheel', handleUserInteraction);
      scrollContainer.removeEventListener('touchstart', handleUserInteraction);
      scrollContainer.removeEventListener('mousedown', handleUserInteraction);
    };
  }, []);

  const whyChooseUsItems = [
    {
      icon: Award,
      title: 'Authentic Craftsmanship',
      description: 'Each saree is hand-painted by skilled artisans using traditional Kalamkari techniques passed through generations.',
      highlight: '500+ Years of Heritage'
    },
    {
      icon: Palette,
      title: 'Premium Natural Materials',
      description: 'We use only the finest natural fabrics like pure silk and organic cotton, with eco-friendly natural dyes.',
      highlight: '100% Natural & Sustainable'
    },
    {
      icon: Users,
      title: 'Artisan Empowerment',
      description: 'Your purchase directly supports artisan families, helping preserve cultural heritage and traditional livelihoods.',
      highlight: '200+ Artisan Families Supported'
    }
  ];

  const galleryImages = [
    {
      src: "/images/gallery/gallery-1.png",
      alt: "Elegant woman in vibrant Kalamkari saree",
      category: "Human Connection",
      tone: "Warm"
    },
    {
      src: "/images/gallery/gallery-2.png",
      alt: "Close-up of hand-painted floral motifs",
      category: "Hero Textile",
      tone: "Neutral"
    },
    {
      src: "/images/gallery/gallery-3.png",
      alt: "Master artisan at work in Srikalahasti",
      category: "Human Connection",
      tone: "Artisan"
    },
    {
      src: "/images/gallery/gallery-4.png",
      alt: "Natural dye extraction from temple flowers",
      category: "Cultural Detail",
      tone: "Bright"
    },
    {
      src: "/images/gallery/gallery-5.png",
      alt: "Intricate texture of handwoven silk",
      category: "Hero Textile",
      tone: "Textural"
    },
    {
      src: "/images/gallery/gallery-6.png",
      alt: "Heritage display of 500-year old patterns",
      category: "Cultural Detail",
      tone: "Warm"
    },
  ];

  return (
    <>
      <main className="w-full kalamkari-static-background silk-fabric-texture text-foreground overflow-hidden">
        {/* Cinematic Hero Section - Calm, High-End Look */}
        <section 
          ref={heroRef}
          className="relative w-full min-h-[95vh] grid lg:grid-cols-2 overflow-hidden bg-[#FFF8F0]"
          role="banner"
          aria-label="Srikalahasti Kalamkari - Cinematic Collection"
        >
        {/* LEFT COLUMN: Narrative & Actions */}
        <div className="relative z-20 flex flex-col justify-center px-6 md:px-12 lg:px-24 py-20 lg:py-0 order-2 lg:order-1 border-r border-[#D4A05A]/10">
           {/* Subtle Background Pattern for Texture */}
           <div 
             className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A65329' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             }}
           />

           <div className="relative max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="w-16 h-px bg-[#A65329]"></div>
                  <span className="text-xs font-bold text-[#A65329] uppercase tracking-[0.3em]">Est. 2026</span>
                </div>

                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-[#3B2C23] mb-6 tracking-tight">
                  <span className="block text-[#A65329] text-2xl md:text-3xl lg:text-4xl mb-2 font-medium italic">Srikalahasti</span>
                  KALAMKARI
                </h1>

                <p className="font-sans text-lg md:text-xl text-[#3B2C23]/80 mb-10 leading-relaxed font-light">
                  Where every thread tells the story of timeless craftsmanship. Hand-painted masterpieces using natural dyes and ancient techniques.
                </p>

                {/* Unified Button Group */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full">
                  <Link href="/products" className="w-full sm:w-auto">
                    <Button 
                      className="w-full sm:w-[200px] h-14 rounded-xl text-base font-medium bg-[#A65329] text-[#FFF8F0] hover:bg-[#8B4513] hover:-translate-y-1 shadow-[0_4px_14px_rgba(166,83,41,0.3)] hover:shadow-[0_8px_24px_rgba(166,83,41,0.5)] transition-all duration-300 border border-transparent"
                    >
                      Shop Collection
                    </Button>
                  </Link>
                  
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-[200px] h-14 rounded-xl text-base font-medium bg-transparent border border-[#A65329]/30 text-[#A65329] hover:bg-[#A65329]/5 hover:border-[#A65329] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 md:bg-transparent"
                    >
                      Discover Our Story
                    </Button>
                  </Link>
                </div>
              </motion.div>
           </div>
           
           {/* Scroll Cue (Left Aligned on Desktop) */}
           <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute bottom-10 left-12 hidden lg:flex items-center gap-4"
           >
             <span className="text-[10px] uppercase tracking-[0.2em] text-[#3B2C23]/60 transform -rotate-90 origin-left translate-y-8">Scroll</span>
             <div className="h-24 w-px bg-gradient-to-b from-[#A65329] to-transparent opacity-40"></div>
           </motion.div>
        </div>
        
        {/* RIGHT COLUMN: Visual & Parallax */}
        <div className="relative order-1 lg:order-2 h-[60vh] lg:h-auto overflow-hidden">
          <motion.div 
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 w-full h-[120%]"
          >
             {heroBackgroundImages.map((image, index) => (
                <Image
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  fill
                  className={`object-cover transition-opacity duration-[2000ms] ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                  priority={index === 0}
                />
              ))}
              
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-black/20 via-transparent to-transparent opacity-30"></div>
              
              {/* Fabric Grain Texture */}
              <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
              </div>
          </motion.div>
        </div>

        </section>

        {/* SECTION 2: Masterpieces of Heritage (2026 Redesign - Polished) */}
        <section className="w-full py-16 md:py-24 relative overflow-hidden">
           {/* Section Background Gradient: Ivory -> Pale Beige */}
           <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F0] to-[#FFF4E8] z-0" />

           {/* Top Wave Divider - Subtle Shadow & Texture */}
           <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 opacity-90 drop-shadow-sm">
             <svg className="relative block w-[calc(100%+1.3px)] h-[60px] text-[#FFF8F0]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                 <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#FFF8F0]"></path>
             </svg>
           </div>
           
           {/* Background Pattern - 8% Opacity (Less Repetitive) */}
           <div 
             className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-multiply"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30l5 5m-5-5l5-5m-5 5l-5 5m5-5l-5-5' stroke='%233B2C23' stroke-width='1' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
               backgroundSize: "60px 60px"
             }}
           />

           <div className="max-w-[120rem] mx-auto px-4 md:px-6 lg:px-8 relative z-20">
             <AnimatedElement>
               {/* Intro Block - Reduced Spacing & Connected Flow */}
               <div className="text-center mb-12 md:mb-16">
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="mb-3"
                 >
                   <span className="font-sans text-[12px] font-bold text-[#C19A5B] uppercase tracking-[0.2em]">
                     Curated Collection
                   </span>
                 </motion.div>
                 
                 <h2 className="font-serif text-4xl md:text-5xl lg:text-[42px] font-bold text-[#3B2C23] mb-5 leading-tight tracking-[0.5px]">
                   Masterpieces of Heritage
                 </h2>
                 
                 <p className="font-sans text-[17px] text-[#3B2C23]/80 max-w-2xl mx-auto leading-relaxed font-light">
                   Hand-painted masterpieces telling ancient stories through natural dyes and intricate craftsmanship.
                 </p>
               </div>
             </AnimatedElement>

             {/* Teaser Cards Row (Replacing Grid for Editorial Feel) */}
             <div className="mb-12">
               {loading ? (
                 <div className="flex flex-col md:flex-row justify-center gap-6">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="h-32 w-full md:w-1/3 bg-[#3B2C23]/5 rounded-xl animate-pulse" />
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col md:flex-row justify-center gap-5 lg:gap-8 max-w-5xl mx-auto">
                   {featuredProducts.slice(0, 3).map((product, index) => (
                     <AnimatedElement key={product.id} delay={index * 100} className="flex-1">
                       <Link
                         href={`/products/${product.slug || product.id}`}
                         className="group block h-full focus:outline-none"
                       >
                         <motion.article
                           className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-[#3B2C23]/5 shadow-sm hover:shadow-[0_8px_24px_rgba(166,83,41,0.12)] transition-all duration-300 h-full"
                           whileHover={{ y: -4 }}
                         >
                           {/* Small Image */}
                           <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                             <Image
                               src={product.mainImage || "/images/products/product-placeholder.png"}
                               alt={product.title || "Srikalahasti Kalamkari Saree"}
                               fill
                               className="object-cover group-hover:scale-110 transition-transform duration-500"
                               sizes="80px"
                             />
                           </div>
                           
                           {/* Content */}
                           <div className="flex-grow min-w-0">
                             <h3 className="font-serif text-[18px] text-[#3B2C23] mb-1 truncate group-hover:text-[#A65329] transition-colors">
                               {product.title}
                             </h3>
                             <p className="text-xs font-sans text-[#3B2C23]/60 uppercase tracking-widest mb-2">
                               Hand-painted Elegance
                             </p>
                             <span className="text-sm font-medium text-[#A65329]">View Details →</span>
                           </div>
                         </motion.article>
                       </Link>
                     </AnimatedElement>
                   ))}
                 </div>
               )}
             </div>

             {/* Centered CTA - Linked to Grid */}
             <div className="text-center mt-8">
               <Link href="/products">
                 <Button 
                   className="h-12 px-10 rounded-[10px] bg-transparent border border-[#C19A5B]/60 text-[#3B2C23] hover:bg-[#A65329] hover:text-white hover:border-[#A65329] transition-all duration-300 font-medium text-sm tracking-wide shadow-sm hover:shadow-lg"
                 >
                   View Complete Collection
                 </Button>
               </Link>
             </div>
           </div>
        </section>

        {/* The Soul of the Artisan Section - Refined Polish (Section 3) */}
        <section className="w-full py-20 md:py-24 relative overflow-hidden">
           {/* Section Divider with Faint Shadow */}
           <div className="absolute top-0 left-0 w-full h-px bg-[#D4A05A]/20 shadow-[0_2px_4px_rgba(0,0,0,0.02)] z-10" />

           {/* Background: Soft Beige -> Cream + Faint Fabric Texture */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4E8] to-[#FFF8F0] z-0" />
           <div 
             className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-multiply"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%233B2C23'/%3E%3C/svg%3E")`,
               backgroundSize: "20px 20px"
             }}
           />

          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 relative z-20">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Image Block - Aligned Flush Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, x: -20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="lg:col-span-6 order-2 lg:order-1"
              >
                <div className="relative group">
                  {/* Main Image Container */}
                  <div className="relative overflow-hidden rounded-[16px] shadow-2xl transition-all duration-700">
                    <Image
                      src="/images/products/artisan.png"
                      alt="Master artisan carefully painting traditional Kalamkari designs"
                      className="w-full aspect-[4/5] object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                      width={600}
                      height={750}
                    />
                    <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:opacity-0"></div>
                  </div>

                  {/* Stat Card: Heritage Years */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="absolute -bottom-8 -right-8 bg-[#FFF8F0]/95 backdrop-blur-md rounded-[12px] p-6 shadow-[0_8px_32px_rgba(59,44,35,0.1)] border border-[#D4A05A]/20"
                  >
                    <CountUpNumber 
                      end={500} 
                      duration={2000}
                      className="text-3xl font-serif font-bold text-[#A65329] mb-1"
                      suffix="+"
                    />
                    <div className="text-sm font-sans text-[#3B2C23]/80 font-medium tracking-wide">Years Heritage</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Text Block - Narrower & Refined */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className="lg:col-span-6 order-1 lg:order-2 lg:pl-8"
              >
                {/* Tag */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#A65329]"></span>
                  <span className="font-sans text-[11px] font-bold text-[#A65329] uppercase tracking-[0.25em]">
                    Our Heritage
                  </span>
                </div>
                
                {/* Heading */}
                <h2 className="font-serif text-4xl md:text-5xl lg:text-[56px] text-[#3B2C23] mb-8 leading-[1.1] tracking-tight">
                  The Soul of the <br/>
                  <span className="text-[#A65329] italic">Artisan</span>
                </h2>
                
                {/* Content */}
                <div className="space-y-6 mb-10 max-w-xl">
                  <p className="font-sans text-[17px] text-[#3B2C23]/85 leading-relaxed font-light">
                    Kalamkari is more than an art form; it is a living narrative whispered through generations. Derived from 'kalam' (pen) and 'kari' (craftsmanship), it describes the meticulous process of hand-painting textiles.
                  </p>
                  
                  {/* Quote */}
                  <blockquote className="border-l-2 border-[#D4A05A]/40 pl-6 my-6">
                    <p className="font-serif text-lg text-[#3B2C23]/90 italic leading-relaxed">
                      "Every thread tells a story. Every color carries history."
                    </p>
                  </blockquote>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg">
                   {/* Card 1 */}
                   <div className="p-4 bg-white/50 rounded-[10px] border border-[#3B2C23]/5 shadow-inner flex items-center gap-4 transition-all hover:bg-white/80 hover:shadow-md hover:scale-[1.02]">
                      <div className="p-2 bg-[#A65329]/10 rounded-lg text-[#A65329]">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-serif text-2xl font-bold text-[#3B2C23]">200+</div>
                        <div className="text-[11px] uppercase tracking-wider text-[#3B2C23]/60">Master Artisans</div>
                      </div>
                   </div>

                   {/* Card 2 */}
                   <div className="p-4 bg-white/50 rounded-[10px] border border-[#3B2C23]/5 shadow-inner flex items-center gap-4 transition-all hover:bg-white/80 hover:shadow-md hover:scale-[1.02]">
                      <div className="p-2 bg-[#D4A05A]/10 rounded-lg text-[#D4A05A]">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-serif text-2xl font-bold text-[#3B2C23]">100%</div>
                        <div className="text-[11px] uppercase tracking-wider text-[#3B2C23]/60">Natural Dyes</div>
                      </div>
                   </div>
                </div>
                
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/about">
                      <Button 
                        className="h-[52px] px-8 rounded-[10px] bg-[#A65329] text-white hover:bg-[#8B4420] transition-all shadow-lg hover:shadow-xl text-[15px] font-medium tracking-wide focus:ring-2 focus:ring-[#C19A5B] focus:ring-offset-2"
                      >
                        Discover the Craft
                      </Button>
                    </Link>
                    <Link href="/values">
                      <Button 
                        variant="outline"
                        className="h-[52px] px-8 rounded-[10px] border-[#3B2C23]/20 text-[#3B2C23] hover:bg-[#3B2C23]/5 hover:border-[#3B2C23]/40 transition-all text-[15px] font-medium tracking-wide focus:ring-2 focus:ring-[#C19A5B] focus:ring-offset-2 bg-transparent"
                      >
                        Our Story
                      </Button>
                    </Link>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Faint Watermark (Bottom Right) */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-[0.03] pointer-events-none rotate-12 text-[#3B2C23]">
             <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 0C100 0 130 50 180 80C130 90 100 130 100 200C100 130 70 90 20 80C70 50 100 0 100 0Z" />
                <circle cx="100" cy="100" r="10" />
             </svg>
          </div>
        </section>

        {/* Seasonal Offerings Section - Modern Tactile Cards with Editorial Feel */}
        {promotions.length > 0 && (
          <section className="w-full pt-16 pb-24 md:pb-32 relative overflow-hidden">
            <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 mb-12">
               <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E5B97C]/50 to-transparent" />
            </div>
            
            <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              {/* Editorial Header with Luxury Typography */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <div className="flex items-center justify-center gap-6 mb-8">
                  <motion.div 
                    className="w-24 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    viewport={{ once: true }}
                  />
                  <span className="font-paragraph text-sm font-bold text-accent-color uppercase tracking-[0.3em] relative">
                    Limited Time
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent-color/30"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      viewport={{ once: true }}
                    />
                  </span>
                  <motion.div 
                    className="w-24 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    viewport={{ once: true }}
                  />
                </div>
                
                <motion.h2 
                  className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-[0.9] tracking-tight font-light"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Seasonal
                  <span className="block text-primary font-normal italic">Offerings</span>
                </motion.h2>
                
                <motion.p 
                  className="font-paragraph text-xl md:text-2xl text-foreground/75 max-w-4xl mx-auto leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  Discover our curated seasonal collections featuring exclusive designs and limited-edition pieces that celebrate the artistry of each season.
                </motion.p>
              </motion.div>

              {/* Modern Tactile Cards with Editorial Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {promotions[0] && (
                  <motion.article
                    initial={{ opacity: 0, x: -60, scale: 0.9 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    {/* Tactile Card Container */}
                    <motion.div
                      whileHover={{ y: -12, scale: 1.02 }}
                      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="relative overflow-hidden rounded-[2rem] shadow-2xl hover:shadow-3xl transition-all duration-700 bg-white/95 backdrop-blur-md border border-white/60"
                    >
                      {/* Kalamkari Motif Overlay on Card */}
                      <div className="absolute inset-0 opacity-2 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23A0522D' fill-opacity='0.04'%3E%3Cpath d='M40 20c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3Cpath d='M40 30c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                      
                      {/* Image Container with Parallax */}
                      <div className="relative h-[480px] md:h-[520px] overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="w-full h-full"
                        >
                          <Image
                            src={promotions[0].bannerImage || "/images/promotions/promo-1.png"}
                            alt={promotions[0].title || 'Seasonal Promotion'}
                            className="w-full h-full object-cover"
                            width={800}
                            height={520}
                          />
                        </motion.div>
                        
                        {/* Sophisticated Hover Overlay */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                          initial={{ opacity: 0.7 }}
                          whileHover={{ opacity: 0.9 }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        {/* Editorial Content Overlay */}
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1, delay: 0.3 }}
                          viewport={{ once: true }}
                          className="absolute bottom-0 left-0 right-0 p-10 md:p-12 text-white"
                        >
                          <motion.h3 
                            className="font-heading text-4xl md:text-5xl mb-6 font-light text-white leading-tight tracking-tight"
                            whileHover={{ scale: 1.02, x: 4 }}
                            transition={{ duration: 0.3 }}
                          >
                            {promotions[0].title}
                          </motion.h3>
                          
                          <p className="font-paragraph text-lg md:text-xl mb-8 text-white/95 leading-relaxed max-w-lg font-light">
                            {promotions[0].description}
                          </p>
                          
                          {/* Editorial CTA */}
                          <motion.div
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Button 
                              size="lg" 
                              className="h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-medium group transition-all duration-500 shadow-xl hover:shadow-2xl border-0 tracking-wide"
                              asChild
                            >
                              <a href={promotions[0].callToActionUrl}>
                                Shop Collection
                                <motion.span
                                  className="inline-block ml-3"
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  <ArrowRight className="h-6 w-6" />
                                </motion.span>
                              </a>
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.article>
                )}

                {promotions[1] && (
                  <motion.article
                    initial={{ opacity: 0, x: 60, scale: 0.9 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    {/* Tactile Card Container */}
                    <motion.div
                      whileHover={{ y: -12, scale: 1.02 }}
                      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="relative overflow-hidden rounded-[2rem] shadow-2xl hover:shadow-3xl transition-all duration-700 bg-white/95 backdrop-blur-md border border-white/60"
                    >
                      {/* Kalamkari Motif Overlay on Card */}
                      <div className="absolute inset-0 opacity-2 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B' fill-opacity='0.04'%3E%3Cpath d='M40 15c13.807 0 25 11.193 25 25s-11.193 25-25 25-25-11.193-25-25 11.193-25 25-25z'/%3E%3Cpath d='M40 25c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                      
                      {/* Image Container with Parallax */}
                      <div className="relative h-[480px] md:h-[520px] overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="w-full h-full"
                        >
                          <Image
                            src={promotions[1].bannerImage || "/images/promotions/promo-2.png"}
                            alt={promotions[1].title || 'Special Offer'}
                            className="w-full h-full object-cover"
                            width={800}
                            height={520}
                          />
                        </motion.div>
                        
                        {/* Sophisticated Hover Overlay */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                          initial={{ opacity: 0.7 }}
                          whileHover={{ opacity: 0.9 }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        {/* Editorial Content Overlay */}
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="absolute bottom-0 left-0 right-0 p-10 md:p-12 text-white"
                        >
                          <motion.h3 
                            className="font-heading text-4xl md:text-5xl mb-6 font-light text-white leading-tight tracking-tight"
                            whileHover={{ scale: 1.02, x: 4 }}
                            transition={{ duration: 0.3 }}
                          >
                            {promotions[1].title}
                          </motion.h3>
                          
                          <p className="font-paragraph text-lg md:text-xl mb-8 text-white/95 leading-relaxed max-w-lg font-light">
                            {promotions[1].description}
                          </p>
                          
                          {/* Editorial CTA */}
                          <motion.div
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Button 
                              variant="outline"
                              size="lg" 
                              className="h-14 px-10 text-lg rounded-2xl border-2 border-white/90 hover:bg-white/25 hover:border-white text-white font-medium transition-all duration-500 backdrop-blur-md bg-white/15 shadow-xl hover:shadow-2xl tracking-wide"
                              asChild
                            >
                              <a href={promotions[1].callToActionUrl}>
                                Explore Offers
                                <motion.span
                                  className="inline-block ml-3"
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  <ArrowRight className="h-6 w-6" />
                                </motion.span>
                              </a>
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.article>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Our Promise Section - Precision Polish 2026 */}
        <section className="w-full py-10 md:py-12 relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] to-[#FBEED8]">
          {/* Faint Kalamkari Motif Background */}
          <div 
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 20c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' stroke='%23A65329' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px"
            }}
          />
          
          <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
            {/* Compact Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-px bg-[#C19A5B]" />
                <span className="font-sans text-[10px] font-bold text-[#C19A5B] uppercase tracking-[0.2em]">
                  Our Promise
                </span>
                <div className="w-12 h-px bg-[#C19A5B]" />
              </div>
              
              <h2 className="font-serif text-3xl md:text-4xl text-[#3B2A1C] mb-3 leading-tight">
                The Srikalahasti <span className="text-[#A65329] italic">Promise</span>
              </h2>
            
              <p className="font-sans text-base text-[#493A2F]/90 leading-relaxed max-w-2xl mx-auto">
                Authentic experiences steeped in tradition, quality, and heritage.
              </p>
            </motion.div>

            {/* Promise Cards - Precision Refined */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyChooseUsItems.map((item, index) => (
                <AnimatedElement key={index} delay={index * 100}>
                  <motion.article
                    whileHover={{ y: -4, rotate: -1 }}
                    className="group relative h-full"
                  >
                    {/* Terracotta Hover Glow */}
                    <div className="absolute -inset-1 bg-[#C17C4E]/0 group-hover:bg-[#C17C4E]/25 rounded-[16px] blur-lg transition-all duration-500" />
                    
                    {/* Card with Darker Gradient */}
                    <div className="relative h-full bg-gradient-to-b from-[#FAF3E8] to-[#F5E8D4] rounded-xl py-8 px-6 shadow-[0_6px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_28px_rgba(193,124,78,0.12)] transition-all duration-500 border border-[#E6C595]/30 group-hover:border-[#C49353]/60 overflow-hidden">
                      
                      {/* Icon - Smaller with Gold Gradient */}
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E8C98C] to-[#C09A58] shadow-md">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Title - Playfair Bold 20px */}
                      <h3 className="font-serif text-[20px] font-bold text-[#3B2A1C] mb-2 text-center leading-tight">
                        {item.title}
                      </h3>

                      {/* Description - Inter 15px */}
                      <p className="font-sans text-[15px] text-[#493A2F]/90 leading-[1.5] text-center mb-4">
                        {item.description}
                      </p>
                      
                      {/* Badge - Inter SemiBold 13px */}
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1.5 bg-[#C19A5B]/8 rounded-full border border-[#C19A5B]/25 text-[13px] font-semibold text-[#B47A2B] group-hover:border-[#C19A5B]/50 transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-offset-1 group-hover:ring-[#C19A5B]/40">
                          <Sparkles className="w-3 h-3 mr-1.5 text-[#C19A5B]" />
                          {item.highlight}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* VISUAL GALLERY - Organic Editorial Mosaic (2026 Crafted) */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] to-[#F9EBD8]">
          {/* Parallax Background Pattern - 5% Gold Motif */}
          <motion.div 
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M70 10 L130 70 L70 130 L10 70 Z' fill='none' stroke='%23C8A874' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "280px 280px",
              y: useTransform(useScroll().scrollYProgress, [0, 1], [0, -150]) // Refined 0.4x-style drift
            }}
          />

          {/* Advanced Luxury: Looping Gold Thread Animation */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
            <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <motion.path
                d="M-50,200 C200,150 400,250 600,200 C800,150 1000,250 1250,200"
                fill="none"
                stroke="#C19A5B"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1], 
                  opacity: [0, 1, 1, 0],
                  x: [0, 50, 0]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              <motion.path
                d="M-50,600 C200,550 400,650 600,600 C800,550 1000,650 1250,600"
                fill="none"
                stroke="#C19A5B"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1], 
                  opacity: [0, 1, 1, 0],
                  x: [0, -40, 0]
                }}
                transition={{ 
                  duration: 12, 
                  delay: 2,
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </svg>
          </div>

          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
            {/* Aligned Global Header Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} // Refined rise 20px
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }} // Global easing
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-px bg-[#C19A5B]/40" />
                <span className="font-sans text-[12px] font-bold text-[#C19A5B] uppercase tracking-[0.2em]">
                  VISUAL GALLERY
                </span>
                <div className="w-10 h-px bg-[#C19A5B]/40" />
              </div>
              
              <h2 className="font-serif text-4xl md:text-5xl text-[#3A2A1C] mb-5 leading-tight relative inline-block">
                Woven in <span className="text-[#A65329] italic">Elegance</span>
                {/* Gold Underline Animation */}
                <motion.div 
                  className="absolute -bottom-2 left-0 h-px bg-[#C19A5B]/60"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                />
              </h2>
              
              <p className="font-sans text-base text-[#493A2F]/85 max-w-[680px] mx-auto leading-relaxed font-light">
                Explore the artistry and tradition of Srikalahasti Kalamkari through our curated visual journal.
              </p>
            </motion.div>

            {/* Organic Mosaic Grid - Fine-tuned Gaps: 20px H / 24px V */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-x-5 md:gap-y-6 auto-rows-[250px] md:auto-rows-[280px]">
              {galleryImages.map((image, index) => {
                let gridClasses = "md:col-span-1 md:row-span-1";
                if (index === 0) gridClasses = "md:col-span-2 md:row-span-1"; 
                if (index === 2) gridClasses = "md:col-span-1 md:row-span-2"; 
                if (index === 5) gridClasses = "md:col-span-2 md:row-span-1";

                return (
                  <AnimatedElement 
                    key={index} 
                    delay={index * 100} // Refined stagger 100ms
                    className={`${gridClasses} group relative`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.03 }} // Refined 1.03 scale
                      className="relative h-full w-full overflow-hidden rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] bg-white/50 backdrop-blur-sm transition-shadow duration-300 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Inner Shadow Simulation */}
                      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
                      
                      {/* Refined Soft Linear Gradient Overlay for Legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(35,22,10,0.55)] via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-75" />
                      
                      {/* Refined Hover Overlay Tint */}
                      <div className="absolute inset-0 bg-[#C19A5B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-[#C19A5B]/20 rounded-[14px] pointer-events-none" />

                      <div className="absolute bottom-6 left-6 overflow-hidden">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: (index * 0.1) + 0.25, duration: 0.4 }} // Staggered label reveal
                        >
                          <span className="font-serif italic text-[18px] text-[#F9E8CF] block drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] group-hover:text-[#FFD58C] transition-colors duration-300">
                             {image.category}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatedElement>
                );
              })}
            </div>
          </div>
        </section>
        {/* STORIES FROM OUR COMMUNITY — Social Proof Layer (KDLS 2026) */}
        <section className="w-full pt-24 pb-20 px-6 md:px-12 relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] to-[#FAEEDC]">
          <div className="max-w-[1240px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="flex flex-col items-center gap-2 mb-4">
                <span className="font-sans text-[13px] font-semibold text-[#C19A5B] uppercase tracking-[0.08em]">
                  AUTHENTIC VOICES
                </span>
                <div className="w-12 h-px bg-[#C19A5B]/30" />
              </div>
              <h2 className="font-serif text-[38px] md:text-[44px] text-[#3A2413] mb-4 font-bold">
                Stories from our <span className="text-[#B35D2E] italic font-medium">Community</span>
              </h2>
            </div>

            {/* Testimonial Layout: Featured (Full Width) + 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
              {/* Featured Story - Full Width */}
              <AnimatedElement className="md:col-span-12" delay={100}>
                <motion.div 
                  whileHover={{ y: -5, rotateZ: 0.5 }}
                  className="group relative p-10 md:p-12 bg-white/85 backdrop-blur-[8px] rounded-[14px] shadow-[0_8px_16px_rgba(0,0,0,0.05)] border border-[#C19A5B]/15 overflow-hidden"
                >
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 opacity-[0.04] pointer-events-none">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#C19A5B">
                      <path d="M50 10 C30 30, 70 30, 50 50 C30 70, 70 70, 50 90" strokeWidth="1" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="text-[60px] font-serif text-[#C19A5B] opacity-[0.08] leading-none mb-2">❝</div>
                    <p className="font-sans text-[18px] md:text-[20px] leading-[1.8] text-[#3A2413]/85 mb-8 italic">
                      "The intricate details and vibrant colors are breathtaking. Each piece tells a story that transcends time. Truly a masterpiece of Srikalahasti art, hand-painted with a soul that connects me to the divine heritage of India."
                    </p>
                    <div className="flex items-center gap-5 border-t border-[#C19A5B]/10 pt-8">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-[#FAEEDC] flex items-center justify-center border border-[#C19A5B]/20 shadow-sm">
                          <span className="text-[#B35D2E] font-serif italic text-xl font-bold">P</span>
                       </div>
                       <div>
                          <p className="font-serif text-[18px] font-semibold text-[#B35D2E]">Priya Sharma</p>
                          <p className="font-sans text-[13px] text-[#3A2413]/60">Mumbai, Maharashtra</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedElement>

              {/* Grid Stories - 3 Column Layout */}
              {[
                { quote: "I've never owned anything quite like this. The craftsmanship is impeccable, it feels like wearing liquid gold and centuries of tradition.", name: "Ananya Reddy", city: "Hyderabad" },
                { quote: "Absolutely stunning work. The natural dyes and hand-painted motifs make every saree unique. Worth every rupee for the authenticity.", name: "Lakshmi Iyer", city: "Chennai" },
                { quote: "Gifted this to my mother and she was moved to tears. The quality and authenticity are unmatched in today's machine-made world.", name: "Rajesh Kumar", city: "Bangalore" }
              ].map((item, idx) => (
                <AnimatedElement key={idx} className="md:col-span-4" delay={200 + idx * 100}>
                  <motion.div 
                    whileHover={{ y: -3, rotateZ: idx % 2 === 0 ? 0.5 : -0.5 }}
                    className="group relative p-8 bg-white/85 backdrop-blur-[6px] rounded-[14px] shadow-[0_8px_16px_rgba(0,0,0,0.05)] border border-[#C19A5B]/15 h-full flex flex-col justify-between"
                  >
                    <p className="font-sans text-[17px] leading-[1.8] text-[#3A2413]/85 mb-8">
                      {item.quote}
                    </p>
                    <div className="flex items-center gap-4 border-t border-[#C19A5B]/10 pt-6">
                       <div className="w-9 h-9 rounded-full bg-ivory flex items-center justify-center border border-[#C19A5B]/20">
                          <span className="text-[#B35D2E] font-serif italic text-base font-bold">{item.name[0]}</span>
                       </div>
                       <div>
                          <p className="font-serif text-[16px] font-semibold text-[#B35D2E] leading-none mb-1">{item.name}</p>
                          <p className="font-sans text-[12px] text-[#3A2413]/60">{item.city}</p>
                       </div>
                    </div>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>

            {/* TRUST ANCHORS — Quantitative Validation Layer (KDLS 2026) */}
            <div className="relative mt-24">
              {/* Woven Gold Line Divider */}
              <div className="w-[60%] h-px bg-[#C19A5B]/15 mx-auto mb-16 relative">
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#FFF8F0]">
                    <div className="w-2 h-2 rounded-full border border-[#C19A5B]/30" />
                 </div>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
                {[
                  { icon: Star, value: "4.9/5", label: "Customer Rating", order: "Experience" },
                  { icon: Scissors, value: "100%", label: "Handcrafted", order: "Quality" },
                  { icon: Users, value: "10K+", label: "Happy Customers", order: "Trust" }
                ].map((metric, idx) => (
                  <AnimatedElement key={idx} delay={400 + idx * 100}>
                    <motion.div 
                      whileHover={{ y: -4 }}
                      className="flex items-center gap-6 bg-gradient-to-b from-[#FFF8F0] to-[#FAEEDC] px-8 py-4 rounded-[48px] shadow-[0_6px_18px_rgba(0,0,0,0.04)] border border-[#C19A5B]/20 hover:shadow-[0_0_12px_rgba(193,154,91,0.25)] transition-all duration-300 min-w-[270px] group"
                    >
                      <div className="w-11 h-11 rounded-full border border-[#C19A5B]/40 bg-[#FFF8F0]/6 flex items-center justify-center flex-shrink-0 relative">
                         <motion.div 
                           animate={{ scale: [1, 1.05, 1] }} 
                           transition={{ duration: 0.18, repeat: Infinity, repeatType: "reverse", ease: "easeOut", repeatDelay: 5 }}
                         >
                           <metric.icon className="w-5 h-5 text-[#C19A5B]" />
                         </motion.div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif text-[20px] font-bold text-[#3A2413] leading-none mb-1">
                          {metric.value}
                        </span>
                        <span className="font-sans text-[13px] font-semibold text-[#B35D2E] tracking-[0.06em] uppercase">
                          {metric.label}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatedElement>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
