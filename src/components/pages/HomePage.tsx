import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, Promotions } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Sparkles, Star, Heart, Award, Users, Palette, Scissors } from 'lucide-react';
import { KanjeevaramPattern, DiagonalKalamkariPattern } from '@/components/ui/decorative-pattern';

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

// Premium decorative pattern component for sophisticated heritage branding
const DecorativePattern = ({ className = '', animated = false }: { className?: string; animated?: boolean }) => (
  <KanjeevaramPattern className={className} opacity="opacity-5" />
);

// Kalamkari Hero Background - Diagonal flowing paisley pattern with fabric depth
const KalamkariHeroBackground = ({ className = '', animated = false }: { className?: string; animated?: boolean }) => (
  <DiagonalKalamkariPattern className={className} opacity="opacity-10" animated={animated} />
);

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Products[]>([]);
  const [promotions, setPromotions] = useState<Promotions[]>([]);
  const [loading, setLoading] = useState(true);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, promotionsRes] = await Promise.all([
          BaseCrudService.getAll<Products>('products'),
          BaseCrudService.getAll<Promotions>('promotions'),
        ]);

        const featured = productsRes.items.filter(p => p.isFeatured).slice(0, 4);
        const activePromotions = promotionsRes.items.filter(p => p.isActive).slice(0, 2);

        setFeaturedProducts(featured);
        setPromotions(activePromotions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      src: "https://static.wixstatic.com/media/07221c_2e8d1f7395134585bcff6b528887e1bf~mv2.png?originWidth=256&originHeight=384", 
      alt: "Elegant woman in vibrant Kalamkari saree with intricate floral patterns",
      category: "Traditional Elegance"
    },
    { 
      src: "https://static.wixstatic.com/media/07221c_15fd999951a443999835d74bf92fb898~mv2.png?originWidth=256&originHeight=384", 
      alt: "Close-up detail of hand-painted Kalamkari motifs on silk fabric",
      category: "Artisan Detail"
    },
    { 
      src: "https://static.wixstatic.com/media/07221c_3d36b8d683e2438d894f2d49c2a94bc8~mv2.png?originWidth=256&originHeight=384", 
      alt: "Contemporary styling of traditional Kalamkari saree for modern occasions",
      category: "Modern Heritage"
    },
    { 
      src: "https://static.wixstatic.com/media/07221c_a78b35baed0346338ef87d17c80ad1ac~mv2.png?originWidth=256&originHeight=384", 
      alt: "Master artisan carefully painting traditional designs with natural dyes",
      category: "Craft Process"
    },
    { 
      src: "https://static.wixstatic.com/media/07221c_368c4f27dd3c4eed8474a970c9f26427~mv2.png?originWidth=256&originHeight=384", 
      alt: "Luxurious collection of Kalamkari sarees in rich earth tones",
      category: "Premium Collection"
    },
    { 
      src: "https://static.wixstatic.com/media/07221c_65523ec270d249ed8d41b15d97b29b87~mv2.png?originWidth=256&originHeight=384", 
      alt: "Graceful model showcasing the timeless beauty of Kalamkari heritage",
      category: "Timeless Beauty"
    },
  ];

  return (
    <>
      <style>{`
        /* 2025 Minimal Cinematic Hero System */
        .animate-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .animate-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Warm Silk Fabric Background - Golden Terracotta */
        .silk-fabric-base {
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(218, 165, 32, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(205, 133, 63, 0.06) 0%, transparent 50%),
            linear-gradient(135deg, 
              rgba(245, 245, 220, 0.95) 0%,
              rgba(222, 184, 135, 0.92) 25%,
              rgba(218, 165, 32, 0.88) 50%,
              rgba(205, 133, 63, 0.90) 75%,
              rgba(160, 82, 45, 0.85) 100%
            );
          animation: silkShimmer 20s ease-in-out infinite;
        }

        @keyframes silkShimmer {
          0%, 100% { 
            filter: brightness(1) saturate(1.1) hue-rotate(0deg);
            opacity: 0.95;
          }
          25% { 
            filter: brightness(1.05) saturate(1.15) hue-rotate(2deg);
            opacity: 0.98;
          }
          50% { 
            filter: brightness(0.98) saturate(1.05) hue-rotate(-1deg);
            opacity: 0.92;
          }
          75% { 
            filter: brightness(1.02) saturate(1.12) hue-rotate(1deg);
            opacity: 0.96;
          }
        }

        /* Light Gradient Overlay */
        .light-gradient-overlay {
          background: 
            radial-gradient(circle at center, 
              rgba(255, 255, 255, 0.15) 0%,
              rgba(245, 245, 220, 0.08) 40%,
              transparent 70%
            );
          animation: lightPulse 15s ease-in-out infinite;
        }

        @keyframes lightPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        /* Refined Serif Typography */
        .cinematic-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: -0.02em;
          line-height: 0.9;
          text-shadow: 
            0 2px 20px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.05);
        }

        /* Smooth Fade-Up Animation */
        .fade-up-text {
          animation: smoothFadeUp 2.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .fade-up-text.delay-1 { animation-delay: 0.3s; }
        .fade-up-text.delay-2 { animation-delay: 0.6s; }
        .fade-up-text.delay-3 { animation-delay: 0.9s; }

        @keyframes smoothFadeUp {
          0% { 
            opacity: 0; 
            transform: translateY(60px) scale(0.95);
            filter: blur(2px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }

        /* Poetic Gold Tagline */
        .poetic-gold-text {
          background: linear-gradient(
            135deg,
            #DAA520 0%,
            #FFD700 30%,
            #B8860B 60%,
            #CD853F 100%
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: poeticGoldFlow 12s ease-in-out infinite;
          font-style: italic;
          font-weight: 400;
        }

        @keyframes poeticGoldFlow {
          0%, 100% { background-position: 0% 50%; }
          33% { background-position: 50% 0%; }
          66% { background-position: 100% 50%; }
        }

        /* Single Elegant Button with Gold Glow */
        .elegant-explore-btn {
          background: linear-gradient(135deg, 
            rgba(160, 82, 45, 0.95) 0%, 
            rgba(139, 69, 19, 0.98) 100%
          );
          border: 1px solid rgba(218, 165, 32, 0.3);
          box-shadow: 
            0 8px 32px rgba(160, 82, 45, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .elegant-explore-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(218, 165, 32, 0.4) 50%,
            transparent 100%
          );
          transition: left 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .elegant-explore-btn:hover::before {
          left: 100%;
        }

        .elegant-explore-btn:hover {
          background: linear-gradient(135deg, 
            rgba(139, 69, 19, 0.98) 0%, 
            rgba(160, 82, 45, 0.95) 100%
          );
          box-shadow: 
            0 0 40px rgba(218, 165, 32, 0.6),
            0 0 80px rgba(218, 165, 32, 0.3),
            0 12px 48px rgba(160, 82, 45, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          transform: translateY(-4px) scale(1.02);
          border-color: rgba(218, 165, 32, 0.6);
        }

        .elegant-btn-text {
          position: relative;
          z-index: 1;
          font-weight: 500;
          letter-spacing: 0.05em;
          font-size: 1.1rem;
        }

        /* Minimal Scroll Indicator */
        .minimal-scroll {
          animation: minimalPulse 4s ease-in-out infinite;
        }

        @keyframes minimalPulse {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(-8px); }
        }

        /* 2025 Whitespace & Fluid Motion */
        .cinematic-container {
          padding: 8rem 2rem;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content-spacing {
          margin-bottom: 3rem;
        }

        .content-spacing.large {
          margin-bottom: 5rem;
        }

        /* Visual Storytelling Elements */
        .story-element {
          opacity: 0;
          animation: storyReveal 3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .story-element.delay-1 { animation-delay: 1.2s; }
        .story-element.delay-2 { animation-delay: 1.5s; }

        @keyframes storyReveal {
          0% { 
            opacity: 0; 
            transform: translateY(30px);
            filter: blur(1px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
            filter: blur(0px);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .cinematic-container {
            padding: 4rem 1.5rem;
          }
          
          .cinematic-headline {
            font-size: clamp(3rem, 12vw, 6rem);
          }
          
          .poetic-gold-text {
            background: #DAA520;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: unset;
            background-clip: unset;
          }
        }

        /* Legacy Compatibility */
        .heritage-texture::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(184, 134, 11, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(160, 82, 45, 0.1) 1px, transparent 1px);
          background-size: 24px 24px, 16px 16px;
          z-index: -1;
        }

        .premium-scroll {
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .premium-scroll::-webkit-scrollbar {
          display: none;
        }

        .gallery-item {
          scroll-snap-align: center;
          scroll-snap-stop: always;
        }

        .luxury-glow {
          position: relative;
          overflow: hidden;
        }

        .luxury-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(184, 134, 11, 0.2) 0%, transparent 70%);
          animation: luxuryGlow 10s ease-in-out infinite;
        }

        @keyframes luxuryGlow {
          0%, 100% { transform: translate(-20px, -20px) scale(1); opacity: 0.3; }
          50% { transform: translate(20px, 20px) scale(1.1); opacity: 0.6; }
        }

        .heritage-float {
          animation: heritageFloat 15s ease-in-out infinite;
        }

        @keyframes heritageFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(1deg); }
          50% { transform: translateY(-8px) rotate(-0.5deg); }
          75% { transform: translateY(-12px) rotate(0.8deg); }
        }

        .premium-shimmer {
          background: linear-gradient(
            45deg, 
            transparent 30%, 
            rgba(255, 255, 255, 0.15) 50%, 
            transparent 70%
          );
          background-size: 300% 300%;
          animation: premiumShimmer 4s ease-in-out infinite;
        }

        @keyframes premiumShimmer {
          0% { background-position: -300% -300%; }
          50% { background-position: 300% 300%; }
          100% { background-position: -300% -300%; }
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <main className="w-full bg-background text-foreground overflow-hidden">
        {/* Minimal Cinematic Hero - Kalamkari Heritage */}
        <section 
          ref={heroRef}
          className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
          role="banner"
          aria-label="Kalamkari Heritage - Handcrafted Stories"
        >
          {/* Warm Silk Fabric Background */}
          <motion.div 
            style={{ y: heroY }}
            className="absolute inset-0 z-0"
          >
            {/* Golden-Terracotta Silk Base */}
            <div className="absolute inset-0 silk-fabric-base"></div>
            
            {/* Light Gradient Overlay */}
            <div className="absolute inset-0 light-gradient-overlay"></div>
          </motion.div>
          
          {/* Cinematic Content Container */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-10 cinematic-container w-full"
          >
            <div className="max-w-5xl mx-auto text-center">
              
              {/* Refined Serif Headline */}
              <motion.h1
                className="cinematic-headline text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] text-foreground fade-up-text content-spacing"
              >
                Kalamkari
                <br />
                <span className="fade-up-text delay-1">Heritage</span>
              </motion.h1>

              {/* Poetic Gold Tagline */}
              <motion.p
                className="poetic-gold-text text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed fade-up-text delay-2 content-spacing large"
              >
                "Where ancient whispers meet modern grace,<br />
                each thread a story, each pattern a place."
              </motion.p>

              {/* Single Elegant Explore Button */}
              <motion.div
                className="story-element delay-1"
              >
                <Link to="/shop" className="group inline-block">
                  <Button 
                    size="lg" 
                    className="elegant-explore-btn h-16 px-12 rounded-full transition-all duration-800 hover:scale-105"
                    aria-label="Explore our complete Kalamkari saree collection"
                  >
                    <span className="elegant-btn-text">Explore Collection</span>
                    <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-2" aria-hidden="true" />
                  </Button>
                </Link>
              </motion.div>

            </div>
          </motion.div>

          {/* Minimal Scroll Indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 story-element delay-2"
            role="button"
            aria-label="Scroll to discover more content"
            tabIndex={0}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="flex flex-col items-center gap-3 text-foreground/40 minimal-scroll"
            >
              <span className="text-xs font-paragraph uppercase tracking-[0.3em] font-light">
                Scroll
              </span>
              <div className="w-px h-8 bg-foreground/30"></div>
            </motion.div>
          </motion.div>
        </section>

        {/* Featured Products Section - Premium Showcase */}
        <section className="w-full py-20 md:py-28 bg-background relative overflow-hidden">
          <div className="absolute inset-0 heritage-texture opacity-30"></div>
          <DecorativePattern className="text-primary/3 premium-shimmer heritage-float" animated={true} />
          
          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            <AnimatedElement>
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center gap-4 mb-6"
                >
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-[0.2em]">
                    Curated Collection
                  </span>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                </motion.div>
                
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                  Masterpieces of Heritage
                </h2>
                
                <p className="font-paragraph text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  A carefully curated selection of our finest handcrafted sarees, each piece telling a unique story of tradition, artistry, and timeless elegance.
                </p>
              </div>
            </AnimatedElement>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/80 rounded-3xl overflow-hidden animate-pulse shadow-lg">
                    <div className="w-full aspect-[3/4] bg-secondary/30" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-secondary/30 rounded-lg w-3/4" />
                      <div className="h-4 bg-secondary/30 rounded-lg w-1/2" />
                      <div className="h-5 bg-secondary/30 rounded-lg w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product, index) => (
                  <AnimatedElement key={product._id} delay={index * 150}>
                    <Link to={`/product/${product._id}`} className="group block h-full">
                      <motion.div
                        whileHover={{ y: -12, scale: 1.02 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 group"
                      >
                        {/* Product Image */}
                        <div className="relative overflow-hidden">
                          <Image
                            src={product.mainImage || "https://static.wixstatic.com/media/07221c_a745fb56ce03452288286aef2ba62a22~mv2.png?originWidth=384&originHeight=512"}
                            alt={product.title || 'Handcrafted Kalamkari Saree'}
                            className="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            width={400}
                            height={533}
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Featured Badge */}
                          {product.isFeatured && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5 }}
                              viewport={{ once: true }}
                              className="absolute top-4 right-4 glass-morphism text-primary px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md"
                            >
                              ✨ Featured
                            </motion.div>
                          )}
                          
                          {/* Hover Actions */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100"
                          >
                            <Button 
                              size="sm" 
                              className="h-10 px-4 text-sm rounded-2xl bg-primary-foreground/95 hover:bg-primary-foreground text-primary font-semibold shadow-xl backdrop-blur-sm"
                            >
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Quick View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-10 w-10 p-0 rounded-full glass-morphism border-primary-foreground/30 hover:bg-primary-foreground/10"
                            >
                              <Heart className="w-4 h-4 text-primary-foreground" />
                            </Button>
                          </motion.div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6">
                          <motion.h3
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="font-heading text-xl text-foreground group-hover:text-primary transition-colors duration-300 mb-3 line-clamp-2 leading-tight"
                          >
                            {product.title}
                          </motion.h3>
                          
                          <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            viewport={{ once: true }}
                            className="text-foreground/60 font-paragraph text-sm mb-4 line-clamp-2 leading-relaxed"
                          >
                            {product.description}
                          </motion.p>

                          <div className="flex items-center justify-between">
                            <motion.p
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                              viewport={{ once: true }}
                              className="font-heading font-bold text-primary text-xl"
                            >
                              ₹{product.price?.toLocaleString('en-IN')}
                            </motion.p>

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className="w-4 h-4 fill-accent-color text-accent-color" 
                                />
                              ))}
                              <span className="text-xs text-foreground/60 ml-1 font-medium">(4.9)</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </AnimatedElement>
                ))}
              </div>
            )}

            <AnimatedElement className="text-center mt-16">
              <Link to="/shop">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-10 text-base rounded-2xl border-2 border-primary/30 hover:bg-primary/5 hover:border-primary group transition-all duration-300 hover:scale-105"
                >
                  View Complete Collection 
                  <ArrowRight className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1"/>
                </Button>
              </Link>
            </AnimatedElement>
          </div>
        </section>

        {/* The Art of Kalamkari Section - Enhanced Heritage Story */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-b from-secondary/10 via-background to-secondary/20 relative overflow-hidden">
          <div className="absolute inset-0 heritage-texture opacity-20"></div>
          <DecorativePattern className="text-primary/4 premium-shimmer heritage-float" animated={true} />
          
          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl luxury-glow">
                  <Image
                    src="https://static.wixstatic.com/media/07221c_63f62de1d1f548ff870b8e13f01daf64~mv2.png?originWidth=576&originHeight=576"
                    alt="Master artisan's hands meticulously painting traditional Kalamkari designs with natural dyes and bamboo pen"
                    className="w-full h-full object-cover"
                    width={600}
                    height={600}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -right-8 w-32 h-32 bg-accent-color/20 rounded-full blur-3xl"
                ></motion.div>
                
                <motion.div
                  animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl"
                ></motion.div>

                {/* Stats Overlay */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-8 -right-8 glass-morphism rounded-2xl p-6 text-center"
                >
                  <div className="text-2xl font-heading font-bold text-primary mb-1">500+</div>
                  <div className="text-sm font-paragraph text-foreground/70">Years of Heritage</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-px bg-gradient-to-r from-accent-color to-transparent"></div>
                <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-[0.2em]">
                  Our Heritage
                </span>
              </div>
              
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
                The Soul of the
                <span className="text-primary block">Artisan</span>
              </h2>
              
              <div className="font-paragraph text-lg text-foreground/80 space-y-6 leading-relaxed mb-10">
                <p>
                  Kalamkari is more than an art form; it is a living narrative whispered through generations. The term itself, derived from 'kalam' (pen) and 'kari' (craftsmanship), describes the meticulous process of hand-painting textiles with natural dyes.
                </p>
                <p>
                  Our collection is a tribute to this ancient craft. We partner with master artisans who use traditional motifs inspired by folklore, mythology, and nature, ensuring each saree is a singular masterpiece of cultural pride and artistic excellence.
                </p>
                
                {/* Heritage Stats */}
                <div className="grid grid-cols-2 gap-6 my-8">
                  <div className="text-center p-4 bg-white/50 rounded-2xl">
                    <div className="text-2xl font-heading font-bold text-primary mb-1">200+</div>
                    <div className="text-sm font-paragraph text-foreground/70">Master Artisans</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 rounded-2xl">
                    <div className="text-2xl font-heading font-bold text-primary mb-1">100%</div>
                    <div className="text-sm font-paragraph text-foreground/70">Natural Dyes</div>
                  </div>
                </div>
                
                <blockquote className="text-foreground/70 italic text-lg border-l-4 border-accent-color pl-6 my-8">
                  "Every thread tells a story. Every color carries history. Every pattern celebrates tradition."
                </blockquote>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop">
                  <Button 
                    size="lg"
                    className="h-14 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group transition-all duration-300 hover:scale-105"
                  >
                    Discover the Craft 
                    <ArrowRight className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1"/>
                  </Button>
                </Link>
                <Link to="/about">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-base rounded-2xl border-2 border-primary/30 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                  >
                    Our Story
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Promotions Section */}
        {promotions.length > 0 && (
          <section className="w-full py-16 md:py-20 bg-background relative">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <AnimatedElement>
                <div className="mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-3"
                  >
                    <div className="w-1 h-6 bg-accent-color rounded-full"></div>
                    <span className="font-paragraph text-xs font-semibold text-accent-color uppercase tracking-widest">Limited Time</span>
                  </motion.div>
                  <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-3">Seasonal Offerings</h2>
                </div>
              </AnimatedElement>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {promotions[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="lg:col-span-3"
                  >
                    <a href={promotions[0].callToActionUrl} className="group relative block overflow-hidden h-[350px] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      <Image
                        src={promotions[0].bannerImage || "https://static.wixstatic.com/media/07221c_a7a400975312440d932b7a737b5ebebf~mv2.png?originWidth=896&originHeight=448"}
                        alt={promotions[0].title || 'Seasonal Promotion'}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        width={600}
                        height={350}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 p-6 md:p-8 text-primary-foreground w-full"
                      >
                        <h3 className="font-heading text-2xl md:text-3xl mb-2 font-bold text-white drop-shadow-lg">{promotions[0].title}</h3>
                        <p className="font-paragraph text-sm md:text-base max-w-md mb-4 text-white/95 drop-shadow-md">{promotions[0].description}</p>
                        <Button size="sm" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold rounded-sm shadow-lg text-sm">Shop Now</Button>
                      </motion.div>
                    </a>
                  </motion.div>
                )}
                {promotions[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="lg:col-span-2"
                  >
                    <a href={promotions[1].callToActionUrl} className="group relative block overflow-hidden h-[350px] bg-secondary/30 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      <Image
                        src={promotions[1].bannerImage || "https://static.wixstatic.com/media/07221c_13a941c0dfd84492b785af619b1d7ae3~mv2.png?originWidth=896&originHeight=448"}
                        alt={promotions[1].title || 'Special Offer'}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        width={400}
                        height={350}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 p-6 text-primary-foreground w-full"
                      >
                        <h3 className="font-heading text-xl md:text-2xl mb-2 font-bold text-white drop-shadow-lg">{promotions[1].title}</h3>
                        <p className="font-paragraph text-sm mb-3 text-white/95 drop-shadow-md">{promotions[1].description}</p>
                        <Button variant="secondary" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold rounded-sm shadow-lg text-sm">Explore</Button>
                      </motion.div>
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us Section - Premium Value Proposition */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-b from-background to-secondary/15 relative overflow-hidden">
          <div className="absolute inset-0 heritage-texture opacity-20"></div>
          <DecorativePattern className="text-primary/3 premium-shimmer heritage-float" animated={true} />
          
          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            <AnimatedElement className="text-center max-w-4xl mx-auto mb-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-[0.2em]">
                    Why Choose Us
                  </span>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                </div>
                
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                  The Kalamkari Promise
                </h2>
                
                <p className="font-paragraph text-lg md:text-xl text-foreground/80 leading-relaxed">
                  We are committed to delivering not just a product, but an experience steeped in authenticity, quality, and respect for tradition. Every purchase supports artisan families and preserves cultural heritage.
                </p>
              </motion.div>
            </AnimatedElement>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {whyChooseUsItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-accent-color/20 via-primary/20 to-accent-color/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"></div>
                  
                  {/* Card Content */}
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-4 border border-white/50">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-color/20 to-primary/20 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-10 h-10 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-heading text-xl lg:text-2xl text-foreground mb-4 text-center leading-tight">
                      {item.title}
                    </h3>
                    
                    <p className="font-paragraph text-base text-foreground/70 leading-relaxed text-center mb-6">
                      {item.description}
                    </p>
                    
                    {/* Highlight Badge */}
                    <div className="text-center">
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-color/10 to-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20">
                        ✨ {item.highlight}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-20 text-center"
            >
              <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 text-foreground/70">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 fill-accent-color text-accent-color" />
                  <span className="font-paragraph text-sm lg:text-base">4.9/5 Customer Rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <Scissors className="w-6 h-6 text-primary" />
                  <span className="font-paragraph text-sm lg:text-base">Handcrafted Excellence</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="font-paragraph text-sm lg:text-base">10,000+ Happy Customers</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Visual Gallery - Premium Showcase */}
        <section className="w-full py-20 md:py-28 bg-background relative">
          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 mb-16">
            <AnimatedElement>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-[0.2em]">
                    Visual Gallery
                  </span>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"></div>
                </div>
                
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                  Woven in Elegance
                </h2>
                
                <p className="font-paragraph text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Explore the vibrant world of Kalamkari through our visual journal of artistry, tradition, and contemporary elegance.
                </p>
              </motion.div>
            </AnimatedElement>
          </div>
          
          {/* Enhanced Gallery Container */}
          <div className="relative">
            <div ref={galleryScrollRef} className="premium-scroll overflow-x-auto pb-8 px-6 md:px-8 lg:px-12">
              <div className="flex gap-8 w-max">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    viewport={{ once: true, margin: "0px 100px" }}
                    whileHover={{ y: -12, scale: 1.02 }}
                    className="gallery-item w-[35vh] md:w-[40vh] lg:w-[45vh] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group relative"
                  >
                    {/* Image */}
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category Label */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100"
                    >
                      <span className="inline-block glass-morphism text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md">
                        {image.category}
                      </span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Enhanced Scroll Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute bottom-0 right-8 md:right-16 flex items-center gap-3 text-foreground/50 text-sm font-paragraph uppercase tracking-[0.15em]"
            >
              <span>Auto-scrolling Gallery</span>
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section - Premium Subscription */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-br from-primary via-amber-800 to-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 heritage-texture opacity-10"></div>
          <DecorativePattern className="text-primary-foreground/8 premium-shimmer heritage-float" animated={true} />
          
          <div className="max-w-4xl mx-auto text-center px-6 md:px-8 lg:px-12 relative z-10">
            <AnimatedElement>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-4 mb-8">
                  <Sparkles className="w-6 h-6 text-accent-color" />
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-[0.2em]">
                    Stay Connected
                  </span>
                  <Sparkles className="w-6 h-6 text-accent-color" />
                </div>
                
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-tight text-shadow-luxury">
                  Join the Heritage Collective
                </h2>
                
                <p className="font-paragraph text-lg md:text-xl text-primary-foreground/95 mb-12 leading-relaxed max-w-3xl mx-auto">
                  Become a part of our story. Receive exclusive access to new collections, artisan stories, cultural insights, and special member-only offers.
                </p>
                
                {/* Enhanced Newsletter Form */}
                <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-grow h-14 px-6 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl placeholder:text-foreground/50 font-paragraph focus:ring-4 focus:ring-primary-foreground/30 focus:outline-none focus:border-primary-foreground text-foreground text-base transition-all duration-300"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-14 px-8 rounded-2xl font-paragraph bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold text-base transition-all duration-300 hover:scale-105 shadow-xl"
                  >
                    Subscribe Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-6 text-primary-foreground/80 text-sm font-paragraph mb-6">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                    <span>5,000+ Subscribers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-accent-color text-accent-color" />
                    <span>Exclusive Content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent-color" />
                    <span>Member Benefits</span>
                  </div>
                </div>
                
                <p className="text-sm text-primary-foreground/70 font-paragraph">
                  We respect your privacy. Unsubscribe at any time. No spam, just beautiful heritage content.
                </p>
              </motion.div>
            </AnimatedElement>
          </div>
        </section>

      </main>
    </>
  );
}
