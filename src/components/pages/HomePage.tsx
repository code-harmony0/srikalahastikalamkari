// HPI 1.5-V
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, Promotions } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { BanarasiPattern } from '@/components/ui/decorative-pattern';

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

// Decorative pattern component - Enhanced Indian-inspired floral and leaf motifs for HomePage
const DecorativePattern = ({ className = '', animated = false }: { className?: string; animated?: boolean }) => (
  <BanarasiPattern className={className} opacity="opacity-5" animated={animated} />
);

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Products[]>([]);
  const [promotions, setPromotions] = useState<Promotions[]>([]);
  const [loading, setLoading] = useState(true);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

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
      title: 'Authentic Craftsmanship',
      description: 'Each saree is hand-painted by skilled artisans using traditional Kalamkari techniques passed through generations.',
    },
    {
      title: 'Premium Quality Fabrics',
      description: 'We use only the finest natural fabrics like pure silk and organic cotton, ensuring longevity and unparalleled comfort.',
    },
    {
      title: 'Cultural Preservation',
      description: 'Your purchase supports artisans directly, helping to preserve the rich heritage of Indian textile traditions for the future.',
    }
  ];

  const galleryImages = [
    { src: "https://static.wixstatic.com/media/07221c_a472c3ef713149fc9e659225e7b494f5~mv2.png?originWidth=448&originHeight=640", alt: "A woman in a vibrant, patterned Kalamkari saree." },
    { src: "https://static.wixstatic.com/media/07221c_24d1a5224a3a4efdba5941d80526de9d~mv2.png?originWidth=448&originHeight=640", alt: "Close-up detail of a Kalamkari fabric." },
    { src: "https://static.wixstatic.com/media/07221c_b9f5ac481d3e4258b0892671da656df3~mv2.png?originWidth=448&originHeight=640", alt: "A model showcasing a modern-styled Kalamkari saree." },
    { src: "https://static.wixstatic.com/media/07221c_e41b824ff190413783da0106b24687bc~mv2.png?originWidth=448&originHeight=640", alt: "An artisan carefully painting a design onto fabric." },
    { src: "https://static.wixstatic.com/media/07221c_34372093ed9d4c35aa96a263080fe962~mv2.png?originWidth=448&originHeight=640", alt: "A folded stack of colorful Kalamkari sarees." },
    { src: "https://static.wixstatic.com/media/07221c_291baffbbf9f4e7cab79e22424cd67c1~mv2.png?originWidth=448&originHeight=640", alt: "A woman smiling, draped in an elegant Kalamkari saree." },
  ];

  return (
    <>
      <style>{`
        .animate-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.215, 0.610, 0.355, 1), transform 0.8s cubic-bezier(0.215, 0.610, 0.355, 1);
        }
        .animate-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fabric-texture::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(hsl(var(--foreground) / 0.1) 0.5px, transparent 0.5px);
          background-size: 8px 8px;
          z-index: -1;
        }
        .horizontal-scroll-container {
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .horizontal-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .gallery-item {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .scroll-indicator {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kalamkari-glow {
          position: relative;
          overflow: hidden;
        }
        .kalamkari-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(184, 134, 11, 0.15) 0%, transparent 70%);
          animation: glow 8s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
        }
        @keyframes pattern-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-0.5deg); }
        }
        .animate-pattern-float {
          animation: pattern-float 12s ease-in-out infinite;
        }
        .pattern-shimmer {
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% -200%; }
          50% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
      `}</style>
      <main className="w-full bg-background text-foreground overflow-clip">
        {/* Hero Section */}
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://static.wixstatic.com/media/07221c_071767876ac742d2aadac0238ead57d0~mv2.png?originWidth=1920&originHeight=1024"
              alt="A rich tapestry of handcrafted Kalamkari fabrics showing intricate patterns and warm, earthy tones."
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
            <DecorativePattern className="text-accent-color pattern-shimmer" animated={true} />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl"
          >
            {/* Decorative top element */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mb-6 flex items-center gap-2 text-primary-foreground"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-paragraph text-sm tracking-widest uppercase">Heritage Crafted</span>
              <Sparkles className="w-5 h-5" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-heading text-5xl md:text-7xl lg:text-8xl text-primary-foreground max-w-5xl leading-tight"
            >
              Handcrafted Stories. Worn with Pride.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 font-paragraph text-lg md:text-xl text-primary-foreground/95 max-w-2xl leading-relaxed"
            >
              Discover the timeless beauty of Kalamkari sarees, where tradition meets contemporary elegance. Each piece is a masterpiece of cultural heritage.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 flex flex-col sm:flex-row gap-4"
            >
              <Link to="/shop">
                <Button size="lg" className="h-14 px-10 text-base rounded-sm font-paragraph bg-primary-foreground hover:bg-primary-foreground/90 font-semibold shadow-lg text-primary">
                  Explore Collection
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-sm font-paragraph border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  Our Story
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="flex flex-col items-center gap-2 text-primary-foreground/60">
              <span className="text-xs font-paragraph uppercase tracking-widest">Scroll to explore</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </section>

        {/* Featured Products Section */}
        <section className="w-full py-24 md:py-32 bg-background relative overflow-hidden">
          <DecorativePattern className="text-primary/5 pattern-shimmer" animated={true} />
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
            <AnimatedElement>
              <div className="mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="w-1 h-8 bg-accent-color rounded-full"></div>
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-widest">New Arrivals</span>
                </motion.div>
                <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
                  Curated Masterpieces
                </h2>
                <p className="font-paragraph text-lg text-foreground/70 max-w-2xl">
                  A carefully selected collection of our latest handcrafted sarees, each with a unique story woven into its threads.
                </p>
              </div>
            </AnimatedElement>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-clip animate-pulse">
                    <div className="w-full aspect-[3/4] bg-secondary/50" />
                    <div className="pt-4 space-y-3 p-4">
                      <div className="h-5 bg-secondary/50 rounded w-3/4" />
                      <div className="h-5 bg-secondary/50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {featuredProducts.map((product, index) => (
                  <AnimatedElement key={product._id} delay={index * 100}>
                    <Link to={`/product/${product._id}`} className="group block h-full">
                      <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden bg-secondary/20 mb-6 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300"
                      >
                        <Image
                          src={product.mainImage || "https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512"}
                          alt={product.title || 'Kalamkari Saree'}
                          className="w-full aspect-[3/4] object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                          width={400}
                          height={533}
                        />
                        {product.isFeatured && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                            className="absolute top-4 right-4 bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-bold"
                          >
                            Featured
                          </motion.div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute bottom-0 left-0 right-0 p-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <Button size="sm" className="h-10 rounded-full bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold shadow-lg">
                            <ShoppingBag className="h-4 w-4 mr-2" /> View
                          </Button>
                        </motion.div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="font-heading text-xl text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-foreground/60 font-paragraph text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <p className="font-heading font-bold text-primary text-lg">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </p>
                      </motion.div>
                    </Link>
                  </AnimatedElement>
                ))}
              </div>
            )}
            <AnimatedElement className="text-center mt-20">
              <Link to="/shop">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-sm border-2 border-primary/50 hover:bg-primary/5 hover:border-primary group">
                  View All Products <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1"/>
                </Button>
              </Link>
            </AnimatedElement>
          </div>
        </section>

        {/* The Art of Kalamkari Section */}
        <section className="w-full py-24 md:py-32 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
          <DecorativePattern className="text-primary/5 pattern-shimmer" animated={true} />
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 md:gap-24 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="https://static.wixstatic.com/media/07221c_2d9705923c15466887b842567c2d0261~mv2.png?originWidth=768&originHeight=768"
                  alt="An artisan's hand meticulously painting a traditional Kalamkari design onto fabric with a bamboo pen."
                  className="w-full h-full object-cover"
                  width={800}
                  height={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-color/10 rounded-full blur-3xl"
              ></motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-accent-color rounded-full"></div>
                <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-widest">Our Heritage</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-8">
                The Soul of the Artisan
              </h2>
              <div className="font-paragraph text-lg text-foreground/80 space-y-6 leading-relaxed">
                <p>
                  Kalamkari is more than an art form; it is a living narrative whispered through generations. The term itself, derived from 'kalam' (pen) and 'kari' (craftsmanship), describes the meticulous process of hand-painting or block-printing textiles.
                </p>
                <p>
                  Our collection is a tribute to this ancient craft. We partner with master artisans who use natural dyes and traditional motifs inspired by folklore and nature, ensuring each saree is a singular masterpiece of cultural pride and artistic excellence.
                </p>
                <p className="text-foreground/70 italic">
                  Every thread tells a story. Every color carries history. Every pattern celebrates tradition.
                </p>
              </div>
              <Link to="/shop" className="mt-10 inline-block">
                <Button className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary px-8 py-3 rounded-sm font-paragraph font-semibold group">
                  Discover the Craft <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1"/>
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Promotions Section */}
        {promotions.length > 0 && (
          <section className="w-full py-24 md:py-32 bg-background relative">
            <div className="max-w-[120rem] mx-auto px-6 md:px-12">
              <AnimatedElement>
                <div className="mb-16">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="w-1 h-8 bg-accent-color rounded-full"></div>
                    <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-widest">Limited Time</span>
                  </motion.div>
                  <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">Seasonal Offerings</h2>
                </div>
              </AnimatedElement>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {promotions[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="lg:col-span-3"
                  >
                    <a href={promotions[0].callToActionUrl} className="group relative block overflow-hidden h-[500px] rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                      <Image
                        src={promotions[0].bannerImage || "https://static.wixstatic.com/media/07221c_a7a400975312440d932b7a737b5ebebf~mv2.png?originWidth=896&originHeight=448"}
                        alt={promotions[0].title || 'Seasonal Promotion'}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        width={900}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 p-8 md:p-12 text-primary-foreground w-full"
                      >
                        <h3 className="font-heading text-4xl mb-3 font-bold text-white drop-shadow-lg">{promotions[0].title}</h3>
                        <p className="font-paragraph text-lg max-w-md mb-6 text-white/95 drop-shadow-md">{promotions[0].description}</p>
                        <Button size="lg" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold rounded-sm shadow-lg">Shop Now</Button>
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
                    <a href={promotions[1].callToActionUrl} className="group relative block overflow-hidden h-[500px] bg-secondary/30 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                      <Image
                        src={promotions[1].bannerImage || "https://static.wixstatic.com/media/07221c_13a941c0dfd84492b785af619b1d7ae3~mv2.png?originWidth=896&originHeight=448"}
                        alt={promotions[1].title || 'Special Offer'}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        width={600}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 p-8 text-primary-foreground w-full"
                      >
                        <h3 className="font-heading text-3xl mb-2 font-bold text-white drop-shadow-lg">{promotions[1].title}</h3>
                        <p className="font-paragraph mb-4 text-white/95 drop-shadow-md">{promotions[1].description}</p>
                        <Button variant="secondary" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold rounded-sm shadow-lg">Explore</Button>
                      </motion.div>
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us Section */}
        <section className="w-full py-24 md:py-32 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
          <DecorativePattern className="text-primary/5 pattern-shimmer" animated={true} />
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
            <AnimatedElement className="text-center max-w-3xl mx-auto mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-accent-color rounded-full"></div>
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-widest">Why Choose Us</span>
                  <div className="w-1 h-8 bg-accent-color rounded-full"></div>
                </div>
                <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">The Kalamkari Promise</h2>
                <p className="font-paragraph text-lg text-foreground/80 leading-relaxed">
                  We are committed to delivering not just a product, but an experience steeped in authenticity, quality, and respect for tradition.
                </p>
              </motion.div>
            </AnimatedElement>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {whyChooseUsItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent-color/20 to-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur"></div>
                  <div className="relative bg-white rounded-lg p-8 shadow-sm hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-2">
                    <div className="flex items-center justify-center w-16 h-16 bg-accent-color/10 rounded-lg mb-6 mx-auto">
                      <span className="text-3xl font-heading font-bold text-accent-color">0{index + 1}</span>
                    </div>
                    <h3 className="font-heading text-2xl text-foreground mb-4 text-center">{item.title}</h3>
                    <p className="font-paragraph text-foreground/70 leading-relaxed text-center">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Breather / Gallery */}
        <section className="w-full py-24 md:py-32 bg-background relative">
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 mb-16">
            <AnimatedElement>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-accent-color rounded-full"></div>
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-widest">Gallery</span>
                </div>
                <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">Woven in Elegance</h2>
                <p className="font-paragraph text-lg text-foreground/70 max-w-2xl">
                  Explore the vibrant world of Kalamkari through our visual journal of artistry and tradition.
                </p>
              </motion.div>
            </AnimatedElement>
          </div>
          
          {/* Gallery Container */}
          <div className="relative">
            <div ref={galleryScrollRef} className="horizontal-scroll-container overflow-x-auto pb-8 px-6 md:px-12">
              <div className="flex gap-8 w-max">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "0px 100px" }}
                    whileHover={{ y: -12 }}
                    className="gallery-item w-[40vh] md:w-[50vh] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={500}
                      height={667}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Scroll Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute bottom-0 right-12 md:right-24 flex items-center gap-2 text-foreground/50 text-xs font-paragraph uppercase tracking-widest"
            >
              <span>Auto-scrolling</span>
              <motion.svg
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H6" />
              </motion.svg>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="w-full py-24 md:py-32 bg-gradient-to-r from-primary via-amber-700 to-primary text-primary-foreground relative overflow-hidden">
          <DecorativePattern className="text-primary-foreground/10 pattern-shimmer" animated={true} />
          <div className="max-w-2xl mx-auto text-center px-6 relative z-10">
            <AnimatedElement>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-accent-color" />
                  <span className="font-paragraph text-sm font-semibold text-accent-color uppercase tracking-widest">Stay Connected</span>
                  <Sparkles className="w-5 h-5 text-accent-color" />
                </div>
                <h2 className="font-heading text-4xl md:text-5xl text-primary-foreground mb-4">Join the Collective</h2>
                <p className="font-paragraph text-lg text-primary-foreground/95 mb-10">
                  Become a part of our story. Receive exclusive access to new collections, artisan stories, and special offers.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-grow h-12 px-4 bg-white border border-white rounded-sm placeholder:text-foreground/40 font-paragraph focus:ring-2 focus:ring-primary-foreground focus:outline-none text-foreground"
                  />
                  <Button type="submit" size="lg" className="h-12 px-8 rounded-sm font-paragraph bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-semibold">
                    Subscribe
                  </Button>
                </form>
                <p className="text-xs text-primary-foreground/70 font-paragraph mt-4">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </motion.div>
            </AnimatedElement>
          </div>
        </section>

      </main>
    </>
  );
}
