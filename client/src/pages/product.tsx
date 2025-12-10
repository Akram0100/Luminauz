import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getProduct, getRelatedProducts } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "wouter";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Flame,
  Timer,
  Package,
  Tag,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  return <span className="font-mono text-2xl">{timeLeft}</span>;
}

function ImageSlider({ images, mainImage }: { images: string[]; mainImage: string }) {
  const allImages = [mainImage, ...images.filter(img => img !== mainImage)];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (allImages.length === 1) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/20">
        <img
          src={allImages[0]}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/20 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={allImages[currentIndex]}
            alt="Product"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        <Button
          size="icon"
          variant="secondary"
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          onClick={prevSlide}
          data-testid="button-prev-image"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          onClick={nextSlide}
          data-testid="button-next-image"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-white/50"
                }`}
              onClick={() => setCurrentIndex(idx)}
              data-testid={`button-thumbnail-${idx}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentIndex ? "border-primary" : "border-transparent"
              }`}
            data-testid={`button-gallery-${idx}`}
          >
            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function YouTubeEmbed({ url }: { url: string }) {
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(url);
  if (!videoId) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500" />
          Mahsulot Videosi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Product Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SpecificationsTable({ specs }: { specs: { label: string; value: string }[] }) {
  if (!specs || specs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Xususiyatlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex py-3 first:pt-0 last:pb-0">
              <span className="text-muted-foreground w-1/3">{spec.label}</span>
              <span className="font-medium w-2/3">{spec.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RelatedProducts({ productId }: { productId: number }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", productId, "related"],
    queryFn: () => getRelatedProducts(productId, 4),
  });

  const { addToCart } = useCart();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-card border border-border">
            <Skeleton className="aspect-square" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">O'xshash Mahsulotlar</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug || product.id}`}
            className="group rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-colors"
            data-testid={`link-related-${product.id}`}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {product.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold">{formatPrice(product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price)}</span>
                {product.isFlashSale && product.flashSalePrice && (
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const idOrSlug = params.id || "";

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", idOrSlug],
    queryFn: () => getProduct(idOrSlug),
    enabled: !!idOrSlug,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idOrSlug]);

  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setIsAdded(true);
    toast({
      title: "Savatga qo'shildi!",
      description: `${product.title} savatga qo'shildi`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isInCart = items.some((item) => product && item.product.id === product.id);
  const displayPrice = product?.isFlashSale && product?.flashSalePrice
    ? product.flashSalePrice
    : product?.price || 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Mahsulot topilmadi</h1>
          <p className="text-muted-foreground mb-6">Kechirasiz, bu mahsulot mavjud emas.</p>
          <Button asChild>
            <Link href="/" data-testid="link-back-home">Bosh sahifaga qaytish</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const galleryImages = (product.gallery || []) as string[];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/" data-testid="link-back">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ImageSlider images={galleryImages} mainImage={product.imageUrl} />

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
                {product.brand && (
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                )}
                {product.isFlashSale && (
                  <Badge className="bg-red-500 text-white">
                    <Flame className="w-3 h-3 mr-1" />
                    Flash Sale
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4" data-testid="text-product-title">{product.title}</h1>

              {product.shortDescription && (
                <p className="text-lg text-muted-foreground">{product.shortDescription}</p>
              )}
            </div>

            {product.isFlashSale && product.flashSaleEnds && (
              <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-red-500 animate-pulse" />
                      <span className="font-medium">Chegirma tugashiga:</span>
                    </div>
                    <CountdownTimer endsAt={new Date(product.flashSaleEnds)} />
                  </div>
                  {product.flashSaleMarketingText && (
                    <p className="mt-2 text-sm text-muted-foreground">{product.flashSaleMarketingText}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold" data-testid="text-product-price">{formatPrice(displayPrice)}</span>
              {product.isFlashSale && product.flashSalePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <Badge className="bg-red-500 text-white">
                    -{Math.round(((product.price - product.flashSalePrice) / product.price) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {product.stock !== undefined && product.stock !== null && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {product.stock > 0 ? `Omborda: ${product.stock} dona` : "Tugagan"}
                </span>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(product.tags as string[]).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                className={`flex-1 h-14 text-lg transition-colors ${isAdded ? "bg-green-500 hover:bg-green-600" : ""
                  }`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                data-testid="button-add-to-cart"
              >
                {isAdded ? (
                  <><Check className="w-5 h-5 mr-2" /> Qo'shildi!</>
                ) : isInCart ? (
                  <><ShoppingCart className="w-5 h-5 mr-2" /> Yana Qo'shish</>
                ) : (
                  <><ShoppingCart className="w-5 h-5 mr-2" /> Savatga Qo'shish</>
                )}
              </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary/30">
                <Truck className="w-5 h-5 mx-auto mb-2 text-primary" />
                <span className="text-xs">Bepul Yetkazish</span>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-primary" />
                <span className="text-xs">Kafolat</span>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <RotateCcw className="w-5 h-5 mx-auto mb-2 text-primary" />
                <span className="text-xs">14 Kun Qaytarish</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {product.fullDescription && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">To'liq Tavsif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {product.fullDescription.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!product.fullDescription && product.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tavsif</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {product.videoUrl && <YouTubeEmbed url={product.videoUrl} />}
          </div>

          <div className="space-y-6">
            <SpecificationsTable specs={(product.specs || []) as { label: string; value: string }[]} />

            {product.aiAnalysis && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    AI Tahlili
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {(product.aiAnalysis as any).sellingPoints && (
                    <div>
                      <p className="font-medium mb-2">Asosiy Afzalliklar:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {((product.aiAnalysis as any).sellingPoints as string[]).map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(product.aiAnalysis as any).useCases && (
                    <div>
                      <p className="font-medium mb-2">Foydalanish Holatlari:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {((product.aiAnalysis as any).useCases as string[]).map((useCase, idx) => (
                          <li key={idx}>{useCase}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {product && <RelatedProducts productId={product.id} />}
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:hidden z-50 safe-area-bottom">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Narxi</div>
            <div className="text-xl font-bold">{formatPrice(displayPrice)}</div>
          </div>
          <Button
            size="lg"
            className={`flex-1 transition-colors ${isAdded ? "bg-green-500 hover:bg-green-600" : ""
              }`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {isAdded ? (
              <><Check className="w-5 h-5 mr-2" /> Qo'shildi</>
            ) : (
              <><ShoppingCart className="w-5 h-5 mr-2" /> Savatga</>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
