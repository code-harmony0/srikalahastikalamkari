// HPI 1.5-V
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { Products, Promotions } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag } from 'lucide-react';

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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Products[]>([]);
  const [promotions, setPromotions] = useState<Promotions[]>([]);
  const [loading, setLoading] = useState(true);

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
    { src: "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=gallery-saree-1", alt: "A woman in a vibrant, patterned Kalamkari saree." },
    { src: "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=gallery-saree-2", alt: "Close-up detail of a Kalamkari fabric." },
    { src: "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=gallery-saree-3", alt: "A model showcasing a modern-styled Kalamkari saree." },
    { src: "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=gallery-saree-4", alt: "An artisan carefully painting a design onto fabric." },
    { src: "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=gallery-saree-5", alt: "A folded stack of colorful Kalamkari sarees." },
    { src: "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=gallery-saree-6", alt: "A woman smiling, draped in an elegant Kalamkari saree." },
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
        .horizontal-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .horizontal-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <main className="w-full bg-background text-foreground overflow-clip">
        {/* Hero Section */}
        <section className="relative w-full min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=hero-background-saree-fabric"
              alt="A rich tapestry of handcrafted Kalamkari fabrics showing intricate patterns and warm, earthy tones."
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <h1 className="font-heading text-5xl md:text-7xl text-primary-foreground max-w-4xl">
              Handcrafted Stories. Worn with Pride.
            </h1>
            <p className="mt-6 font-paragraph text-lg md:text-xl text-primary-foreground/90 max-w-2xl">
              Discover the timeless beauty of Kalamkari sarees, where tradition meets contemporary elegance.
            </p>
            <div className="mt-10">
              <Link to="/shop">
                <Button size="lg" className="h-12 px-8 text-base rounded-sm font-paragraph">
                  Explore The Collection
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="w-full py-24 md:py-32">
          <div className="max-w-[120rem] mx-auto px-6 md:px-12">
            <AnimatedElement>
              <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">New Arrivals</h2>
              <p className="font-paragraph text-lg text-foreground/70 max-w-2xl mb-12">A curated selection of our latest handcrafted sarees, each with a unique story to tell.</p>
            </AnimatedElement>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-background rounded-lg overflow-clip animate-pulse">
                    <div className="w-full aspect-[3/4] bg-secondary/50" />
                    <div className="pt-4 space-y-3">
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
                    <Link to={`/product/${product._id}`} className="group block">
                      <div className="relative overflow-clip bg-secondary/30 mb-4">
                        <Image
                          src={product.mainImage || "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=product-placeholder"}
                          alt={product.title || 'Kalamkari Saree'}
                          className="w-full aspect-[3/4] object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                          width={400}
                          height={533}
                        />
                         <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" variant="secondary" className="h-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background">
                                <ShoppingBag className="h-4 w-4 mr-2" /> View
                            </Button>
                        </div>
                      </div>
                      <h3 className="font-heading text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                        {product.title}
                      </h3>
                      <p className="font-paragraph font-semibold text-primary text-lg">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </p>
                    </Link>
                  </AnimatedElement>
                ))}
              </div>
            )}
             <AnimatedElement className="text-center mt-20">
                <Link to="/shop">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-sm border-primary/50 hover:bg-primary/5 hover:border-primary group">
                        View All Products <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1"/>
                    </Button>
                </Link>
            </AnimatedElement>
          </div>
        </section>

        {/* The Art of Kalamkari Section */}
        <section className="w-full py-24 md:py-32 bg-secondary/30 relative fabric-texture">
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <AnimatedElement>
              <div className="relative aspect-square max-w-lg mx-auto">
                <Image
                  src="https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=artisan-hand-painting"
                  alt="An artisan's hand meticulously painting a traditional Kalamkari design onto fabric with a bamboo pen."
                  className="w-full h-full object-cover"
                  width={800}
                  height={800}
                />
              </div>
            </AnimatedElement>
            <AnimatedElement delay={200}>
              <p className="font-heading text-primary text-lg mb-2">Our Heritage</p>
              <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">
                The Soul of the Artisan
              </h2>
              <div className="font-paragraph text-lg text-foreground/80 space-y-4 leading-relaxed">
                <p>
                  Kalamkari is more than an art form; it is a living narrative whispered through generations. The term itself, derived from 'kalam' (pen) and 'kari' (craftsmanship), describes the meticulous process of hand-painting or block-printing textiles.
                </p>
                <p>
                  Our collection is a tribute to this ancient craft. We partner with master artisans who use natural dyes and traditional motifs inspired by folklore and nature, ensuring each saree is a singular masterpiece of cultural pride and artistic excellence.
                </p>
              </div>
              <Link to="/shop" className="mt-8 inline-block">
                <Button variant="link" className="p-0 h-auto text-primary text-lg font-paragraph group">
                  Discover the Craft <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1"/>
                </Button>
              </Link>
            </AnimatedElement>
          </div>
        </section>

        {/* Promotions Section */}
        {promotions.length > 0 && (
          <section className="w-full py-24 md:py-32">
            <div className="max-w-[120rem] mx-auto px-6 md:px-12">
              <AnimatedElement>
                <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-12">Seasonal Offerings</h2>
              </AnimatedElement>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {promotions[0] && (
                  <AnimatedElement className="lg:col-span-3">
                    <a href={promotions[0].callToActionUrl} className="group relative block overflow-clip h-[500px]">
                      <Image
                        src={promotions[0].bannerImage || "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=promo-large"}
                        alt={promotions[0].title || 'Seasonal Promotion'}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        width={900}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 text-primary-foreground">
                        <h3 className="font-heading text-4xl mb-2">{promotions[0].title}</h3>
                        <p className="font-paragraph text-lg max-w-md mb-6 text-primary-foreground/90">{promotions[0].description}</p>
                        <Button size="lg" className="h-12 px-8 text-base rounded-sm font-paragraph">Shop Now</Button>
                      </div>
                    </a>
                  </AnimatedElement>
                )}
                {promotions[1] && (
                  <AnimatedElement className="lg:col-span-2" delay={200}>
                    <a href={promotions[1].callToActionUrl} className="group relative block overflow-clip h-[500px] bg-secondary/30">
                      <Image
                        src={promotions[1].bannerImage || "https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=promo-small"}
                        alt={promotions[1].title || 'Special Offer'}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        width={600}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 text-primary-foreground">
                        <h3 className="font-heading text-3xl mb-2">{promotions[1].title}</h3>
                        <p className="font-paragraph mb-4 text-primary-foreground/90">{promotions[1].description}</p>
                        <Button variant="secondary" className="rounded-sm">Explore</Button>
                      </div>
                    </a>
                  </AnimatedElement>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us Section */}
        <section className="w-full py-24 md:py-32 bg-secondary/30 relative fabric-texture">
          <div className="max-w-[120rem] mx-auto px-6 md:px-12">
            <AnimatedElement className="text-center max-w-3xl mx-auto">
              <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">The Kalamkari Promise</h2>
              <p className="font-paragraph text-lg text-foreground/80 leading-relaxed">We are committed to delivering not just a product, but an experience steeped in authenticity, quality, and respect for tradition.</p>
            </AnimatedElement>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
              {whyChooseUsItems.map((item, index) => (
                <AnimatedElement key={index} delay={index * 150} className="text-center">
                  <p className="font-heading text-7xl text-primary/20 mb-4">0{index + 1}</p>
                  <h3 className="font-heading text-2xl text-foreground mb-3">{item.title}</h3>
                  <p className="font-paragraph text-foreground/70 leading-relaxed max-w-sm mx-auto">{item.description}</p>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Breather / Gallery */}
        <section className="w-full py-24 md:py-32">
            <div className="max-w-[120rem] mx-auto px-6 md:px-12">
                <AnimatedElement>
                    <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Woven in Elegance</h2>
                    <p className="font-paragraph text-lg text-foreground/70 max-w-2xl mb-12">Explore the vibrant world of Kalamkari through our visual journal.</p>
                </AnimatedElement>
            </div>
            <AnimatedElement className="horizontal-scroll-container overflow-x-auto pb-8">
                <div className="flex gap-8 px-6 md:px-12 w-max">
                    {galleryImages.map((image, index) => (
                        <div key={index} className="w-[40vh] md:w-[50vh] aspect-[3/4] flex-shrink-0 overflow-clip">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                width={500}
                                height={667}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </AnimatedElement>
        </section>

        {/* Newsletter Section */}
        <section className="w-full py-24 md:py-32 bg-secondary/30">
            <div className="max-w-2xl mx-auto text-center px-6">
                <AnimatedElement>
                    <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">Join the Collective</h2>
                    <p className="font-paragraph text-lg text-foreground/80 mb-8">
                        Become a part of our story. Receive exclusive access to new collections, artisan stories, and special offers.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input type="email" placeholder="Enter your email address" className="flex-grow h-12 px-4 bg-background border border-primary/20 rounded-sm placeholder:text-foreground/50 font-paragraph focus:ring-2 focus:ring-primary focus:outline-none"/>
                        <Button type="submit" size="lg" className="h-12 px-8 text-base rounded-sm font-paragraph">Subscribe</Button>
                    </form>
                </AnimatedElement>
            </div>
        </section>

      </main>
    </>
  );
}
