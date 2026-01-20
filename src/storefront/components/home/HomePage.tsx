"use client";

import { useEffect, useState, useRef } from 'react';
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
      alt: "Elegant woman in vibrant Kalamkari saree with intricate floral patterns",
      category: "Traditional Elegance"
    },
    {
      src: "/images/gallery/gallery-2.png",
      alt: "Close-up detail of hand-painted Kalamkari motifs on silk fabric",
      category: "Artisan Detail"
    },
    {
      src: "/images/gallery/gallery-3.png",
      alt: "Contemporary styling of traditional Kalamkari saree for modern occasions",
      category: "Modern Heritage"
    },
    {
      src: "/images/gallery/gallery-4.png",
      alt: "Master artisan carefully painting traditional designs with natural dyes",
      category: "Craft Process"
    },
    {
      src: "/images/gallery/gallery-5.png",
      alt: "Luxurious collection of Kalamkari sarees in rich earth tones",
      category: "Premium Collection"
    },
    {
      src: "/images/gallery/gallery-6.png",
      alt: "Graceful model showcasing the timeless beauty of Kalamkari heritage",
      category: "Timeless Beauty"
    },
  ];

  return (
    <>
      <main className="w-full kalamkari-static-background silk-fabric-texture text-foreground overflow-hidden">
        {/* Cinematic Hero Section - Calm, High-End Look */}
        <section 
          ref={heroRef}
          className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden pt-16 md:pt-0" // Tightened vertical space
          role="banner"
          aria-label="Kalamkari Heritage - Cinematic Collection"
        >
          {/* Multiple Kalamkari Fabric Background Images */}
          <div className="absolute inset-0 z-0">
            {/* Background Image Slideshow - Soft Fade Only */}
            <div className="absolute inset-0">
              {heroBackgroundImages.map((image, index) => (
                <Image
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  width={1920}
                  height={1080}
                  priority={index === 0}
                  className={`hero-background-image ${
                    index === currentImageIndex ? 'active' : 'inactive'
                  }`}
                />
              ))}
            </div>
            
            {/* Soft Warm Gradient Overlay (dark brown top 25-35%, golden-brown mid 15-20%, cream bottom 8-12%) */}
            <div className="absolute inset-0 bg-black/40 z-[1]" />
            <div className="cinematic-overlay" />
            
            {/* Premium Textile Texture for Authentic Saree Feel */}
            <div className="textile-texture" />
            

          </div>
          
          {/* Hero Content - Premium Centered Design */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-8 lg:px-12 max-w-6xl mx-auto w-full">
            {/* Premium Centered Serif Title with Subtle Gradient */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              className="relative"
            >
              {/* Subtle background gradient behind title for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-background/0 via-background/10 to-background/0 blur-2xl -z-10 rounded-full transform scale-150 opacity-0 animate-in fade-in duration-1000 delay-1000 fill-mode-forwards"></div>
              
              <h1 className="cinematic-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8 relative z-20">
                <span className="block drop-shadow-xl">Kalamkari</span>
                <span className="block font-light drop-shadow-lg">Heritage</span>
              </h1>
            </motion.div>

            {/* Elegant Italic Tagline */}
            <motion.p
              className="cinematic-tagline text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
            >
              "Where ancient artistry meets modern luxury, each thread tells a story of timeless elegance"
            </motion.p>

            {/* Gold-Brown Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto w-full"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
            >
              <Link href="/products" className="flex-1">
                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-lg text-lg font-medium"
                  aria-label="Explore our handcrafted Kalamkari collection"
                >
                  <span className="flex items-center justify-center gap-3 font-serif">
                    Explore Collection
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
              
              <Link href="/about" className="flex-1">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-14 rounded-lg text-lg font-medium bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white hover:border-white/50 backdrop-blur-sm"
                  aria-label="Learn about our heritage and artisan story"
                >
                  <span className="flex items-center justify-center gap-3 font-serif">
                    Our Heritage
                    <Sparkles className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Featured Products Section - Premium Showcase */}
        <section className="w-full py-16 md:py-20 relative overflow-hidden">
          <div className="max-w-[120rem] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <AnimatedElement>
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                  <span className="font-paragraph text-xs font-semibold text-accent-color uppercase tracking-[0.15em]">
                    Curated Collection
                  </span>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                </motion.div>
                
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
                  Masterpieces of Heritage
                </h2>
                
                <p className="font-paragraph text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                  A carefully curated selection of our finest handcrafted sarees, each piece telling a unique story of tradition, artistry, and timeless elegance.
                </p>
              </div>
            </AnimatedElement>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/85 rounded-xl overflow-hidden animate-pulse shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                    <div className="w-full aspect-[5/6] bg-secondary/30" />
                    <div className="p-6 space-y-2.5">
                      <div className="h-4 bg-secondary/30 rounded w-3/4" />
                      <div className="h-3 bg-secondary/30 rounded w-1/2" />
                      <div className="h-4 bg-secondary/30 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {featuredProducts.map((product, index) => (
                  <AnimatedElement key={product.id} delay={index * 80}>
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="group block h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-xl"
                      aria-label={`View ${product.title || 'Handcrafted Kalamkari Saree'} - ₹${product.price?.toLocaleString('en-IN') || 'Price on request'}`}
                    >
                      <motion.article
                        whileHover={{ 
                          y: -8, 
                          scale: 1.02,
                          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-500 group h-full flex flex-col"
                      >
                        {/* Product Image - Reduced Height */}
                        <div className="relative overflow-hidden flex-shrink-0">
                          <Image
                            src={product.mainImage || "/images/products/product-placeholder.png"}
                            alt={`${product.title || 'Handcrafted Kalamkari Saree'} - Premium handwoven saree with traditional motifs`}
                            className="w-full aspect-[5/6] object-cover object-[center_20%] transition-all duration-700 ease-out group-hover:scale-108 group-hover:brightness-105"
                            width={300}
                            height={360}
                            loading={index < 2 ? "eager" : "lazy"}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          
                          {/* Enhanced Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                          
                          {/* Featured Badge */}
                          {product.isFeatured && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: -10 }}
                              whileInView={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              viewport={{ once: true }}
                              className="absolute top-2.5 right-2.5 bg-gradient-to-r from-accent-color to-accent-color/90 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm"
                            >
                              ✨ Featured
                            </motion.div>
                          )}
                          
                          {/* Enhanced Hover Actions */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center opacity-0 group-hover:opacity-100"
                          >
                            <Button 
                              size="sm" 
                              className="h-7 px-2.5 text-xs rounded-lg bg-white/95 hover:bg-white text-primary font-semibold shadow-lg backdrop-blur-sm border-0 transition-all duration-200 hover:scale-105"
                              onClick={(e) => e.preventDefault()}
                              tabIndex={-1}
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 rounded-lg bg-white/90 hover:bg-white border-white/60 hover:border-white shadow-lg transition-all duration-200 hover:scale-105"
                              onClick={(e) => e.preventDefault()}
                              tabIndex={-1}
                            >
                              <Heart className="w-3 h-3 text-primary" />
                            </Button>
                          </motion.div>
                        </div>

                        {/* Product Info - Standardized Padding */}
                        <div className="p-6 flex-grow flex flex-col">
                          <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-1.5 line-clamp-2 leading-tight"
                          >
                            {product.title}
                          </motion.h3>
                          
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            viewport={{ once: true }}
                            className="text-foreground/65 font-paragraph text-xs mb-2.5 line-clamp-2 leading-relaxed flex-grow"
                          >
                            {product.description}
                          </motion.p>

                          {/* Aligned Price and Rating */}
                          <div className="flex items-end justify-between mt-auto pt-1">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.2 }}
                              viewport={{ once: true }}
                              className="flex flex-col"
                            >
                              <span className="font-heading font-bold text-primary text-xl leading-tight tracking-wide">
                                ₹{product.price?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-foreground/60 font-paragraph mt-1 font-medium">
                                Free Shipping
                              </span>
                            </motion.div>

                            {/* Aligned Rating */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.25 }}
                              viewport={{ once: true }}
                              className="flex flex-col items-end"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow-sm" 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-foreground/70 font-semibold leading-tight tracking-wide">
                                4.9 (127)
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </motion.article>
                    </Link>
                  </AnimatedElement>
                ))}
              </div>
            )}

            {/* Enhanced CTA */}
            <AnimatedElement className="text-center mt-14">
              <Link href="/products">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-12 px-8 text-base font-semibold rounded-xl border-2 border-primary/40 hover:bg-primary/8 hover:border-primary group transition-all duration-400 shadow-[0_4px_20px_rgba(160,82,45,0.15)] hover:shadow-[0_8px_30px_rgba(160,82,45,0.25)]"
                    aria-label="View complete collection of handcrafted Kalamkari sarees"
                  >
                    View Complete Collection 
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1"/>
                  </Button>
                </motion.div>
              </Link>
            </AnimatedElement>
          </div>
        </section>

        {/* The Soul of the Artisan Section - Refined Split Layout */}
        <section className="w-full py-20 md:py-28 relative overflow-hidden">

          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Smaller Artisan Image with Rounded Corners */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="lg:col-span-5 order-2 lg:order-1"
              >
                <div className="relative">
                  {/* Main Image Container */}
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 group">
                    <Image
                      src="/images/products/artisan.png"
                      alt="Master artisan carefully painting traditional Kalamkari designs with natural dyes and bamboo pen"
                      className="w-full aspect-[4/5] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      width={500}
                      height={625}
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Compact Heritage Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-accent-color/20"
                  >
                    <CountUpNumber 
                      end={500} 
                      duration={2000}
                      className="text-3xl font-heading font-bold text-primary mb-2 tracking-tight"
                      suffix="+"
                    />
                    <div className="text-sm font-paragraph text-foreground/70 font-medium">Years Heritage</div>
                    <div className="w-8 h-0.5 bg-accent-color rounded-full mt-2"></div>
                  </motion.div>

                  {/* Decorative Corner Element */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="absolute -top-4 -left-4 w-12 h-12 border-3 border-accent-color/30 rounded-full bg-accent-color/5 backdrop-blur-sm"
                  />
                </div>
              </motion.div>

              {/* Compact Text Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="lg:col-span-7 order-1 lg:order-2"
              >
                {/* Section Tag */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 mb-8"
                >
                  <div className="w-12 h-px bg-gradient-to-r from-accent-color to-accent-color/40"></div>
                  <span className="font-paragraph text-xs font-bold text-accent-color uppercase tracking-[0.3em]">
                    Our Heritage
                  </span>
                </motion.div>
                
                {/* Compact Heading */}
                <motion.h2 
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-[0.9] tracking-tight font-light"
                >
                  The Soul of the
                  <span className="text-primary block mt-2 font-normal">Artisan</span>
                </motion.h2>
                
                {/* Readable Content */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="space-y-6 mb-10"
                >
                  <p className="font-paragraph text-lg text-foreground/85 leading-relaxed">
                    Kalamkari is more than an art form; it is a living narrative whispered through generations. The term itself, derived from 'kalam' (pen) and 'kari' (craftsmanship), describes the meticulous process of hand-painting textiles with natural dyes.
                  </p>
                  <p className="font-paragraph text-base text-foreground/70 leading-relaxed">
                    Our collection is a tribute to this ancient craft. We partner with master artisans who use traditional motifs inspired by folklore, mythology, and nature, ensuring each saree is a singular masterpiece.
                  </p>
                </motion.div>

                {/* Refined Metrics Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-4 md:gap-6 mb-10"
                >
                  <motion.div 
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-white/40 backdrop-blur-md rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-400 h-full"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="relative inline-block">
                        <CountUpNumber 
                          end={200} 
                          duration={2000}
                          className="text-3xl font-heading font-bold text-foreground tracking-tight"
                          suffix="+"
                        />
                        <div className="absolute -bottom-1 left-0 w-full h-1 bg-accent/40 rounded-full"></div>
                      </div>
                      <div className="text-sm font-paragraph text-foreground/70 font-semibold mt-1">Master Artisans</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-white/40 backdrop-blur-md rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-400 h-full"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-color/15 to-accent-color/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Palette className="w-6 h-6 text-accent-color" />
                    </div>
                    <div>
                      <div className="relative inline-block">
                        <CountUpNumber 
                          end={100} 
                          duration={2000}
                          className="text-3xl font-heading font-bold text-foreground tracking-tight"
                          suffix="%"
                        />
                        <div className="absolute -bottom-1 left-0 w-full h-1 bg-accent/40 rounded-full"></div>
                      </div>
                      <div className="text-sm font-paragraph text-foreground/70 font-semibold mt-1">Natural Dyes</div>
                    </div>
                  </motion.div>
                </motion.div>
                
                {/* Elegant Quote */}
                <motion.blockquote 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="relative pl-8 mb-10 border-l-3 border-accent-color/30"
                >
                  <p className="font-paragraph text-lg text-foreground/80 italic leading-relaxed font-light mb-3">
                    "Every thread tells a story. Every color carries history. Every pattern celebrates tradition."
                  </p>
                  <cite className="block text-sm font-paragraph text-accent-color font-semibold not-italic">
                    — Master Artisan Philosophy
                  </cite>
                </motion.blockquote>
                
                {/* Modern Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href="/products">
                      <Button 
                        size="lg"
                        className="h-14 px-8 text-base rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold group transition-all duration-400 shadow-lg hover:shadow-xl border-0"
                        aria-label="Discover our handcrafted Kalamkari collection"
                      >
                        Discover the Craft 
                        <ArrowRight className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1"/>
                      </Button>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href="/about">
                      <Button 
                        variant="outline"
                        size="lg"
                        className="h-14 px-8 text-base rounded-2xl border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 text-primary font-semibold transition-all duration-400 backdrop-blur-md bg-white/30 shadow-md hover:shadow-lg"
                        aria-label="Learn about our heritage and story"
                      >
                        Our Story
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
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

        {/* Our Promise Section - Luxury Heritage Design */}
        <section className="w-full py-20 md:py-24 relative overflow-hidden">
          
          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            {/* Refined Editorial Header with Smooth Fade Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
              className="text-center max-w-5xl mx-auto mb-16"
            >
              <div className="flex items-center justify-center gap-6 mb-8">
                <motion.div 
                  className="w-20 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
                <motion.span 
                  className="font-paragraph text-xs font-bold text-accent-color uppercase tracking-[0.3em] relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  Our Promise
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-px bg-accent-color/30"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    viewport={{ once: true }}
                  />
                </motion.span>
                <motion.div 
                  className="w-20 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
              
              <motion.h2 
                className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-[0.9] tracking-tight font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                The Kalamkari
                <motion.span 
                  className="block text-primary font-normal italic mt-1"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  Promise
                </motion.span>
              </motion.h2>
              
              <motion.p 
                className="font-paragraph text-lg md:text-xl text-foreground/75 leading-relaxed max-w-4xl mx-auto font-light"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                We deliver authentic experiences steeped in tradition, quality, and respect for heritage. Every purchase supports artisan families and preserves cultural legacy.
              </motion.p>
            </motion.div>

            {/* Refined Promise Cards with Gentle Hover Effects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
              {whyChooseUsItems.map((item, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 1, 
                    delay: index * 0.15, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Gentle Hover Glow */}
                  <motion.div 
                    className="absolute -inset-3 bg-gradient-to-r from-accent-color/5 via-primary/5 to-accent-color/5 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  {/* Handcrafted Card Container */}
                  <motion.div
                    whileHover={{
                      y: -6,
                      scale: 1.01
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut"
                    }}
                    className="relative bg-[#FFF4E5] rounded-xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 border border-[#E5B97C]/30 group-hover:border-[#E5B97C] overflow-hidden"
                  >
                    {/* Subtle Handcrafted Texture on Card */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-1 pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23A0522D' fill-opacity='0.02'%3E%3Cpath d='M20 10c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z'/%3E%3Cpath d='M20 15c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: "40px 40px"
                      }}
                    />
                    
                    {/* Refined Icon Container */}
                    <motion.div 
                      className="flex items-center justify-center w-20 h-20 mx-auto mb-8 relative"
                      whileHover={{ 
                        scale: 1.05,
                        rotate: 2
                      }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut"
                      }}
                    >
                      {/* Layered Background */}
                      <div className="absolute inset-0 bg-white/20 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-500"></div>
                      <div className="absolute inset-1 bg-white/10 rounded-xl"></div>
                      <div className="absolute inset-3 bg-white/5 rounded-lg"></div>

                      {/* Icon */}
                      <item.icon className="w-10 h-10 text-primary relative z-10" />
                    </motion.div>
                    
                    {/* Content with Smooth Animations */}
                    <motion.h3
                      className="font-heading text-xl lg:text-2xl text-foreground mb-6 text-center leading-tight transition-colors duration-400 font-light tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                      viewport={{ once: true }}
                    >
                      {item.title}
                    </motion.h3>

                    <motion.p
                      className="font-paragraph text-base text-foreground/80 leading-relaxed text-center mb-8 font-light"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                      viewport={{ once: true }}
                    >
                      {item.description}
                    </motion.p>
                    
                    {/* Refined Highlight Badge */}
                    <div className="text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.15 + 0.4 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.02 }}
                        className="inline-flex items-center px-6 py-3 bg-white/60 rounded-xl border border-[#E5B97C]/20 shadow-sm group-hover:shadow-md transition-all duration-500 backdrop-blur-sm"
                      >
                        <Sparkles className="w-4 h-4 text-primary mr-2" />
                        <span className="font-heading font-light text-sm tracking-wide text-primary">
                          {index === 0 && (
                            <>
                              <CountUpNumber 
                                end={500} 
                                duration={2000}
                                className="font-medium text-base"
                                suffix="+ "
                              />
                              Years Heritage
                            </>
                          )}
                          {index === 1 && (
                            <>
                              <CountUpNumber 
                                end={100} 
                                duration={2000}
                                className="font-medium text-base"
                                suffix="% "
                              />
                              Natural
                            </>
                          )}
                          {index === 2 && (
                            <>
                              <CountUpNumber 
                                end={200} 
                                duration={2000}
                                className="font-medium text-base"
                                suffix="+ "
                              />
                              Artisans
                            </>
                          )}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.article>
              ))}
            </div>

            {/* Refined Stats Row with Smooth Slide Animations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20">
                <motion.div 
                  className="flex items-center gap-6 group"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400/15 via-amber-400/25 to-amber-400/15 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-400">
                    <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-heading font-light text-3xl text-primary tracking-tight">
                      <CountUpNumber 
                        end={4.9} 
                        duration={2500}
                        className="font-medium"
                        suffix="/5"
                      />
                    </div>
                    <span className="font-paragraph text-base font-medium text-foreground/70 tracking-wide">Customer Rating</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-6 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/15 via-primary/25 to-primary/15 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-400">
                    <Scissors className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-heading font-light text-3xl text-primary tracking-tight">
                      <CountUpNumber 
                        end={100} 
                        duration={2500}
                        className="font-medium"
                        suffix="%"
                      />
                    </div>
                    <span className="font-paragraph text-base font-medium text-foreground/70 tracking-wide">Handcrafted</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-6 group"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-color/15 via-accent-color/25 to-accent-color/15 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-400">
                    <Users className="w-8 h-8 text-accent-color" />
                  </div>
                  <div className="text-left">
                    <div className="font-heading font-light text-3xl text-primary tracking-tight">
                      <CountUpNumber 
                        end={10000} 
                        duration={3000}
                        className="font-medium"
                        suffix="+"
                      />
                    </div>
                    <span className="font-paragraph text-base font-medium text-foreground/70 tracking-wide">Happy Customers</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Woven in Elegance Gallery - Authentic Hand-drawn Motifs */}
        <section className="w-full py-20 md:py-24 relative overflow-hidden">

          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 mb-12">
            {/* Refined Editorial Header with Smooth Fade Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              {/* Refined Header Elements */}
              <div className="flex items-center justify-center gap-6 mb-8 relative">
                <motion.div 
                  className="w-20 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent relative"
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
                
                <motion.span 
                  className="font-paragraph text-sm font-bold text-accent-color uppercase tracking-[0.3em] relative px-4 py-2 bg-gradient-to-r from-accent-color/8 via-accent-color/15 to-accent-color/8 rounded-xl border border-accent-color/20 backdrop-blur-sm"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  Visual Gallery
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-px bg-accent-color"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                  />
                </motion.span>
                
                <motion.div 
                  className="w-20 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent relative"
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
              
              {/* Refined Title */}
              <motion.h2 
                className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-[0.85] tracking-tight font-light relative"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <motion.span
                  className="block"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  Woven in
                </motion.span>
                <motion.span 
                  className="block text-primary font-normal italic mt-2 relative"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  Elegance
                </motion.span>
              </motion.h2>
              
              {/* Refined Description */}
              <motion.p 
                className="font-paragraph text-xl md:text-2xl text-foreground/75 max-w-4xl mx-auto leading-relaxed font-light relative"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                Explore the vibrant world of Kalamkari through our visual journal of artistry, tradition, and contemporary elegance.
                <motion.span
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-accent-color/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  viewport={{ once: true }}
                />
              </motion.p>
            </motion.div>
          </div>
          
          {/* Refined Gallery Container with Smooth Animations */}
          <div className="relative">
            {/* Gallery Scroll Container */}
            <div 
              ref={galleryScrollRef} 
              className="premium-scroll overflow-x-auto pb-8 px-6 md:px-8 lg:px-12 scrollbar-hide relative"
              style={{
                scrollBehavior: 'smooth',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className="flex gap-8 md:gap-10 w-max relative">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.1, 
                      ease: [0.25, 0.46, 0.45, 0.94] 
                    }}
                    viewport={{ once: true, margin: "0px 100px" }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02
                    }}
                    className="gallery-item w-[34vh] md:w-[38vh] lg:w-[42vh] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 group relative"
                    style={{
                      scrollSnapAlign: 'center',
                      scrollSnapStop: 'always'
                    }}
                  >
                    {/* Subtle Handcrafted Motif Overlay */}
                    <div 
                      className="absolute inset-0 opacity-1 pointer-events-none z-10"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B' fill-opacity='0.04'%3E%3Cpath d='M30 15c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z'/%3E%3Cpath d='M30 22c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: "60px 60px"
                      }}
                    />
                    
                    {/* Main Image with Gentle Hover Effect */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full h-full relative overflow-hidden rounded-3xl"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={420}
                        height={560}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-105"
                        loading={index < 3 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 34vh, (max-width: 1024px) 38vh, 42vh"
                      />
                    </motion.div>
                    
                    {/* Gentle Interactive Overlay */}
                    <motion.div 
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(184, 134, 11, 0.05) 70%, rgba(255, 215, 0, 0.1) 100%)"
                      }}
                      initial={{ opacity: 0.2 }}
                      whileHover={{ opacity: 0.5 }}
                      transition={{ duration: 0.4 }}
                    />
                    
                    {/* Refined Border with Gentle Glow */}
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent group-hover:border-[#E5B97C] rounded-3xl transition-all duration-400"
                      whileHover={{ 
                        borderColor: "rgba(184, 134, 11, 0.6)",
                        boxShadow: "0 0 20px rgba(184, 134, 11, 0.2)"
                      }}
                    />
                    
                    {/* Refined Category Label */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      whileHover={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100"
                    >
                      <motion.div 
                        className="bg-gradient-to-r from-white/95 via-white/98 to-white/95 backdrop-blur-md text-primary px-6 py-3 rounded-2xl shadow-lg border border-accent-color/20 relative overflow-hidden"
                        whileHover={{ scale: 1.02, y: -1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          <motion.div 
                            className="w-3 h-3 bg-gradient-to-r from-accent-color to-amber-400 rounded-full shadow-sm"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <span className="font-heading tracking-wide font-semibold text-base">
                            {image.category}
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Enhanced Auto-scroll Indicator with Gold Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute bottom-4 right-8 md:right-16 flex items-center gap-4 text-foreground/60 text-sm font-paragraph uppercase tracking-[0.2em] bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-accent-color/20 shadow-lg"
              style={{
                boxShadow: "0 4px 20px rgba(184, 134, 11, 0.1)"
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1], 
                    opacity: [0.5, 1, 0.5],
                    boxShadow: [
                      "0 0 5px rgba(184, 134, 11, 0.3)",
                      "0 0 15px rgba(184, 134, 11, 0.6)",
                      "0 0 5px rgba(184, 134, 11, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2.5 h-2.5 bg-gradient-to-r from-accent-color to-amber-400 rounded-full"
                />
                <span className="font-medium text-primary">Auto-scrolling Gallery</span>
              </div>
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center"
              >
                <ArrowRight className="w-4 h-4 text-accent-color" />
              </motion.div>
            </motion.div>
            
            {/* Enhanced Accessibility Controls with Gold Styling */}
            <div className="absolute top-6 right-8 md:right-16 flex gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const container = galleryScrollRef.current;
                  if (container) {
                    container.scrollBy({ left: -400, behavior: 'smooth' });
                  }
                }}
                className="w-10 h-10 bg-gradient-to-br from-white/95 via-white/98 to-white/95 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-accent-color/30 group"
                aria-label="Scroll gallery left"
                style={{
                  boxShadow: "0 4px 20px rgba(184, 134, 11, 0.15)"
                }}
              >
                <ArrowRight className="w-5 h-5 text-primary rotate-180 group-hover:text-accent-color transition-colors" />
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(45deg, rgba(184, 134, 11, 0.1), rgba(255, 215, 0, 0.1))"
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const container = galleryScrollRef.current;
                  if (container) {
                    container.scrollBy({ left: 400, behavior: 'smooth' });
                  }
                }}
                className="w-10 h-10 bg-gradient-to-br from-white/95 via-white/98 to-white/95 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-accent-color/30 group"
                aria-label="Scroll gallery right"
                style={{
                  boxShadow: "0 4px 20px rgba(184, 134, 11, 0.15)"
                }}
              >
                <ArrowRight className="w-5 h-5 text-primary group-hover:text-accent-color transition-colors" />
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(45deg, rgba(184, 134, 11, 0.1), rgba(255, 215, 0, 0.1))"
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
            </div>
          </div>
        </section>

        {/* Refined Newsletter Section - Static Brown Gradient with Subtle Gold Kalamkari */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          {/* Static Brown Gradient Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #2D1810 0%, #3D2317 25%, #4A2C1A 50%, #3D2317 75%, #2D1810 100%)"
              }}
            />
          </div>
          
          {/* Subtle Gold Kalamkari Motif - Static */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23B8860B' stroke-width='0.5' stroke-linecap='round' stroke-linejoin='round' opacity='0.4'%3E%3Cpath d='M40 30c15 0 27 12 27 27 0 20-15 35-27 35s-27-15-27-35c0-15 12-27 27-27z' fill='%23B8860B' fill-opacity='0.08'/%3E%3Cpath d='M120 100c12 0 22 10 22 22 0 16-12 30-22 30s-22-14-22-30c0-12 10-22 22-22z' fill='%23B8860B' fill-opacity='0.06'/%3E%3Cpath d='M80 40c8 0 15 7 15 15 0 12-8 22-15 22s-15-10-15-22c0-8 7-15 15-15z' fill='%23B8860B' fill-opacity='0.05'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "160px 160px",
              backgroundPosition: "0 0",
              backgroundRepeat: "repeat"
            }}
          />
          
          <div className="max-w-5xl mx-auto text-center px-6 md:px-8 lg:px-12 relative z-10">
            {/* Premium Typography Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mb-10"
            >
              {/* Gold Divider */}
              <motion.div 
                className="w-24 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent mx-auto mb-8"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                viewport={{ once: true }}
              />
              
              <motion.span 
                className="font-paragraph text-sm font-bold text-accent-color uppercase tracking-[0.3em] block mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Stay Connected
              </motion.span>
            </motion.div>
            
            {/* Premium Title */}
            <motion.h2 
              className="font-heading text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-8 leading-tight font-light"
              style={{
                textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)"
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join the Heritage Collective
            </motion.h2>
            
            {/* Refined Description */}
            <motion.p 
              className="font-paragraph text-xl md:text-2xl text-primary-foreground/90 mb-14 leading-relaxed max-w-4xl mx-auto font-light"
              style={{
                textShadow: "0 1px 6px rgba(0, 0, 0, 0.3)"
              }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Become a part of our story. Receive exclusive access to new collections, artisan stories, cultural insights, and special member-only offers.
            </motion.p>
            
            {/* Tactile Newsletter Form */}
            <motion.form 
              className="flex flex-col sm:flex-row gap-5 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="flex-grow relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full h-14 px-8 bg-white/95 backdrop-blur-sm border border-white/40 hover:border-accent-color/60 focus:border-accent-color rounded-lg placeholder:text-foreground/60 font-paragraph focus:ring-2 focus:ring-accent-color/20 focus:outline-none text-foreground text-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  style={{
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.1)"
                  }}
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-10 rounded-lg font-paragraph bg-primary text-primary-foreground font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl border-0 hover:bg-primary/90"
                style={{
                  boxShadow: "0 8px 32px rgba(184, 134, 11, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)"
                }}
              >
                <span className="flex items-center gap-3">
                  Subscribe Now
                  <ArrowRight className="w-6 h-6" />
                </span>
              </Button>
            </motion.form>
            
            {/* Trust Indicators - Calm & Static */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 text-primary-foreground/85 text-base font-paragraph mb-8 font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="font-semibold">5,000+ Subscribers</span>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Star className="w-5 h-5 text-amber-400" />
                <span className="font-semibold">Exclusive Content</span>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Award className="w-5 h-5 text-accent-color" />
                <span className="font-semibold">Member Benefits</span>
              </div>
            </motion.div>
            
            {/* Privacy Notice */}
            <motion.p 
              className="text-base text-primary-foreground/75 font-paragraph leading-relaxed"
              style={{
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              viewport={{ once: true }}
            >
              We respect your privacy. Unsubscribe at any time. No spam, just beautiful heritage content.
            </motion.p>
          </div>
        </section>

      </main>
    </>
  );
}
