import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getFlashSales } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Check, 
  Flame, 
  Timer, 
  Zap, 
  TrendingDown,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

function AnimatedCountdown({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-b from-red-500 to-red-600 text-white rounded-lg p-3 min-w-[60px] text-center shadow-lg"
      >
        <span className="text-2xl font-bold font-mono">
          {value.toString().padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <TimeBox value={timeLeft.hours} label="Soat" />
      <span className="text-2xl font-bold text-red-500 animate-pulse">:</span>
      <TimeBox value={timeLeft.minutes} label="Daqiqa" />
      <span className="text-2xl font-bold text-red-500 animate-pulse">:</span>
      <TimeBox value={timeLeft.seconds} label="Soniya" />
    </div>
  );
}

function FlashSaleCard({ product, onAddToCart, isAdded }: { 
  product: Product; 
  onAddToCart: () => void;
  isAdded: boolean;
}) {
  const discount = product.flashSalePrice 
    ? Math.round(((product.price - product.flashSalePrice) / product.price) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <Card className="overflow-hidden border-2 border-red-500/30 hover:border-red-500 transition-all bg-gradient-to-b from-background to-red-500/5">
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 animate-pulse" />
            {product.flashSaleEnds && (
              <span className="font-mono">
                {(() => {
                  const diff = new Date(product.flashSaleEnds).getTime() - Date.now();
                  if (diff <= 0) return "Tugadi";
                  const h = Math.floor(diff / (1000 * 60 * 60));
                  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  const s = Math.floor((diff % (1000 * 60)) / 1000);
                  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
                })()}
              </span>
            )}
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <Link href={`/product/${product.id}`} data-testid={`link-flash-sale-${product.id}`}>
          <div className="aspect-square overflow-hidden relative pt-10">
            <img 
              src={product.imageUrl} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            <div className="absolute top-12 right-3">
              <Badge className="bg-red-500 text-white text-lg px-3 py-1 shadow-lg">
                <TrendingDown className="w-4 h-4 mr-1" />
                -{discount}%
              </Badge>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </Link>

        <CardContent className="p-5 space-y-4">
          <div>
            <Badge variant="secondary" className="text-xs mb-2">{product.category}</Badge>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                {product.title}
              </h3>
            </Link>
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-500">{formatPrice(product.flashSalePrice || 0)}</span>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
            <Badge variant="outline" className="border-green-500 text-green-500">
              {formatPrice(product.price - (product.flashSalePrice || 0))} tejaysiz
            </Badge>
          </div>

          {product.flashSaleMarketingText && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-red-500 pl-3">
              {product.flashSaleMarketingText}
            </p>
          )}

          <div className="flex gap-3">
            <Button 
              className={`flex-1 transition-colors ${
                isAdded ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
              data-testid={`button-flash-buy-${product.id}`}
            >
              {isAdded ? (
                <><Check className="w-4 h-4 mr-2" /> Qo'shildi!</>
              ) : (
                <><ShoppingCart className="w-4 h-4 mr-2" /> Sotib Olish</>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/product/${product.id}`} data-testid={`link-details-${product.id}`}>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FlashSalesPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["flash-sales"],
    queryFn: getFlashSales,
    refetchInterval: 30000,
  });

  const { addToCart } = useCart();
  const { toast } = useToast();
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

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

  const nearestEndTime = products.length > 0
    ? products.reduce((nearest, p) => {
        if (!p.flashSaleEnds) return nearest;
        const ends = new Date(p.flashSaleEnds).getTime();
        return ends < nearest ? ends : nearest;
      }, Infinity)
    : null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-red-500/5 to-background">
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-3 bg-red-500/20 backdrop-blur-sm rounded-full px-6 py-2 border border-red-500/30">
                <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                <span className="text-red-500 font-bold">Tezkor Chegirmalar</span>
                <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
              </div>

              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
                  Flash Sale
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Cheklangan vaqt ichida eng yaxshi mahsulotlarni eng arzon narxlarda sotib oling!
                Fursatni qo'ldan boy bermang!
              </p>

              {nearestEndTime && nearestEndTime !== Infinity && (
                <div className="flex flex-col items-center gap-4 pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>Eng yaqin tugash vaqti:</span>
                  </div>
                  <AnimatedCountdown endsAt={new Date(nearestEndTime)} />
                </div>
              )}
            </motion.div>
          </div>

          <div className="absolute -left-20 top-0 w-40 h-40 bg-red-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -right-20 bottom-0 w-40 h-40 bg-orange-500/30 rounded-full blur-3xl animate-pulse" />
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-square" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Timer className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold">Hozircha Flash Sale yo'q</h2>
                  <p className="text-muted-foreground">
                    Yangi chegirmalar tez orada e'lon qilinadi. Kuzatishda boring!
                  </p>
                  <Button asChild>
                    <Link href="/" data-testid="link-browse-products">
                      Mahsulotlarni Ko'rish
                    </Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <FlashSaleCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      isAdded={addedItems.has(product.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <Zap className="w-10 h-10 mx-auto text-yellow-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Tezkor Chegirmalar</h3>
                <p className="text-sm text-muted-foreground">Har kuni yangi flash sale takliflar</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <TrendingDown className="w-10 h-10 mx-auto text-green-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">70% gacha chegirma</h3>
                <p className="text-sm text-muted-foreground">Eng katta chegirmalar faqat bu yerda</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <Clock className="w-10 h-10 mx-auto text-red-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Cheklangan Vaqt</h3>
                <p className="text-sm text-muted-foreground">Fursatni qo'ldan boy bermang</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
