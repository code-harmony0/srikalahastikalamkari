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
        /* Enhanced GSAP-style Animation System with Improved Accessibility */
        .animate-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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

        /* Enhanced Semi-transparent Gradient Overlay with Better Contrast */
        .luxury-fabric-overlay {
          background: 
            /* Main gradient for text readability */
            linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.45) 0%,
              rgba(0, 0, 0, 0.25) 25%,
              rgba(0, 0, 0, 0.35) 50%,
              rgba(0, 0, 0, 0.15) 75%,
              rgba(0, 0, 0, 0.4) 100%
            ),
            /* Vignette effect for depth */
            radial-gradient(
              ellipse at center,
              transparent 0%,
              rgba(0, 0, 0, 0.15) 50%,
              rgba(0, 0, 0, 0.4) 100%
            );
          backdrop-filter: blur(1px) saturate(1.1);
          animation: luxuryFabricFlow 20s ease-in-out infinite;
        }

        @keyframes luxuryFabricFlow {
          0%, 100% { 
            opacity: 0.95; 
            filter: brightness(1) contrast(1.05) saturate(1.1); 
          }
          50% { 
            opacity: 1; 
            filter: brightness(1.05) contrast(1.08) saturate(1.15); 
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
          animation: gsapHeadlineEntrance 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes gsapHeadlineEntrance {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
            filter: blur(2px);
          }
          60% {
            opacity: 0.9;
            transform: translateY(15px) scale(0.99);
            filter: blur(0.5px);
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

        /* Enhanced Floating Particles with Performance Optimization */
        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 5;
          will-change: transform;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184, 134, 11, 0.4) 0%, rgba(255, 215, 0, 0.2) 50%, transparent 100%);
          animation: floatParticle 15s ease-in-out infinite;
          filter: blur(0.5px);
          will-change: transform;
        }

        .particle:nth-child(1) {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 15%;
          animation-delay: 0s;
          animation-duration: 16s;
        }

        .particle:nth-child(2) {
          width: 6px;
          height: 6px;
          top: 65%;
          left: 80%;
          animation-delay: 2s;
          animation-duration: 18s;
        }

        .particle:nth-child(3) {
          width: 3px;
          height: 3px;
          top: 35%;
          left: 70%;
          animation-delay: 4s;
          animation-duration: 14s;
        }

        .particle:nth-child(4) {
          width: 5px;
          height: 5px;
          top: 80%;
          left: 25%;
          animation-delay: 6s;
          animation-duration: 17s;
        }

        .particle:nth-child(5) {
          width: 7px;
          height: 7px;
          top: 50%;
          left: 55%;
          animation-delay: 8s;
          animation-duration: 19s;
        }

        .particle:nth-child(6) {
          width: 4px;
          height: 4px;
          top: 15%;
          left: 45%;
          animation-delay: 10s;
          animation-duration: 15s;
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-25px) translateX(20px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-15px) translateX(-15px) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-35px) translateX(25px) scale(1.1);
            opacity: 0.7;
          }
        }

        /* Enhanced Background Image Transitions with Performance */
        .hero-background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 3s ease-in-out;
          transform: scale(1.05);
          will-change: opacity, transform;
        }

        .hero-background-image.active {
          opacity: 1;
          transform: scale(1.05);
        }

        .hero-background-image.inactive {
          opacity: 0;
          transform: scale(1.08);
        }

        /* Enhanced Parallax Effects with Performance */
        .parallax-enhanced {
          transform-style: preserve-3d;
          will-change: transform;
          backface-visibility: hidden;
        }

        /* Refined Cinematic Divider */
        .cinematic-divider {
          position: relative;
          width: 100px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 134, 11, 0.4) 20%,
            rgba(255, 215, 0, 0.8) 50%,
            rgba(184, 134, 11, 0.4) 80%,
            transparent 100%
          );
          overflow: hidden;
          animation: dividerPulse 6s ease-in-out infinite;
        }

        .cinematic-divider::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 215, 0, 0.8) 30%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 215, 0, 0.8) 70%,
            transparent 100%
          );
          animation: dividerShine 4s ease-in-out infinite;
        }

        @keyframes dividerPulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: scaleX(1); 
          }
          50% { 
            opacity: 1; 
            transform: scaleX(1.1); 
          }
        }

        @keyframes dividerShine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: -100%; }
        }

        /* SEO-optimized animations with better performance */
        .seo-fade-in {
          animation: seoFadeIn 2s ease-out;
        }

        @keyframes seoFadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Modern glass morphism with enhanced accessibility */
        .modern-glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        /* Responsive text scaling with improved readability */
        @media (max-width: 640px) {
          .luxury-headline {
            text-shadow: 
              0 1px 4px rgba(0, 0, 0, 0.9),
              0 2px 8px rgba(0, 0, 0, 0.7);
          }
          
          .luxury-tagline {
            text-shadow: 
              0 1px 3px rgba(0, 0, 0, 0.9),
              0 2px 6px rgba(0, 0, 0, 0.7);
          }
        }

        @keyframes luxuryGoldFlow {
          0%, 100% { 
            background-position: 0% 50%; 
            filter: brightness(1) saturate(1.2);
          }
          50% { 
            background-position: 100% 50%; 
            filter: brightness(1.3) saturate(1.5);
          }
        }

        /* Enhanced Button Styles with Luxury Feel */
        .luxury-primary-button {
          background: linear-gradient(135deg, #A0522D 0%, #8B4513 50%, #654321 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
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
          transition: left 0.8s ease;
        }

        .luxury-primary-button:hover::before {
          left: 100%;
        }

        .luxury-primary-button:hover {
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%);
          transform: translateY(-3px) scale(1.02);
        }

        .luxury-secondary-button {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .luxury-secondary-button:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(51, 51, 51, 0.4);
          transform: translateY(-3px) scale(1.02);
        }

        /* Enhanced Smooth Fade-in Animations with Performance */
        .fade-in-up {
          animation: fadeInUp 1.5s ease-out;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.98);
            filter: blur(2px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(10px) scale(0.99);
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .fade-in-delayed {
          animation: fadeInDelayed 2s ease-out 0.3s both;
        }

        @keyframes fadeInDelayed {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Parallax Layer with Performance Optimization */
        .parallax-layer {
          transform-style: preserve-3d;
          will-change: transform;
          backface-visibility: hidden;
        }

        /* Background Image Transitions with Better Performance */
        .hero-background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 2.5s ease-in-out;
          transform: scale(1.05);
          will-change: opacity;
        }

        .hero-background-image.active {
          opacity: 1;
          transform: scale(1.05);
        }

        .hero-background-image.inactive {
          opacity: 0;
          transform: scale(1.08);
        }

        /* Enhanced Text Legibility with Better Contrast */
        .text-shadow-luxury {
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.9),
            0 4px 8px rgba(0, 0, 0, 0.7),
            0 6px 12px rgba(0, 0, 0, 0.5);
        }

        .text-shadow-soft {
          text-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.7),
            0 2px 6px rgba(0, 0, 0, 0.5);
        }

        /* Modern Gradient Overlay with Enhanced Accessibility */
        .modern-gradient-overlay {
          background: 
            /* Vignette effect */
            radial-gradient(
              ellipse at center,
              transparent 0%,
              rgba(0, 0, 0, 0.1) 40%,
              rgba(0, 0, 0, 0.25) 70%,
              rgba(0, 0, 0, 0.5) 100%
            ),
            /* Main gradient */
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.6) 0%,
              rgba(0, 0, 0, 0.4) 20%,
              rgba(0, 0, 0, 0.25) 40%,
              rgba(0, 0, 0, 0.1) 60%,
              rgba(0, 0, 0, 0.05) 80%,
              transparent 100%
            );
          animation: gradientBreathing 20s ease-in-out infinite;
        }

        @keyframes gradientBreathing {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }

        /* Moving Bokeh Shimmer Effects with Performance */
        .bokeh-shimmer {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 4;
          will-change: transform;
        }

        .bokeh-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184, 134, 11, 0.3) 0%, rgba(255, 215, 0, 0.15) 50%, transparent 100%);
          animation: bokehFloat 12s ease-in-out infinite;
          filter: blur(0.5px);
          will-change: transform;
        }

        .bokeh-particle:nth-child(1) {
          width: 6px;
          height: 6px;
          top: 25%;
          left: 15%;
          animation-delay: 0s;
          animation-duration: 14s;
        }

        .bokeh-particle:nth-child(2) {
          width: 8px;
          height: 8px;
          top: 55%;
          left: 75%;
          animation-delay: 2s;
          animation-duration: 16s;
        }

        .bokeh-particle:nth-child(3) {
          width: 4px;
          height: 4px;
          top: 45%;
          left: 35%;
          animation-delay: 4s;
          animation-duration: 13s;
        }

        .bokeh-particle:nth-child(4) {
          width: 7px;
          height: 7px;
          top: 75%;
          left: 55%;
          animation-delay: 6s;
          animation-duration: 15s;
        }

        .bokeh-particle:nth-child(5) {
          width: 9px;
          height: 9px;
          top: 20%;
          left: 65%;
          animation-delay: 8s;
          animation-duration: 17s;
        }

        @keyframes bokehFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translateY(-20px) translateX(15px) scale(1.1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-10px) translateX(-10px) scale(0.9);
            opacity: 0.3;
          }
          75% {
            transform: translateY(-25px) translateX(20px) scale(1.05);
            opacity: 0.5;
          }
        }

        /* Optimized Gradient Light Movement */
        .gradient-light-movement {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 134, 11, 0.1) 20%,
            rgba(255, 215, 0, 0.06) 40%,
            rgba(184, 134, 11, 0.08) 60%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: gradientLightMove 15s ease-in-out infinite;
        }

        @keyframes gradientLightMove {
          0% { background-position: -200% 0; }
          50% { background-position: 100% 0; }
          100% { background-position: -200% 0; }
        }

        /* Refined Soft Gradient with Better Performance */
        .refined-soft-gradient {
          background: radial-gradient(
            ellipse at center,
            rgba(245, 245, 220, 0.08) 0%,
            rgba(222, 184, 135, 0.12) 30%,
            rgba(160, 82, 45, 0.15) 70%,
            rgba(101, 67, 33, 0.18) 100%
          );
          animation: refinedSoftPulse 10s ease-in-out infinite;
        }

        @keyframes refinedSoftPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.01); }
        }

        /* Cinematic Lighting with Optimized Performance */
        .cinematic-lighting-2025 {
          background: 
            radial-gradient(circle at 30% 20%, rgba(184, 134, 11, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(160, 82, 45, 0.08) 0%, transparent 50%),
            linear-gradient(45deg, transparent 40%, rgba(245, 245, 220, 0.06) 50%, transparent 60%);
          animation: cinematicLighting 12s ease-in-out infinite;
        }

        @keyframes cinematicLighting {
          0%, 100% { opacity: 0.6; }
          25% { opacity: 0.7; }
          50% { opacity: 0.65; }
          75% { opacity: 0.8; }
        }

        /* Elegant Serif Headlines with Improved Performance */
        .elegant-serif-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          text-shadow: 
            0 3px 8px rgba(0, 0, 0, 0.7),
            0 6px 16px rgba(0, 0, 0, 0.5),
            0 2px 4px rgba(255, 255, 255, 0.1);
          animation: cinematicEntrance 2.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes cinematicEntrance {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
            letter-spacing: 0.1em;
            filter: blur(1px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(8px) scale(0.99);
            letter-spacing: 0.03em;
            filter: blur(0.3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            letter-spacing: 0.02em;
            filter: blur(0);
          }
        }

        /* Gold Italic Tagline with Better Performance */
        .gold-italic-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          background: linear-gradient(
            135deg,
            #B8860B 0%,
            #DAA520 25%,
            #FFD700 50%,
            #F4A460 75%,
            #B8860B 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldTaglineFlow 6s ease-in-out infinite;
          text-shadow: 0 2px 6px rgba(184, 134, 11, 0.25);
        }

        @keyframes goldTaglineFlow {
          0%, 100% { 
            background-position: 0% 50%; 
            filter: brightness(1) saturate(1.1);
          }
          50% { 
            background-position: 100% 50%; 
            filter: brightness(1.15) saturate(1.25);
          }
        }

        /* Animated Divider with Optimized Performance */
        .cinematic-divider {
          position: relative;
          width: 100px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 134, 11, 0.3) 20%,
            rgba(255, 215, 0, 0.7) 50%,
            rgba(184, 134, 11, 0.3) 80%,
            transparent 100%
          );
          overflow: hidden;
          animation: dividerPulse 5s ease-in-out infinite;
        }

        .cinematic-divider::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 215, 0, 0.8) 30%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 215, 0, 0.8) 70%,
            transparent 100%
          );
          animation: dividerShine 3s ease-in-out infinite;
        }

        @keyframes dividerPulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: scaleX(1); 
          }
          50% { 
            opacity: 1; 
            transform: scaleX(1.05); 
          }
        }

        @keyframes dividerShine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: -100%; }
        }

        /* Cinematic Entrance Animations with Better Performance */
        .cinematic-entrance {
          animation: cinematicSlideIn 2s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes cinematicSlideIn {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.98);
            filter: blur(1.5px);
          }
          40% {
            opacity: 0.6;
            transform: translateY(15px) scale(0.99);
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        /* Refined Animations with Better Performance */
        .refined-fade-in {
          animation: refinedFadeIn 2s ease-out;
        }

        @keyframes refinedFadeIn {
          0% { opacity: 0; transform: translateY(25px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .refined-slide-up {
          animation: refinedSlideUp 2.3s ease-out 0.2s both;
        }

        @keyframes refinedSlideUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Refined Gold Gradient with Better Performance */
        .refined-gold-gradient {
          background: linear-gradient(
            135deg,
            #B8860B 0%,
            #DAA520 25%,
            #FFD700 50%,
            #DAA520 75%,
            #B8860B 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: refinedGoldFlow 6s ease-in-out infinite;
        }

        @keyframes refinedGoldFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Refined Shimmer Text with Better Performance */
        .refined-shimmer-text {
          position: relative;
          overflow: hidden;
        }

        .refined-shimmer-text::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.25) 50%,
            transparent 100%
          );
          animation: refinedShimmer 5s ease-in-out infinite;
        }

        @keyframes refinedShimmer {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        .refined-body-text {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          animation: refinedBodyFloat 8s ease-in-out infinite;
        }

        @keyframes refinedBodyFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.85; }
          50% { transform: translateY(-1px); opacity: 1; }
        }

        /* Premium Button Interactions with Better Performance */
        .luxury-button {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(184, 134, 11, 0.3);
        }

        .luxury-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.3) 0%,
            rgba(184, 134, 11, 0.15) 50%,
            transparent 100%
          );
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }

        .luxury-button:hover::before {
          width: 300px;
          height: 300px;
        }

        .luxury-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 12px 40px rgba(184, 134, 11, 0.3),
            0 6px 20px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-color: rgba(184, 134, 11, 0.5);
        }

        .luxury-button:active {
          transform: translateY(-1px) scale(1.01);
          transition: all 0.15s ease;
        }

        .luxury-button:focus {
          outline: 2px solid rgba(184, 134, 11, 0.6);
          outline-offset: 2px;
        }

        /* Parallax Enhancement with Better Performance */
        .parallax-enhanced {
          transform-style: preserve-3d;
          will-change: transform;
          backface-visibility: hidden;
        }

        /* Refined UI Components with Better Accessibility */
        .refined-glass-badge {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Handcrafted Luxury Lighting Effects with Better Performance */
        .luxury-lighting {
          background: 
            radial-gradient(circle at 30% 20%, rgba(184, 134, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(160, 82, 45, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.03) 0%, transparent 60%),
            linear-gradient(45deg, transparent 40%, rgba(245, 245, 220, 0.05) 50%, transparent 60%);
          animation: luxuryLightingFlow 20s ease-in-out infinite;
        }

        @keyframes luxuryLightingFlow {
          0%, 100% { opacity: 0.8; filter: brightness(1) contrast(1.05); }
          25% { opacity: 0.85; filter: brightness(1.05) contrast(1.08); }
          50% { opacity: 0.82; filter: brightness(1.03) contrast(1.06); }
          75% { opacity: 0.88; filter: brightness(1.08) contrast(1.1); }
        }

        /* Background Image Carousel Styles with Better Performance */
        .hero-carousel-container {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }

        .hero-carousel-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 2s ease-in-out;
          transform: scale(1.05);
          z-index: 1;
          will-change: opacity;
        }

        .hero-carousel-image.active {
          opacity: 1;
        }

        .hero-carousel-image.inactive {
          opacity: 0;
        }
        /* Kalamkari Background with Better Performance */
        .kalamkari-pen-background {
          background: 
            radial-gradient(circle at 20% 30%, rgba(184, 134, 11, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(160, 82, 45, 0.04) 0%, transparent 40%),
            linear-gradient(135deg, rgba(245, 245, 220, 0.95) 0%, rgba(222, 184, 135, 0.98) 100%);
          animation: kalamkariFlow 15s ease-in-out infinite;
        }

        @keyframes kalamkariFlow {
          0%, 100% { opacity: 1; filter: hue-rotate(0deg); }
          50% { opacity: 0.96; filter: hue-rotate(1deg); }
        }

        /* Smooth Pen Stroke Animation with Better Performance */
        .pen-stroke-animation {
          background: linear-gradient(90deg, transparent 0%, rgba(184, 134, 11, 0.25) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: penStroke 6s ease-in-out infinite;
        }

        @keyframes penStroke {
          0%, 100% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
        }

        /* Minimal Button Styles with Better Accessibility */
        .minimal-primary-cta {
          background: linear-gradient(135deg, #A0522D 0%, #8B4513 100%);
          box-shadow: 
            0 4px 20px rgba(160, 82, 45, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        .minimal-primary-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          transition: left 0.5s ease;
        }

        .minimal-primary-cta:hover::before {
          left: 100%;
        }

        .minimal-primary-cta:hover {
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
          box-shadow: 
            0 6px 30px rgba(160, 82, 45, 0.35),
            0 3px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .minimal-primary-cta:focus {
          outline: 2px solid #A0522D;
          outline-offset: 2px;
        }

        .minimal-secondary-cta {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(51, 51, 51, 0.2);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .minimal-secondary-cta:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(51, 51, 51, 0.4);
          box-shadow: 
            0 6px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .minimal-secondary-cta:focus {
          outline: 2px solid rgba(51, 51, 51, 0.6);
          outline-offset: 2px;
        }

        /* Refined Trust and Scroll Animations with Better Performance */
        .luxury-cta-text {
          font-weight: 600;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
        }

        .refined-trust-item {
          animation: refinedTrustFloat 6s ease-in-out infinite;
        }

        .refined-trust-item:nth-child(1) { animation-delay: 0s; }
        .refined-trust-item:nth-child(2) { animation-delay: 1s; }
        .refined-trust-item:nth-child(3) { animation-delay: 2s; }

        @keyframes refinedTrustFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.8; }
          50% { transform: translateY(-3px); opacity: 1; }
        }

        .refined-scroll-indicator {
          animation: refinedScrollPulse 4s ease-in-out infinite;
        }

        @keyframes refinedScrollPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .refined-scroll-mouse {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .refined-scroll-mouse:hover {
          border-color: rgba(51, 51, 51, 0.8);
          transform: scale(1.1);
        }

        /* Responsive Refinements */
        @media (max-width: 640px) {
          .refined-headline-shadow {
            text-shadow: 
              0 1px 4px rgba(0, 0, 0, 0.15),
              0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .refined-gold-gradient {
            background: #B8860B;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: unset;
            background-clip: unset;
          }
        }

        /* Legacy Styles for Compatibility */
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
        <section className="w-full py-16 md:py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 heritage-texture opacity-30"></div>
          <DecorativePattern className="text-primary/3 premium-shimmer heritage-float" animated={true} />
          
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
        <section className="w-full py-20 md:py-28 bg-gradient-to-br from-background via-secondary/3 to-background relative overflow-hidden">
          {/* Subtle Kalamkari Background Motif */}
          <motion.div 
            className="absolute inset-0 opacity-2"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A0522D' fill-opacity='0.04'%3E%3Cpath d='M40 40c11.046 0 20-8.954 20-20S51.046 0 40 0 20 8.954 20 20s8.954 20 20 20zm0-3c9.389 0 17-7.611 17-17S49.389 3 40 3 23 10.611 23 20s7.611 17 17 17z'/%3E%3Cpath d='M40 30c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm0-1c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z'/%3E%3Ccircle cx='40' cy='20' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Floating Decorative Elements */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-16 right-16 w-20 h-20 opacity-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c13.807 0 25 11.193 25 25S43.807 55 30 55 5 43.807 5 30 16.193 5 30 5zm0 5c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20S41.046 10 30 10z' fill='%23A0522D'/%3E%3Cpath d='M30 18c6.627 0 12 5.373 12 12s-5.373 12-12 12-12-5.373-12-12 5.373-12 12-12z' fill='%23B8860B' fill-opacity='0.2'/%3E%3C/svg%3E")`,
            }}
          />
          
          <motion.div
            animate={{ 
              rotate: [360, 0],
              y: [0, -15, 0]
            }}
            transition={{ 
              duration: 18, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute bottom-20 left-12 w-16 h-16 opacity-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 3c12.15 0 22 9.85 22 22S37.15 47 25 47 3 37.15 3 25 12.85 3 25 3z' fill='none' stroke='%23A0522D' stroke-width='1.5'/%3E%3Cpath d='M25 12c7.18 0 13 5.82 13 13s-5.82 13-13 13-13-5.82-13-13 5.82-13 13-13z' fill='%23B8860B' fill-opacity='0.15'/%3E%3C/svg%3E")`,
            }}
          />

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
          <section className="w-full py-24 md:py-32 bg-gradient-to-br from-background via-secondary/8 to-background relative overflow-hidden">
            {/* Kalamkari Motif Background */}
            <motion.div 
              className="absolute inset-0 opacity-4"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A0522D' fill-opacity='0.08'%3E%3Cpath d='M60 10c27.614 0 50 22.386 50 50s-22.386 50-50 50S10 87.614 10 60 32.386 10 60 10zm0 15c-19.33 0-35 15.67-35 35s15.67 35 35 35 35-15.67 35-35-15.67-35-35-35z'/%3E%3Cpath d='M60 35c13.807 0 25 11.193 25 25s-11.193 25-25 25-25-11.193-25-25 11.193-25 25-25zm0 8c-9.389 0-17 7.611-17 17s7.611 17 17 17 17-7.611 17-17-7.611-17-17-17z'/%3E%3Ccircle cx='60' cy='60' r='4' fill='%23B8860B' fill-opacity='0.3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Floating Kalamkari Elements */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 40, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute top-16 right-16 w-32 h-32 opacity-6"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5c24.853 0 45 20.147 45 45S74.853 95 50 95 5 74.853 5 50 25.147 5 50 5z' fill='none' stroke='%23B8860B' stroke-width='1.5'/%3E%3Cpath d='M50 20c16.569 0 30 13.431 30 30s-13.431 30-30 30-30-13.431-30-30 13.431-30 30-30z' fill='%23A0522D' fill-opacity='0.1'/%3E%3Cpath d='M50 35c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z' fill='%23B8860B' fill-opacity='0.2'/%3E%3C/svg%3E")`,
              }}
            />
            
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
                      <div className="absolute inset-0 opacity-3 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23A0522D' fill-opacity='0.06'%3E%3Cpath d='M40 20c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3Cpath d='M40 30c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
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
                      <div className="absolute inset-0 opacity-3 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B' fill-opacity='0.06'%3E%3Cpath d='M40 15c13.807 0 25 11.193 25 25s-11.193 25-25 25-25-11.193-25-25 11.193-25 25-25z'/%3E%3Cpath d='M40 25c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
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

        {/* The Kalamkari Promise Section - Authentic Hand-drawn Motifs */}
        <section className="w-full py-20 md:py-24 relative overflow-hidden">
          {/* Ivory/Parchment Base Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6E3] via-[#FAF0E6] to-[#F5F5DC]"></div>
          
          {/* Authentic Kalamkari Floral Vines - Hand-drawn Style */}
          <div 
            className="absolute inset-0 opacity-12"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A0522D' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Flowing vine with organic curves --%3E%3Cpath d='M20 120c20-40 60-20 80-60s60 20 80-20 40 40 40 80-20 60-60 40-40-60-80-20-60-40-60-20z' fill='none' stroke-opacity='0.15'/%3E%3C!-- Delicate leaves along vine --%3E%3Cpath d='M45 95c8-4 12 2 8 8s-12 2-8-8z' fill='%23A0522D' fill-opacity='0.08'/%3E%3Cpath d='M85 75c6-6 14 0 8 8s-14 2-8-8z' fill='%23A0522D' fill-opacity='0.08'/%3E%3Cpath d='M125 85c8-2 10 6 4 8s-12-2-4-8z' fill='%23A0522D' fill-opacity='0.08'/%3E%3Cpath d='M165 105c6-4 12 4 6 8s-12 0-6-8z' fill='%23A0522D' fill-opacity='0.08'/%3E%3C!-- Small decorative flowers --%3E%3Ccircle cx='60' cy='110' r='3' fill='%23B8860B' fill-opacity='0.12'/%3E%3Ccircle cx='140' cy='90' r='2.5' fill='%23B8860B' fill-opacity='0.12'/%3E%3Ccircle cx='180' cy='130' r='2' fill='%23B8860B' fill-opacity='0.12'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "240px 240px",
              backgroundPosition: "0 0, 120px 120px"
            }}
          />
          
          {/* Traditional Paisley Motifs - Authentic Teardrop Shapes */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23B8860B' stroke-width='1' stroke-linecap='round'%3E%3C!-- Large paisley with internal details --%3E%3Cpath d='M50 40c20 0 35 15 35 35 0 25-20 45-35 45-20 0-35-20-35-45 0-20 15-35 35-35z' fill='%23B8860B' fill-opacity='0.06' stroke-opacity='0.12'/%3E%3C!-- Internal paisley decoration --%3E%3Cpath d='M45 55c8 0 15 7 15 15 0 12-10 20-15 20s-15-8-15-20c0-8 7-15 15-15z' fill='none' stroke-opacity='0.08'/%3E%3Cpath d='M48 65c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z' fill='%23A0522D' fill-opacity='0.08'/%3E%3C!-- Smaller paisley --%3E%3Cpath d='M130 120c12 0 20 8 20 20 0 15-12 25-20 25s-20-10-20-25c0-12 8-20 20-20z' fill='%23B8860B' fill-opacity='0.05' stroke-opacity='0.10'/%3E%3Cpath d='M128 135c4 0 8 4 8 8s-4 8-8 8-8-4-8-8 4-8 8-8z' fill='%23A0522D' fill-opacity='0.06'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "180px 180px",
              backgroundPosition: "45px 45px"
            }}
          />
          
          {/* Lotus and Geometric Border Elements */}
          <div 
            className="absolute inset-0 opacity-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A0522D' stroke-width='0.8' stroke-linecap='round'%3E%3C!-- Lotus flower with petals --%3E%3Cg transform='translate(80,80)'%3E%3Cpath d='M0-15c3-3 8-2 8 2s-5 5-8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10'/%3E%3Cpath d='M0-15c-3-3-8-2-8 2s5 5 8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10' transform='rotate(45)'/%3E%3Cpath d='M0-15c3-3 8-2 8 2s-5 5-8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10' transform='rotate(90)'/%3E%3Cpath d='M0-15c3-3 8-2 8 2s-5 5-8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10' transform='rotate(135)'/%3E%3Cpath d='M0-15c3-3 8-2 8 2s-5 5-8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10' transform='rotate(180)'/%3E%3Cpath d='M0-15c3-3 8-2 8 2s-5 5-8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10' transform='rotate(225)'/%3E%3Cpath d='M0-15c3-3 8-2 8 2s-5 5-8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10' transform='rotate(270)'/%3E%3Cpath d='M0-15c3-3 8-2 8 2s-5 5-8 2z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.10' transform='rotate(315)'/%3E%3Ccircle cx='0' cy='0' r='4' fill='%23A0522D' fill-opacity='0.08'/%3E%3C/g%3E%3C!-- Geometric border elements --%3E%3Crect x='20' y='20' width='8' height='8' rx='1' fill='%23A0522D' fill-opacity='0.06' stroke='none'/%3E%3Crect x='132' y='132' width='8' height='8' rx='1' fill='%23A0522D' fill-opacity='0.06' stroke='none'/%3E%3Cpath d='M30 140c4 0 8-4 8-8s-4-8-8-8-8 4-8 8 4 8 8 8z' fill='none' stroke-opacity='0.08'/%3E%3Cpath d='M130 30c4 0 8-4 8-8s-4-8-8-8-8 4-8 8 4 8 8 8z' fill='none' stroke-opacity='0.08'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "160px 160px",
              backgroundPosition: "20px 20px"
            }}
          />
          
          {/* Subtle Parchment Texture */}
          <div 
            className="absolute inset-0 opacity-6"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(160, 82, 45, 0.03) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, rgba(184, 134, 11, 0.02) 1px, transparent 1px),
                linear-gradient(45deg, rgba(245, 245, 220, 0.04) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(245, 245, 220, 0.04) 25%, transparent 25%)
              `,
              backgroundSize: "20px 20px, 16px 16px, 8px 8px, 8px 8px",
              backgroundPosition: "0 0, 10px 10px, 0 0, 4px 4px"
            }}
          />
          
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
                      className="absolute top-0 right-0 w-20 h-20 opacity-2 pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23A0522D' fill-opacity='0.04'%3E%3Cpath d='M20 10c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z'/%3E%3Cpath d='M20 15c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5z'/%3E%3C/g%3E%3C/svg%3E")`,
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
          {/* Ivory/Parchment Base Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6E3] via-[#FAF0E6] to-[#F8F8FF]"></div>
          
          {/* Authentic Kalamkari Paisley Garden - Hand-drawn Style */}
          <div 
            className="absolute inset-0 opacity-14"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='280' height='280' viewBox='0 0 280 280' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A0522D' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Large ornate paisley with flowing curves --%3E%3Cpath d='M70 60c25 0 45 20 45 45 0 35-25 65-45 65-30 0-50-30-50-65 0-25 20-45 50-45z' fill='%23A0522D' fill-opacity='0.06' stroke-opacity='0.12'/%3E%3C!-- Internal paisley decorations --%3E%3Cpath d='M65 85c12 0 22 10 22 22 0 18-15 30-22 30s-22-12-22-30c0-12 10-22 22-22z' fill='none' stroke-opacity='0.08'/%3E%3Cpath d='M68 100c6 0 10 4 10 10s-4 10-10 10-10-4-10-10 4-10 10-10z' fill='%23B8860B' fill-opacity='0.08'/%3E%3C!-- Decorative dots and small motifs --%3E%3Ccircle cx='55' cy='75' r='2' fill='%23B8860B' fill-opacity='0.10'/%3E%3Ccircle cx='80' cy='95' r='1.5' fill='%23B8860B' fill-opacity='0.10'/%3E%3Ccircle cx='75' cy='130' r='2.5' fill='%23A0522D' fill-opacity='0.08'/%3E%3C!-- Medium paisley --%3E%3Cpath d='M180 140c18 0 32 14 32 32 0 25-18 45-32 45s-32-20-32-45c0-18 14-32 32-32z' fill='%23B8860B' fill-opacity='0.05' stroke-opacity='0.10'/%3E%3Cpath d='M178 160c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z' fill='%23A0522D' fill-opacity='0.06'/%3E%3C!-- Small paisley --%3E%3Cpath d='M220 80c12 0 20 8 20 20 0 15-12 25-20 25s-20-10-20-25c0-12 8-20 20-20z' fill='%23B8860B' fill-opacity='0.04' stroke-opacity='0.08'/%3E%3Ccircle cx='218' cy='95' r='4' fill='%23A0522D' fill-opacity='0.06'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "280px 280px",
              backgroundPosition: "0 0, 140px 140px"
            }}
          />
          
          {/* Traditional Floral Vines with Leaves */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23B8860B' stroke-width='0.8' stroke-linecap='round'%3E%3C!-- Flowing vine with natural curves --%3E%3Cpath d='M30 100c15-25 35-10 50-35s35 15 50-10 25 25 25 50-15 35-35 25-25-35-50-15-35-25-40-15z' fill='none' stroke-opacity='0.12'/%3E%3C!-- Organic leaves --%3E%3Cpath d='M55 80c6-3 9 2 6 6s-9 1-6-6z' fill='%23B8860B' fill-opacity='0.08'/%3E%3Cpath d='M85 65c5-4 10 1 6 6s-10 1-6-6z' fill='%23B8860B' fill-opacity='0.08'/%3E%3Cpath d='M115 75c6-2 8 4 3 6s-9-1-3-6z' fill='%23B8860B' fill-opacity='0.08'/%3E%3Cpath d='M145 95c5-3 9 3 5 6s-9 0-5-6z' fill='%23B8860B' fill-opacity='0.08'/%3E%3C!-- Small flowers --%3E%3Cg transform='translate(75,105)'%3E%3Cpath d='M0-4c1-1 3-1 3 1s-2 2-3 1z' fill='%23A0522D' fill-opacity='0.08'/%3E%3Cpath d='M0-4c-1-1-3-1-3 1s2 2 3 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(72)'/%3E%3Cpath d='M0-4c1-1 3-1 3 1s-2 2-3 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(144)'/%3E%3Cpath d='M0-4c1-1 3-1 3 1s-2 2-3 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(216)'/%3E%3Cpath d='M0-4c1-1 3-1 3 1s-2 2-3 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(288)'/%3E%3Ccircle cx='0' cy='0' r='1.5' fill='%23B8860B' fill-opacity='0.10'/%3E%3C/g%3E%3Cg transform='translate(125,55)'%3E%3Cpath d='M0-3c1-1 2-1 2 1s-1 1-2 1z' fill='%23A0522D' fill-opacity='0.08'/%3E%3Cpath d='M0-3c-1-1-2-1-2 1s1 1 2 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(60)'/%3E%3Cpath d='M0-3c1-1 2-1 2 1s-1 1-2 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(120)'/%3E%3Cpath d='M0-3c1-1 2-1 2 1s-1 1-2 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(180)'/%3E%3Cpath d='M0-3c1-1 2-1 2 1s-1 1-2 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(240)'/%3E%3Cpath d='M0-3c1-1 2-1 2 1s-1 1-2 1z' fill='%23A0522D' fill-opacity='0.08' transform='rotate(300)'/%3E%3Ccircle cx='0' cy='0' r='1' fill='%23B8860B' fill-opacity='0.10'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
              backgroundPosition: "50px 50px"
            }}
          />
          
          {/* Geometric Border Elements and Lotus Motifs */}
          <div 
            className="absolute inset-0 opacity-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A0522D' stroke-width='0.6' stroke-linecap='round'%3E%3C!-- Stylized lotus --%3E%3Cg transform='translate(70,70)'%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08'/%3E%3Cpath d='M0-12c-2-2-6-1-6 1s4 4 6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(30)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(60)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(90)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(120)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(150)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(180)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(210)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(240)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(270)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(300)'/%3E%3Cpath d='M0-12c2-2 6-1 6 1s-4 4-6 1z' fill='%23B8860B' fill-opacity='0.08' stroke-opacity='0.08' transform='rotate(330)'/%3E%3Ccircle cx='0' cy='0' r='3' fill='%23A0522D' fill-opacity='0.08'/%3E%3C/g%3E%3C!-- Traditional border elements --%3E%3Crect x='25' y='25' width='6' height='6' rx='1' fill='%23A0522D' fill-opacity='0.06' stroke='none'/%3E%3Crect x='109' y='109' width='6' height='6' rx='1' fill='%23A0522D' fill-opacity='0.06' stroke='none'/%3E%3Cpath d='M35 115c3 0 6-3 6-6s-3-6-6-6-6 3-6 6 3 6 6 6z' fill='none' stroke-opacity='0.06'/%3E%3Cpath d='M105 35c3 0 6-3 6-6s-3-6-6-6-6 3-6 6 3 6 6 6z' fill='none' stroke-opacity='0.06'/%3E%3C!-- Small decorative dots --%3E%3Ccircle cx='50' cy='20' r='1.5' fill='%23B8860B' fill-opacity='0.08'/%3E%3Ccircle cx='90' cy='120' r='1.5' fill='%23B8860B' fill-opacity='0.08'/%3E%3Ccircle cx='20' cy='90' r='1' fill='%23A0522D' fill-opacity='0.08'/%3E%3Ccircle cx='120' cy='50' r='1' fill='%23A0522D' fill-opacity='0.08'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "140px 140px",
              backgroundPosition: "35px 35px"
            }}
          />
          
          {/* Subtle Parchment Texture with Organic Feel */}
          <div 
            className="absolute inset-0 opacity-6"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 30%, rgba(160, 82, 45, 0.025) 1px, transparent 1px),
                radial-gradient(circle at 70% 70%, rgba(184, 134, 11, 0.02) 1px, transparent 1px),
                radial-gradient(circle at 50% 20%, rgba(245, 245, 220, 0.03) 0.5px, transparent 0.5px),
                radial-gradient(circle at 20% 80%, rgba(245, 245, 220, 0.025) 0.5px, transparent 0.5px)
              `,
              backgroundSize: "24px 24px, 18px 18px, 12px 12px, 16px 16px",
              backgroundPosition: "0 0, 12px 12px, 6px 6px, 8px 8px"
            }}
          />

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
                      className="absolute inset-0 opacity-2 pointer-events-none z-10"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B' fill-opacity='0.08'%3E%3Cpath d='M30 15c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z'/%3E%3Cpath d='M30 22c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z'/%3E%3C/g%3E%3C/svg%3E")`,
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
