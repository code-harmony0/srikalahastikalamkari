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
        /* Enhanced GSAP-style Animation System */
        .animate-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .animate-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Enhanced Semi-transparent Gradient Overlay */
        .luxury-fabric-overlay {
          background: 
            /* Semi-transparent gradient for perfect text visibility */
            linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.4) 0%,
              rgba(0, 0, 0, 0.2) 25%,
              rgba(0, 0, 0, 0.3) 50%,
              rgba(0, 0, 0, 0.1) 75%,
              rgba(0, 0, 0, 0.35) 100%
            ),
            /* Vignette effect for depth */
            radial-gradient(
              ellipse at center,
              transparent 0%,
              rgba(0, 0, 0, 0.2) 60%,
              rgba(0, 0, 0, 0.5) 100%
            );
          backdrop-filter: blur(1px) saturate(1.1);
          animation: luxuryFabricFlow 25s ease-in-out infinite;
        }

        @keyframes luxuryFabricFlow {
          0%, 100% { 
            opacity: 0.9; 
            filter: brightness(1) contrast(1.05) saturate(1.1); 
          }
          50% { 
            opacity: 0.95; 
            filter: brightness(1.05) contrast(1.08) saturate(1.15); 
          }
        }

        /* Premium Typography with Maximum Clarity - All White Text */
        .luxury-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: #ffffff !important;
          text-shadow: 
            0 3px 12px rgba(0, 0, 0, 0.9),
            0 6px 24px rgba(0, 0, 0, 0.7),
            0 12px 36px rgba(0, 0, 0, 0.5);
          letter-spacing: -0.02em;
          line-height: 0.85;
          animation: gsapHeadlineEntrance 3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes gsapHeadlineEntrance {
          0% {
            opacity: 0;
            transform: translateY(100px) scale(0.9);
            filter: blur(3px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(20px) scale(0.98);
            filter: blur(1px);
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
            0 2px 8px rgba(0, 0, 0, 0.8),
            0 4px 16px rgba(0, 0, 0, 0.6),
            0 8px 24px rgba(0, 0, 0, 0.4);
        }

        /* Enhanced Button Styles */
        .luxury-primary-button {
          background: linear-gradient(135deg, #A0522D 0%, #8B4513 50%, #654321 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
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
          transition: left 0.8s ease;
        }

        .luxury-primary-button:hover::before {
          left: 100%;
        }

        .luxury-primary-button:hover {
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .luxury-secondary-button {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .luxury-secondary-button:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        /* Enhanced Floating Particles */
        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 5;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184, 134, 11, 0.6) 0%, rgba(255, 215, 0, 0.3) 50%, transparent 100%);
          animation: floatParticle 20s ease-in-out infinite;
          filter: blur(1px);
        }

        .particle:nth-child(1) {
          width: 6px;
          height: 6px;
          top: 15%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 18s;
        }

        .particle:nth-child(2) {
          width: 10px;
          height: 10px;
          top: 70%;
          left: 85%;
          animation-delay: 3s;
          animation-duration: 22s;
        }

        .particle:nth-child(3) {
          width: 4px;
          height: 4px;
          top: 30%;
          left: 75%;
          animation-delay: 6s;
          animation-duration: 16s;
        }

        .particle:nth-child(4) {
          width: 8px;
          height: 8px;
          top: 85%;
          left: 20%;
          animation-delay: 9s;
          animation-duration: 20s;
        }

        .particle:nth-child(5) {
          width: 12px;
          height: 12px;
          top: 45%;
          left: 60%;
          animation-delay: 12s;
          animation-duration: 24s;
        }

        .particle:nth-child(6) {
          width: 5px;
          height: 5px;
          top: 60%;
          left: 40%;
          animation-delay: 15s;
          animation-duration: 19s;
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-40px) translateX(30px) scale(1.3);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) translateX(-20px) scale(0.9);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-60px) translateX(40px) scale(1.1);
            opacity: 0.9;
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
          transition: opacity 4s ease-in-out, transform 25s ease-in-out;
          transform: scale(1.1);
        }

        .hero-background-image.active {
          opacity: 1;
          transform: scale(1.1);
        }

        .hero-background-image.inactive {
          opacity: 0;
          transform: scale(1.15);
        }

        /* Enhanced Parallax Effects */
        .parallax-enhanced {
          transform-style: preserve-3d;
          will-change: transform;
        }

        /* Cinematic Divider */
        .cinematic-divider {
          position: relative;
          width: 120px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 134, 11, 0.4) 20%,
            rgba(255, 215, 0, 0.9) 50%,
            rgba(184, 134, 11, 0.4) 80%,
            transparent 100%
          );
          overflow: hidden;
          animation: dividerPulse 8s ease-in-out infinite;
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
            rgba(255, 215, 0, 1) 30%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 215, 0, 1) 70%,
            transparent 100%
          );
          animation: dividerShine 6s ease-in-out infinite;
        }

        @keyframes dividerPulse {
          0%, 100% { 
            opacity: 0.8; 
            transform: scaleX(1); 
          }
          50% { 
            opacity: 1; 
            transform: scaleX(1.2); 
          }
        }

        @keyframes dividerShine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: -100%; }
        }

        /* SEO-optimized animations */
        .seo-fade-in {
          animation: seoFadeIn 2.5s ease-out;
        }

        @keyframes seoFadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Modern minimal UI enhancements */
        .modern-glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        /* Responsive text scaling */
        @media (max-width: 640px) {
          .luxury-headline {
            text-shadow: 
              0 1px 4px rgba(0, 0, 0, 0.8),
              0 2px 8px rgba(0, 0, 0, 0.6);
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

        /* Smooth Fade-in Animations */
        .fade-in-up {
          animation: fadeInUp 2s ease-out;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
            filter: blur(4px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(15px) scale(0.98);
            filter: blur(1px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .fade-in-delayed {
          animation: fadeInDelayed 2.5s ease-out 0.5s both;
        }

        @keyframes fadeInDelayed {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Parallax Enhancement */
        .parallax-layer {
          transform-style: preserve-3d;
          will-change: transform;
        }

        /* Background Image Transitions */
        .hero-background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 3s ease-in-out, transform 20s ease-in-out;
          transform: scale(1.05);
        }

        .hero-background-image.active {
          opacity: 1;
          transform: scale(1.05);
        }

        .hero-background-image.inactive {
          opacity: 0;
          transform: scale(1.1);
        }

        /* Text Legibility Enhancements */
        .text-shadow-luxury {
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.8),
            0 4px 8px rgba(0, 0, 0, 0.6),
            0 8px 16px rgba(0, 0, 0, 0.4);
        }

        .text-shadow-soft {
          text-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.6),
            0 2px 6px rgba(0, 0, 0, 0.4);
        }

        /* Modern Dark-to-Light Gradient with Vignette */
        .modern-gradient-overlay {
          background: 
            /* Vignette effect */
            radial-gradient(
              ellipse at center,
              transparent 0%,
              rgba(0, 0, 0, 0.1) 40%,
              rgba(0, 0, 0, 0.3) 70%,
              rgba(0, 0, 0, 0.6) 100%
            ),
            /* Main gradient */
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.7) 0%,
              rgba(0, 0, 0, 0.5) 20%,
              rgba(0, 0, 0, 0.3) 40%,
              rgba(0, 0, 0, 0.15) 60%,
              rgba(0, 0, 0, 0.05) 80%,
              transparent 100%
            );
          animation: gradientBreathing 25s ease-in-out infinite;
        }

        @keyframes gradientBreathing {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        /* Moving Bokeh Shimmer Effects */
        .bokeh-shimmer {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 4;
        }

        .bokeh-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184, 134, 11, 0.4) 0%, rgba(255, 215, 0, 0.2) 50%, transparent 100%);
          animation: bokehFloat 15s ease-in-out infinite;
          filter: blur(1px);
        }

        .bokeh-particle:nth-child(1) {
          width: 8px;
          height: 8px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 18s;
        }

        .bokeh-particle:nth-child(2) {
          width: 12px;
          height: 12px;
          top: 60%;
          left: 80%;
          animation-delay: 3s;
          animation-duration: 22s;
        }

        .bokeh-particle:nth-child(3) {
          width: 6px;
          height: 6px;
          top: 40%;
          left: 30%;
          animation-delay: 6s;
          animation-duration: 16s;
        }

        .bokeh-particle:nth-child(4) {
          width: 10px;
          height: 10px;
          top: 80%;
          left: 60%;
          animation-delay: 9s;
          animation-duration: 20s;
        }

        .bokeh-particle:nth-child(5) {
          width: 14px;
          height: 14px;
          top: 15%;
          left: 70%;
          animation-delay: 12s;
          animation-duration: 24s;
        }

        @keyframes bokehFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30px) translateX(20px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-15px) translateX(-15px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-40px) translateX(25px) scale(1.1);
            opacity: 0.7;
          }
        }

        /* Slow Left-to-Right Gradient Light Movement */
        .gradient-light-movement {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 134, 11, 0.15) 20%,
            rgba(255, 215, 0, 0.08) 40%,
            rgba(184, 134, 11, 0.12) 60%,
            transparent 100%
          );
          background-size: 300% 100%;
          animation: gradientLightMove 20s ease-in-out infinite;
        }

        @keyframes gradientLightMove {
          0% { background-position: -300% 0; }
          50% { background-position: 100% 0; }
          100% { background-position: -300% 0; }
        }

        .refined-soft-gradient {
          background: radial-gradient(
            ellipse at center,
            rgba(245, 245, 220, 0.1) 0%,
            rgba(222, 184, 135, 0.15) 30%,
            rgba(160, 82, 45, 0.20) 70%,
            rgba(101, 67, 33, 0.25) 100%
          );
          animation: refinedSoftPulse 12s ease-in-out infinite;
        }

        @keyframes refinedSoftPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }

        .cinematic-lighting-2025 {
          background: 
            radial-gradient(circle at 30% 20%, rgba(184, 134, 11, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(160, 82, 45, 0.12) 0%, transparent 50%),
            linear-gradient(45deg, transparent 40%, rgba(245, 245, 220, 0.08) 50%, transparent 60%);
          animation: cinematicLighting 15s ease-in-out infinite;
        }

        @keyframes cinematicLighting {
          0%, 100% { opacity: 0.6; }
          25% { opacity: 0.8; }
          50% { opacity: 0.7; }
          75% { opacity: 0.9; }
        }

        /* Elegant Serif Headlines with Cinematic Typography */
        .elegant-serif-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          text-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.6),
            0 8px 24px rgba(0, 0, 0, 0.4),
            0 2px 4px rgba(255, 255, 255, 0.1);
          animation: cinematicEntrance 3.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes cinematicEntrance {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.9);
            letter-spacing: 0.15em;
            filter: blur(2px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(10px) scale(0.98);
            letter-spacing: 0.05em;
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            letter-spacing: 0.02em;
            filter: blur(0);
          }
        }

        /* Gold Italic Tagline */
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
          animation: goldTaglineFlow 8s ease-in-out infinite;
          text-shadow: 0 2px 8px rgba(184, 134, 11, 0.3);
        }

        @keyframes goldTaglineFlow {
          0%, 100% { 
            background-position: 0% 50%; 
            filter: brightness(1) saturate(1.1);
          }
          50% { 
            background-position: 100% 50%; 
            filter: brightness(1.2) saturate(1.3);
          }
        }

        /* Animated Divider with Cinematic Flow */
        .cinematic-divider {
          position: relative;
          width: 120px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 134, 11, 0.3) 20%,
            rgba(255, 215, 0, 0.8) 50%,
            rgba(184, 134, 11, 0.3) 80%,
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
            rgba(255, 215, 0, 0.9) 30%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 215, 0, 0.9) 70%,
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

        /* Cinematic Entrance Animations */
        .cinematic-entrance {
          animation: cinematicSlideIn 2.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes cinematicSlideIn {
          0% {
            opacity: 0;
            transform: translateY(80px) scale(0.95);
            filter: blur(3px);
          }
          40% {
            opacity: 0.6;
            transform: translateY(20px) scale(0.98);
            filter: blur(1px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .refined-fade-in {
          animation: refinedFadeIn 2.5s ease-out;
        }

        @keyframes refinedFadeIn {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .refined-slide-up {
          animation: refinedSlideUp 2.8s ease-out 0.3s both;
        }

        @keyframes refinedSlideUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

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
          animation: refinedGoldFlow 8s ease-in-out infinite;
        }

        @keyframes refinedGoldFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

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
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: refinedShimmer 6s ease-in-out infinite;
        }

        @keyframes refinedShimmer {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        .refined-body-text {
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          animation: refinedBodyFloat 10s ease-in-out infinite;
        }

        @keyframes refinedBodyFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.85; }
          50% { transform: translateY(-2px); opacity: 1; }
        }

        /* Premium Button Interactions with Luxury Feel */
        .luxury-button {
          position: relative;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
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
            rgba(255, 215, 0, 0.4) 0%,
            rgba(184, 134, 11, 0.2) 50%,
            transparent 100%
          );
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }

        .luxury-button:hover::before {
          width: 400px;
          height: 400px;
        }

        .luxury-button:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 
            0 15px 50px rgba(184, 134, 11, 0.4),
            0 8px 25px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-color: rgba(184, 134, 11, 0.6);
        }

        .luxury-button:active {
          transform: translateY(-2px) scale(1.01);
          transition: all 0.2s ease;
        }

        /* Parallax Enhancement */
        .parallax-enhanced {
          transform-style: preserve-3d;
          will-change: transform;
        }

        /* Refined UI Components */
        .refined-glass-badge {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Handcrafted Luxury Lighting Effects */
        .luxury-lighting {
          background: 
            radial-gradient(circle at 30% 20%, rgba(184, 134, 11, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(160, 82, 45, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.04) 0%, transparent 60%),
            linear-gradient(45deg, transparent 40%, rgba(245, 245, 220, 0.06) 50%, transparent 60%);
          animation: luxuryLightingFlow 25s ease-in-out infinite;
        }

        @keyframes luxuryLightingFlow {
          0%, 100% { opacity: 0.8; filter: brightness(1) contrast(1.05); }
          25% { opacity: 0.9; filter: brightness(1.1) contrast(1.1); }
          50% { opacity: 0.85; filter: brightness(1.05) contrast(1.08); }
          75% { opacity: 0.95; filter: brightness(1.15) contrast(1.12); }
        }

        /* Background Image Carousel Styles */
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
          transform: scale(1.1);
          z-index: 1;
        }

        .hero-carousel-image.active {
          opacity: 1;
        }

        .hero-carousel-image.inactive {
          opacity: 0;
        }
        .kalamkari-pen-background {
          background: 
            radial-gradient(circle at 20% 30%, rgba(184, 134, 11, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(160, 82, 45, 0.06) 0%, transparent 40%),
            linear-gradient(135deg, rgba(245, 245, 220, 0.95) 0%, rgba(222, 184, 135, 0.98) 100%);
          animation: kalamkariFlow 20s ease-in-out infinite;
        }

        @keyframes kalamkariFlow {
          0%, 100% { opacity: 1; filter: hue-rotate(0deg); }
          50% { opacity: 0.95; filter: hue-rotate(2deg); }
        }

        /* Smooth Pen Stroke Animation */
        .pen-stroke-animation {
          background: linear-gradient(90deg, transparent 0%, rgba(184, 134, 11, 0.3) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: penStroke 8s ease-in-out infinite;
        }

        @keyframes penStroke {
          0%, 100% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
        }

        /* Minimal Button Styles */
        .minimal-primary-cta {
          background: linear-gradient(135deg, #A0522D 0%, #8B4513 100%);
          box-shadow: 
            0 4px 20px rgba(160, 82, 45, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
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
          transition: left 0.6s ease;
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

        .minimal-secondary-cta {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(51, 51, 51, 0.2);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .minimal-secondary-cta:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(51, 51, 51, 0.4);
          box-shadow: 
            0 6px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .luxury-cta-text {
          font-weight: 600;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
        }

        .refined-trust-item {
          animation: refinedTrustFloat 8s ease-in-out infinite;
        }

        .refined-trust-item:nth-child(1) { animation-delay: 0s; }
        .refined-trust-item:nth-child(2) { animation-delay: 1.5s; }
        .refined-trust-item:nth-child(3) { animation-delay: 3s; }

        @keyframes refinedTrustFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.8; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        .refined-scroll-indicator {
          animation: refinedScrollPulse 5s ease-in-out infinite;
        }

        @keyframes refinedScrollPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        .refined-scroll-mouse {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .refined-scroll-mouse:hover {
          border-color: rgba(51, 51, 51, 0.8);
          transform: scale(1.15);
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

        {/* The Soul of the Artisan Section - Refined Heritage Story */}
        <section className="w-full min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background relative overflow-hidden">
          {/* Parallax Background Elements */}
          <motion.div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A0522D' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="max-w-[120rem] mx-auto h-full grid lg:grid-cols-2 relative">
            {/* Full-Height Artisan Image Section */}
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative h-screen lg:h-auto min-h-[80vh] order-2 lg:order-1"
            >
              {/* Parallax Image Container */}
              <motion.div 
                className="absolute inset-0 overflow-hidden"
                style={{
                  y: useTransform(useScroll().scrollY, [0, 1000], [0, -100])
                }}
              >
                <Image
                  src="https://static.wixstatic.com/media/07221c_63f62de1d1f548ff870b8e13f01daf64~mv2.png?originWidth=576&originHeight=576"
                  alt="Master artisan's hands meticulously painting traditional Kalamkari designs with natural dyes and bamboo pen"
                  className="w-full h-full object-cover object-center"
                  width={800}
                  height={1200}
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-background/80 lg:to-background/95"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
              </motion.div>

              {/* Floating Heritage Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-accent-color/20"
              >
                <CountUpNumber 
                  end={500} 
                  duration={2000}
                  className="text-4xl font-heading font-bold text-primary mb-2 tracking-tight"
                  suffix="+"
                />
                <div className="text-sm font-paragraph text-foreground/80 font-medium">Years of Heritage</div>
              </motion.div>
            </motion.div>

            {/* Modern Text Block Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-24 order-1 lg:order-2 bg-background/95 lg:bg-transparent"
            >
              {/* Section Tag */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-12 h-px bg-gradient-to-r from-accent-color to-accent-color/30"></div>
                <span className="font-paragraph text-xs font-bold text-accent-color uppercase tracking-[0.3em]">
                  Our Heritage
                </span>
              </motion.div>
              
              {/* Enhanced Typography Heading */}
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground mb-12 leading-[0.9] tracking-tight"
              >
                The Soul of the
                <span className="text-primary block mt-2">Artisan</span>
              </motion.h2>
              
              {/* Enhanced Content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-8 mb-12"
              >
                <p className="font-paragraph text-xl text-foreground/85 leading-relaxed font-light">
                  Kalamkari is more than an art form; it is a living narrative whispered through generations. The term itself, derived from 'kalam' (pen) and 'kari' (craftsmanship), describes the meticulous process of hand-painting textiles with natural dyes.
                </p>
                <p className="font-paragraph text-lg text-foreground/75 leading-relaxed">
                  Our collection is a tribute to this ancient craft. We partner with master artisans who use traditional motifs inspired by folklore, mythology, and nature, ensuring each saree is a singular masterpiece of cultural pride and artistic excellence.
                </p>
              </motion.div>

              {/* Minimalist Stats with Icons */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8 mb-12"
              >
                <div className="flex items-center gap-4 p-6 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CountUpNumber 
                      end={200} 
                      duration={2000}
                      className="text-2xl font-heading font-bold text-primary tracking-tight"
                      suffix="+"
                    />
                    <div className="text-sm font-paragraph text-foreground/70 font-medium">Master Artisans</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-12 h-12 bg-accent-color/10 rounded-full flex items-center justify-center">
                    <Palette className="w-6 h-6 text-accent-color" />
                  </div>
                  <div>
                    <CountUpNumber 
                      end={100} 
                      duration={2000}
                      className="text-2xl font-heading font-bold text-primary tracking-tight"
                      suffix="%"
                    />
                    <div className="text-sm font-paragraph text-foreground/70 font-medium">Natural Dyes</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Quote Block with Gold Accent */}
              <motion.blockquote 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="relative pl-8 mb-12"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-accent-color to-accent-color/30 rounded-full"></div>
                <div className="absolute -left-2 top-0 w-5 h-5 bg-accent-color rounded-full"></div>
                <p className="font-paragraph text-xl text-foreground/80 italic leading-relaxed font-light">
                  "Every thread tells a story. Every color carries history. Every pattern celebrates tradition."
                </p>
                <cite className="block mt-4 text-sm font-paragraph text-accent-color font-semibold not-italic">
                  — Master Artisan Philosophy
                </cite>
              </motion.blockquote>
              
              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/shop">
                  <Button 
                    size="lg"
                    className="h-14 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Discover the Craft 
                    <ArrowRight className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1"/>
                  </Button>
                </Link>
                <Link to="/about">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-base rounded-2xl border-2 border-primary/30 hover:bg-primary/5 hover:border-primary transition-all duration-300 backdrop-blur-sm"
                  >
                    Our Story
                  </Button>
                </Link>
              </motion.div>
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
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-sm" />
                  <span className="font-paragraph text-sm lg:text-base font-semibold">4.9/5 Customer Rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <Scissors className="w-6 h-6 text-primary" />
                  <span className="font-paragraph text-sm lg:text-base font-semibold">Handcrafted Excellence</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="font-paragraph text-sm lg:text-base font-semibold">10,000+ Happy Customers</span>
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
                <div className="flex flex-wrap justify-center items-center gap-6 text-primary-foreground/90 text-sm font-paragraph mb-6 font-medium">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                    <span className="font-semibold">5,000+ Subscribers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
                    <span className="font-semibold">Exclusive Content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent-color" />
                    <span className="font-semibold">Member Benefits</span>
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
