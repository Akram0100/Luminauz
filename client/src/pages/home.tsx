import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Timer, Flame, ShoppingCart, Check, Star, ArrowRight, Truck, ShieldCheck, Award, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getFlashSales } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import type { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { SEO } from "@/components/seo";
import { HeroSlider } from "@/components/hero-slider";
import { FeaturedProducts } from "@/components/featured-products";
import { CategoryShowcase } from "@/components/category-showcase";
import { Testimonials } from "@/components/testimonials";

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return "Tugadi";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return <span className="font-mono">{timeLeft}</span>;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: flashSales = [] } = useQuery({
    queryKey: ["flash-sales"],
    queryFn: getFlashSales,
  });

  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedItems((prev) => new Set(prev).add(product.id));
    toast({
      title: "Savatga qo'shildi!",
      description: `${product.title} savatga qo'shildi`,
    });
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const isInCart = (productId: number) => {
    return items.some((item) => item.product.id === productId);
  };

  const getDisplayPrice = (product: Product) => {
    if (product.isFlashSale && product.flashSalePrice) {
      return product.flashSalePrice;
    }
    return product.price;
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <Layout>
      <SEO
        title="Bosh Sahifa"
        description="Lumina - O'zbekistondagi eng yaxshi online do'kon. Premium sifatli mahsulotlar, arzon narxlar va tezkor yetkazib berish."
        url="/"
      />

      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Category Showcase */}
      <CategoryShowcase onCategoryClick={handleCategoryClick} />

      {/* Flash Sales Section */}
      {flashSales.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-y border-red-500/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/20">
                  <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold">Flash Sale</h2>
                <Badge variant="destructive" className="animate-pulse">
                  <Timer className="w-3 h-3 mr-1" /> Cheklangan Vaqt
                </Badge>
              </div>
              <Link href="/flash-sales">
                <Button variant="ghost" className="text-red-500">
                  Barchasini ko'rish <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {flashSales.slice(0, 6).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative rounded-2xl overflow-hidden bg-card border-2 border-red-500/50 hover:border-red-500 transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-1 text-sm font-bold z-10">
                    <Timer className="w-3 h-3 inline mr-1" />
                    {product.flashSaleEnds && <CountdownTimer endsAt={new Date(product.flashSaleEnds)} />}
                  </div>

                  <Link href={`/product/${product.slug || product.id}`}>
                    <div className="aspect-square overflow-hidden relative pt-8">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-10 right-2">
                        <Badge className="bg-red-500 text-white">
                          -{Math.round(((product.price - (product.flashSalePrice || 0)) / product.price) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2 truncate">{product.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-red-500">{formatPrice(product.flashSalePrice || 0)}</span>
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                    </div>
                    <Button
                      className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full"
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Sotib Olish
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <FeaturedProducts
        products={products}
        onAddToCart={handleAddToCart}
        addedItems={addedItems}
        isInCart={isInCart}
      />

      {/* Trust Badges */}
      <section className="py-12 border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "100% Original", desc: "Sifat kafolati" },
              { icon: Truck, title: "Bepul Yetkazish", desc: "200K+ buyurtmalarga" },
              { icon: Award, title: "Premium Sifat", desc: "Tekshirilgan mahsulotlar" },
              { icon: Star, title: "24/7 Yordam", desc: "Har doim aloqadamiz" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products Grid */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold">Barcha Mahsulotlar</h2>
            <span className="text-muted-foreground">{filteredProducts.length} ta mahsulot</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? `"${searchQuery}" bo'yicha mahsulot topilmadi` : "Hozircha mahsulotlar yo'q."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/product/${product.slug || product.id}`}>
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {product.isFlashSale && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          <Flame className="w-3 h-3 mr-1" /> Sale
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <p className="text-xs text-primary font-medium mb-1">{product.category}</p>
                    <Link href={`/product/${product.slug || product.id}`}>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">{formatPrice(getDisplayPrice(product))}</span>
                        {product.isFlashSale && product.flashSalePrice && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`rounded-full ${addedItems.has(product.id) ? "text-green-500" : ""}`}
                        onClick={() => handleAddToCart(product)}
                      >
                        {addedItems.has(product.id) ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter / Telegram CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Chegirmalardan Xabardor Bo'ling!</h2>
            <p className="text-muted-foreground mb-8">
              Telegram kanalimizga obuna bo'ling va maxsus takliflardan birinchi bo'lib xabar oling
            </p>
            <a
              href="https://t.me/Lumina_uzb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0088cc] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#0077b5] transition-colors shadow-lg"
            >
              <Send className="w-5 h-5" />
              Telegram: @Lumina_uzb
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
