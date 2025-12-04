import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Award, ShoppingCart, ShieldCheck, Check, Truck, Star, Search, Timer, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getFlashSales, searchProducts } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import type { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 border-primary/50 text-primary bg-primary/10 backdrop-blur-md px-4 py-1.5 text-sm">
                <Star className="w-4 h-4 mr-2" />
                Premium Texnologiyalar Do'koni
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Eng Yaxshi <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent glow-text">
                  Texnologiyalar
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Premium sifatli mahsulotlar, arzon narxlar va tezkor yetkazib berish. Siz uchun eng yaxshi tanlovlar.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-background hover:bg-primary/90 font-bold px-8 h-12 rounded-full shadow-[0_0_20px_-5px_var(--color-primary)]"
                  onClick={() => setLocation("/checkout")}
                  data-testid="button-start-shopping"
                >
                  Xaridni Boshlash <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-full border-primary/20 hover:bg-primary/5">
                  Katalogni Ko'rish
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute -right-20 top-20 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl opacity-30 animate-pulse" />
      </section>

      {/* Flash Sales Section */}
      {flashSales.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-y border-red-500/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-full bg-red-500/20">
                <Flame className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold">Flash Sale - Tezkor Chegirma!</h2>
              <Badge variant="destructive" className="animate-pulse">
                <Timer className="w-3 h-3 mr-1" /> Cheklangan Vaqt
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSales.map((product) => (
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

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 truncate">{product.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-red-500">{formatPrice(product.flashSalePrice || 0)}</span>
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                    </div>
                    <Button 
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleAddToCart(product)}
                      data-testid={`button-flash-sale-${product.id}`}
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

      {/* Features Grid */}
      <section className="py-20 border-y border-border bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Premium Sifat",
                desc: "Har bir mahsulot sinchkovlik bilan tekshirilgan va sifat standartlariga mos keladi."
              },
              {
                icon: Truck,
                title: "Tezkor Yetkazish",
                desc: "1-3 kun ichida bepul yetkazib berish. Buyurtmangizni tez va xavfsiz qabul qiling."
              },
              {
                icon: ShieldCheck,
                title: "Xavfsiz To'lov",
                desc: "100% xavfsiz to'lov tizimlari va ma'lumotlaringiz himoyasi kafolatlangan."
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all hover:bg-secondary/50 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Mahsulot qidirish..."
                className="pl-10 h-12 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(null)}
                data-testid="button-category-all"
              >
                Hammasi
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`button-category-${cat}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-12">
            <h2 className="text-3xl font-bold">Tanlangan Texnologiyalar</h2>
            <span className="text-muted-foreground">{filteredProducts.length} ta mahsulot</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? `"${searchQuery}" bo'yicha mahsulot topilmadi` : "Hozircha mahsulotlar yo'q. Admin paneldan yangi mahsulot qo'shing."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <Link href={`/product/${product.id}`} data-testid={`link-product-${product.id}`}>
                    <div className="aspect-square overflow-hidden relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-60" />
                      
                      <div className="absolute top-3 right-3">
                        {product.isFlashSale ? (
                          <Badge className="bg-red-500 text-white">
                            <Flame className="w-3 h-3 mr-1" /> Sale
                          </Badge>
                        ) : (
                          <Badge className="bg-background/50 backdrop-blur-md border border-primary/30 text-primary text-xs">
                            <Star className="w-3 h-3 mr-1" /> Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="text-xs text-primary mb-2 font-medium tracking-wider uppercase">
                      {product.category}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer">
                        {product.title}
                      </h3>
                    </Link>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="mb-4 space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-mono">{formatPrice(getDisplayPrice(product))}</span>
                        {product.isFlashSale && product.flashSalePrice && (
                          <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className={`rounded-full transition-colors ${
                          addedItems.has(product.id) 
                            ? "bg-green-500 text-white" 
                            : isInCart(product.id)
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary hover:bg-primary hover:text-background"
                        }`}
                        onClick={() => handleAddToCart(product)}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        {addedItems.has(product.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
