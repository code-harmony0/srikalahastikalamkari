import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useAnimation, useInView } from 'framer-motion';
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
  const [featuredProducts, setFeaturedProducts] = useState<Products[]>([]);
  const [promotions, setPromotions] = useState<Promotions[]>([]);
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

  // Enhanced handcrafted fabric background images with better variety
  const heroBackgroundImages = [
    {
      src: 'https://static.wixstatic.com/media/07221c_0b754ad420fd4c2caea1a72b3ad2e7ff~mv2.png?originWidth=1920&originHeight=1024',
      alt: 'Handcrafted Kalamkari silk saree with intricate tree of life motifs',
      brightness: 'dark', // For white text
      seoKeywords: 'handcrafted kalamkari silk saree tree of life'
    },
    {
      src: 'https://static.wixstatic.com/media/07221c_9ea5a7cb1e4d40fb832cc400e2d6b2fd~mv2.png?originWidth=1920&originHeight=1024',
      alt: 'Premium cotton Kalamkari saree with traditional peacock patterns',
      brightness: 'light', // For dark text
      seoKeywords: 'premium cotton kalamkari saree peacock patterns'
    },
    {
      src: 'https://static.wixstatic.com/media/07221c_3d2089764404458fa47df692b1921434~mv2.png?originWidth=1920&originHeight=1024',
      alt: 'Heritage Kalamkari fabric with hand-painted floral designs',
      brightness: 'dark', // For white text
      seoKeywords: 'heritage kalamkari fabric hand painted floral'
    },
    {
      src: 'https://static.wixstatic.com/media/07221c_95267136773741e194ea4bf762fc8465~mv2.png?originWidth=1920&originHeight=1024',
      alt: 'Luxury Kalamkari textile with gold thread work and natural dyes',
      brightness: 'medium', // For adaptive text
      seoKeywords: 'luxury kalamkari textile gold thread natural dyes'
    }
  ];

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

  // Enhanced background image carousel with smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroBackgroundImages.length
      );
    }, 8000); // Slower transition for luxury feel

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

  // Background image carousel effect - Slower transition for luxury feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroBackgroundImages.length
      );
    }, 6000); // Change image every 6 seconds for more elegant pacing

    return () => clearInterval(interval);
  }, [heroBackgroundImages.length]);

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
        /* Single Static Kalamkari Motif Background - Premium & Unified */
        .kalamkari-static-background {
          background-color: #FDF8F2; /* Ivory base */
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A0522D' stroke-width='0.6' stroke-linecap='round' stroke-linejoin='round' opacity='0.06'%3E%3Cpath d='M50 30c18 0 32 14 32 32 0 25-18 45-32 45s-32-20-32-45c0-18 14-32 32-32z' fill='%23A0522D' fill-opacity='0.04'/%3E%3Cpath d='M150 120c15 0 27 12 27 27 0 21-15 39-27 39s-27-18-27-39c0-15 12-27 27-27z' fill='%23B8860B' fill-opacity='0.03'/%3E%3Cpath d='M120 50c12 0 22 10 22 22 0 16-12 30-22 30s-22-14-22-30c0-12 10-22 22-22z' fill='%23A0522D' fill-opacity='0.03'/%3E%3Cpath d='M70 140c10 0 18 8 18 18 0 14-10 25-18 25s-18-11-18-25c0-10 8-18 18-18z' fill='%23B8860B' fill-opacity='0.03'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 200px 200px;
          background-position: 0 0;
          background-repeat: repeat;
          background-attachment: fixed;
        }
        
        /* Silk Fabric Texture Overlay */
        .silk-fabric-texture {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(184, 134, 11, 0.015) 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(160, 82, 45, 0.01) 1px, transparent 1px),
            radial-gradient(circle at 60% 20%, rgba(253, 248, 242, 0.02) 0.5px, transparent 0.5px);
          background-size: 30px 30px, 25px 25px, 20px 20px;
          background-position: 0 0, 15px 15px, 10px 10px;
        }

        /* Enhanced GSAP-style Animation System with Improved Accessibility */
        .animate-reveal {
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .animate-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Respect user motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-reveal {
            transition: opacity 0.3s ease;
            transform: none;
          }
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Premium Typography with Enhanced Contrast and Accessibility */
        .luxury-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: #ffffff !important;
          text-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.9),
            0 4px 16px rgba(0, 0, 0, 0.8),
            0 8px 24px rgba(0, 0, 0, 0.6);
          letter-spacing: -0.02em;
          line-height: 0.85;
          animation: gsapHeadlineEntrance 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes gsapHeadlineEntrance {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.98);
            filter: blur(1px);
          }
          60% {
            opacity: 0.9;
            transform: translateY(10px) scale(0.99);
            filter: blur(0.3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .luxury-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          color: #ffffff !important;
          letter-spacing: 0.01em;
          text-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.9),
            0 4px 12px rgba(0, 0, 0, 0.7),
            0 6px 18px rgba(0, 0, 0, 0.5);
        }

        /* Enhanced Button Styles with Better Accessibility */
        .luxury-primary-button {
          background: linear-gradient(135deg, #A0522D 0%, #8B4513 50%, #654321 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .luxury-primary-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          transition: left 0.6s ease;
        }

        .luxury-primary-button:hover::before {
          left: 100%;
        }

        .luxury-primary-button:hover {
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .luxury-primary-button:focus {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }

        .luxury-secondary-button {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .luxury-secondary-button:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .luxury-secondary-button:focus {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }

        /* Smooth Fade/Slide Animations */
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
            filter: blur(0.5px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(5px) scale(0.99);
            filter: blur(0.2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .fade-in-delayed {
          animation: fadeInDelayed 1s ease-out 0.2s both;
        }

        @keyframes fadeInDelayed {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Enhanced Background Image Transitions */
        .hero-background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 2s ease-in-out;
          transform: scale(1.02);
          will-change: opacity;
        }

        .hero-background-image.active {
          opacity: 1;
          transform: scale(1.02);
        }

        .hero-background-image.inactive {
          opacity: 0;
          transform: scale(1.04);
        }
      `}</style>
      <main className="w-full kalamkari-static-background silk-fabric-texture text-foreground overflow-hidden">
        {/* Modern Luxury Hero Section - Kalamkari Heritage Reimagined */}
        <section 
          ref={heroRef}
          className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
          role="banner"
          aria-label="Kalamkari Heritage - Modern Luxury Collection"
        >
          {/* Premium Fabric Background Layers with Parallax */}
          <motion.div 
            style={{ y: heroY }}
            className="absolute inset-0 z-0 parallax-layer"
          >
            {/* Background Image Carousel - Enhanced Handcrafted Fabric Textures */}
            <div className="absolute inset-0">
              {heroBackgroundImages.map((image, index) => (
                <Image
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  width={1920}
                  height={1080}
                  className={`hero-background-image ${
                    index === currentImageIndex ? 'active' : 'inactive'
                  }`}
                />
              ))}
            </div>
            
            {/* Enhanced Semi-transparent Gradient Overlay */}
            <div className="absolute inset-0 luxury-fabric-overlay"></div>
            
            {/* Floating Particles for Premium Feel */}
            <div className="absolute inset-0 floating-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
          </motion.div>
          
          {/* Enhanced Hero Content with Adaptive Text and GSAP Animations */}
          <motion.div
            style={{ 
              opacity: heroOpacity,
              scale: heroScale
            }}
            animate={heroControls}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            className="relative z-10 flex flex-col items-center text-center px-6 md:px-8 lg:px-12 max-w-6xl mx-auto w-full"
          >
            {/* SEO-optimized structured data for e-commerce */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Store",
                "name": "Shri Kalamkari",
                "description": "Premium handcrafted Kalamkari sarees with traditional artistry and modern luxury",
                "url": window.location.origin,
                "image": heroBackgroundImages[currentImageIndex]?.src,
                "priceRange": "₹₹₹",
                "paymentAccepted": ["Cash", "Credit Card", "UPI"],
                "currenciesAccepted": "INR",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "IN"
                }
              })}
            </script>

            {/* Elegant Divider with Enhanced Animation */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ 
                duration: 2, 
                delay: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="mb-16 md:mb-20 flex items-center justify-center"
            >
              <div className="cinematic-divider"></div>
            </motion.div>

            {/* Enhanced Headlines with Fixed White Text Color */}
            <motion.h1
              className={`luxury-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[0.85] tracking-tight mb-10 md:mb-12`}
            >
              <motion.span 
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 2.2, 
                  delay: 1.2,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="block text-white"
              >
                Kalamkari
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 2.2, 
                  delay: 1.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="block text-white font-light"
              >
                Heritage
              </motion.span>
            </motion.h1>

            {/* Enhanced Tagline with Fixed White Text */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 2.2, 
                delay: 2.0, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="mb-16 md:mb-18"
            >
              <p className="luxury-tagline text-white text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-4xl mx-auto text-center">
                "Where ancient artistry meets modern luxury, each thread tells a story of timeless elegance"
              </p>
            </motion.div>

            {/* Enhanced CTA Buttons with Modern Design */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 2.2, 
                delay: 2.5, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="flex flex-col sm:flex-row gap-5 md:gap-6 max-w-2xl mx-auto w-full"
            >
              <Link to="/shop" className="group flex-1">
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    size="lg" 
                    className="luxury-primary-button text-white px-10 py-5 text-lg font-medium rounded-2xl w-full h-16"
                    aria-label="Explore our handcrafted Kalamkari saree collection"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3 font-serif">
                      Explore Collection
                      <motion.span
                        className="inline-block text-xl"
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        →
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              </Link>
              <Link to="/about" className="group flex-1">
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="luxury-secondary-button text-white px-10 py-5 text-lg font-medium rounded-2xl w-full h-16"
                    aria-label="Learn about our heritage and artisan story"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3 font-serif">
                      Our Heritage
                      <motion.span
                        className="inline-block text-lg"
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        ✨
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
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
                    <div className="p-3.5 space-y-2.5">
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
                  <AnimatedElement key={product._id} delay={index * 80}>
                    <Link 
                      to={`/product/${product._id}`} 
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
                            src={product.mainImage || "https://static.wixstatic.com/media/07221c_a745fb56ce03452288286aef2ba62a22~mv2.png?originWidth=384&originHeight=512"}
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

                        {/* Product Info - Reduced Padding */}
                        <div className="p-3.5 flex-grow flex flex-col">
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
              <Link to="/shop">
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
                      src="https://static.wixstatic.com/media/07221c_63f62de1d1f548ff870b8e13f01daf64~mv2.png?originWidth=576&originHeight=576"
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
                  className="grid grid-cols-2 gap-4 mb-10"
                >
                  <motion.div 
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-md rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-400"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CountUpNumber 
                        end={200} 
                        duration={2000}
                        className="text-2xl font-heading font-bold text-primary tracking-tight"
                        suffix="+"
                      />
                      <div className="text-sm font-paragraph text-foreground/60 font-medium">Artisans</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-md rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-400"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-color/15 to-accent-color/5 rounded-xl flex items-center justify-center">
                      <Palette className="w-6 h-6 text-accent-color" />
                    </div>
                    <div>
                      <CountUpNumber 
                        end={100} 
                        duration={2000}
                        className="text-2xl font-heading font-bold text-primary tracking-tight"
                        suffix="%"
                      />
                      <div className="text-sm font-paragraph text-foreground/60 font-medium">Natural</div>
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
                    <Link to="/shop">
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
                    <Link to="/about">
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
          <section className="w-full py-24 md:py-32 relative overflow-hidden">
            
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
                            src={promotions[0].bannerImage || "https://static.wixstatic.com/media/07221c_a7a400975312440d932b7a737b5ebebf~mv2.png?originWidth=896&originHeight=448"}
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
                            src={promotions[1].bannerImage || "https://static.wixstatic.com/media/07221c_13a941c0dfd84492b785af619b1d7ae3~mv2.png?originWidth=896&originHeight=448"}
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
                    className="relative bg-white/95 backdrop-blur-sm rounded-[1.5rem] p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/60 group-hover:border-accent-color/20 overflow-hidden"
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
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-color/15 via-accent-color/25 to-accent-color/15 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-500"></div>
                      <div className="absolute inset-1 bg-gradient-to-br from-accent-color/8 via-white/10 to-transparent rounded-xl"></div>
                      <div className="absolute inset-3 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
                      
                      {/* Icon */}
                      <item.icon className="w-10 h-10 text-accent-color relative z-10" />
                    </motion.div>
                    
                    {/* Content with Smooth Animations */}
                    <motion.h3 
                      className="font-heading text-xl lg:text-2xl text-foreground mb-6 text-center leading-tight group-hover:text-primary transition-colors duration-400 font-light tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                      viewport={{ once: true }}
                    >
                      {item.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="font-paragraph text-base text-foreground/70 leading-relaxed text-center mb-8 font-light"
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
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-accent-color/8 via-accent-color/12 to-accent-color/8 text-primary rounded-xl border border-accent-color/15 shadow-sm group-hover:shadow-md transition-all duration-500 backdrop-blur-sm"
                      >
                        <Sparkles className="w-4 h-4 text-accent-color mr-2" />
                        <span className="font-heading font-light text-sm tracking-wide">
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
                      className="absolute inset-0 border-2 border-transparent group-hover:border-accent-color/40 rounded-3xl transition-all duration-400"
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

        {/* Enhanced Newsletter Section - Premium Subscription with Gradient & Woven Texture */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          {/* Enhanced Gradient Background with Woven Texture */}
          <div className="absolute inset-0">
            {/* Primary gradient layer */}
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #A0522D 0%, #8B4513 25%, #B8860B 50%, #DAA520 75%, #A0522D 100%)",
                backgroundSize: "400% 400%"
              }}
            />
            
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(45deg, rgba(184, 134, 11, 0.3) 0%, rgba(255, 215, 0, 0.2) 25%, rgba(160, 82, 45, 0.3) 50%, rgba(218, 165, 32, 0.2) 75%, rgba(184, 134, 11, 0.3) 100%)",
                backgroundSize: "300% 300%"
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Woven texture pattern */}
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
                  linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%),
                  linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%)
                `,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
              }}
            />
            
            {/* Additional woven cross-hatch */}
            <motion.div 
              className="absolute inset-0 opacity-8"
              animate={{ 
                backgroundPosition: ["0px 0px", "40px 40px"],
                opacity: [0.08, 0.12, 0.08]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    rgba(255, 255, 255, 0.05) 0px,
                    transparent 1px,
                    transparent 10px,
                    rgba(255, 255, 255, 0.05) 11px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0.05) 0px,
                    transparent 1px,
                    transparent 10px,
                    rgba(255, 255, 255, 0.05) 11px
                  )
                `
              }}
            />
          </div>
          
          {/* Enhanced Heritage Texture Overlay */}
          <div className="absolute inset-0 opacity-12">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
                  radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                  radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 1.5px, transparent 1.5px)
                `,
                backgroundSize: "30px 30px, 20px 20px, 25px 25px"
              }}
            />
          </div>
          
          {/* Enhanced Decorative Pattern with Animation */}
          <motion.div
            className="absolute inset-0 opacity-8"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M50 15c19.33 0 35 15.67 35 35s-15.67 35-35 35S15 69.33 15 50 30.67 15 50 15zm0 10c-13.807 0-25 11.193-25 25s11.193 25 25 25 25-11.193 25-25-11.193-25-25-25z'/%3E%3Cpath d='M50 30c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "100px 100px"
              }}
            />
          </motion.div>
          
          {/* Floating Gold Elements */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-16 h-16 opacity-4"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8c12.15 0 22 9.85 22 22s-9.85 22-22 22S8 42.15 8 30 17.85 8 30 8z' fill='none' stroke='%23FFFFFF' stroke-width='1.5' stroke-opacity='0.3'/%3E%3Cpath d='M30 18c6.627 0 12 5.373 12 12s-5.373 12-12 12-12-5.373-12-12 5.373-12 12-12z' fill='%23FFFFFF' fill-opacity='0.2'/%3E%3C/svg%3E")`,
              filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))"
            }}
          />
          
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              x: [0, -8, 0],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-24 left-16 w-12 h-12 opacity-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5c11.046 0 20 8.954 20 20s-8.954 20-20 20S5 36.046 5 25 13.954 5 25 5z' fill='none' stroke='%23FFFFFF' stroke-width='1' stroke-opacity='0.4'/%3E%3Ccircle cx='25' cy='25' r='8' fill='%23FFFFFF' fill-opacity='0.15'/%3E%3C/svg%3E")`,
              filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.15))"
            }}
          />
          
          <div className="max-w-5xl mx-auto text-center px-6 md:px-8 lg:px-12 relative z-10">
            <AnimatedElement>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
              >
                {/* Enhanced Header with Animated Badges */}
                <div className="flex items-center justify-center gap-6 mb-10">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-7 h-7 text-accent-color" style={{ filter: "drop-shadow(0 0 8px rgba(184, 134, 11, 0.5))" }} />
                  </motion.div>
                  
                  <motion.span 
                    className="font-paragraph text-base font-bold text-accent-color uppercase tracking-[0.3em] px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    Stay Connected
                    {/* Animated shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.span>
                  
                  <motion.div
                    animate={{ rotate: [360, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-7 h-7 text-accent-color" style={{ filter: "drop-shadow(0 0 8px rgba(184, 134, 11, 0.5))" }} />
                  </motion.div>
                </div>
                
                {/* Enhanced Title with Gold Glow */}
                <motion.h2 
                  className="font-heading text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-8 leading-tight relative"
                  style={{
                    textShadow: "0 0 30px rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)",
                    filter: "drop-shadow(0 0 20px rgba(184, 134, 11, 0.2))"
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  Join the Heritage Collective
                  
                  {/* Floating gold particles around title */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-3 h-3 bg-gradient-radial from-accent-color to-transparent rounded-full"
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: "blur(0.5px) drop-shadow(0 0 8px rgba(184, 134, 11, 0.6))" }}
                  />
                  
                  <motion.div
                    className="absolute -bottom-2 -left-6 w-2 h-2 bg-gradient-radial from-amber-400 to-transparent rounded-full"
                    animate={{ 
                      x: [0, 8, 0],
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    style={{ filter: "blur(0.3px) drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))" }}
                  />
                </motion.h2>
                
                {/* Enhanced Description */}
                <motion.p 
                  className="font-paragraph text-xl md:text-2xl text-primary-foreground/95 mb-14 leading-relaxed max-w-4xl mx-auto font-light"
                  style={{
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Become a part of our story. Receive exclusive access to new collections, artisan stories, cultural insights, and special member-only offers.
                </motion.p>
                
                {/* Enhanced Newsletter Form with Improved Input & Button */}
                <motion.form 
                  className="flex flex-col sm:flex-row gap-5 max-w-3xl mx-auto mb-10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="flex-grow relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full h-16 px-8 bg-white/95 backdrop-blur-md border-2 border-white/60 hover:border-white/80 focus:border-accent-color rounded-2xl placeholder:text-foreground/60 font-paragraph focus:ring-4 focus:ring-accent-color/30 focus:outline-none text-foreground text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      style={{
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                      }}
                    />
                    {/* Input glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: "linear-gradient(45deg, transparent, rgba(184, 134, 11, 0.1), transparent)",
                        filter: "blur(1px)"
                      }}
                    />
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="h-16 px-10 rounded-2xl font-paragraph bg-gradient-to-r from-primary-foreground via-white to-primary-foreground hover:from-white hover:via-primary-foreground hover:to-white text-primary font-bold text-lg transition-all duration-500 shadow-xl hover:shadow-2xl border-2 border-white/20 hover:border-accent-color/30 relative overflow-hidden group"
                      style={{
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                      }}
                    >
                      {/* Button shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-color/20 to-transparent opacity-0 group-hover:opacity-100"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      
                      <span className="relative z-10 flex items-center gap-3">
                        Subscribe Now
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-6 h-6" />
                        </motion.div>
                      </span>
                    </Button>
                  </motion.div>
                </motion.form>
                
                {/* Enhanced Trust Indicators with Animated Badges */}
                <motion.div 
                  className="flex flex-wrap justify-center items-center gap-8 text-primary-foreground/90 text-base font-paragraph mb-8 font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="flex items-center gap-3 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Heart className="w-5 h-5 fill-red-400 text-red-400" style={{ filter: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))" }} />
                    </motion.div>
                    <span className="font-semibold">5,000+ Subscribers</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" style={{ filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))" }} />
                    </motion.div>
                    <span className="font-semibold">Exclusive Content</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3 px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Award className="w-5 h-5 text-accent-color" style={{ filter: "drop-shadow(0 0 8px rgba(184, 134, 11, 0.5))" }} />
                    </motion.div>
                    <span className="font-semibold">Member Benefits</span>
                  </motion.div>
                </motion.div>
                
                {/* Enhanced Privacy Notice */}
                <motion.p 
                  className="text-base text-primary-foreground/80 font-paragraph leading-relaxed"
                  style={{
                    textShadow: "0 1px 4px rgba(0, 0, 0, 0.3)"
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  viewport={{ once: true }}
                >
                  We respect your privacy. Unsubscribe at any time. No spam, just beautiful heritage content.
                </motion.p>
              </motion.div>
            </AnimatedElement>
          </div>
        </section>

      </main>
    </>
  );
}
