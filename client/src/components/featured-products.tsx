import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, TrendingUp, ShoppingCart, Check, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

interface FeaturedProductsProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    addedItems: Set<number>;
    isInCart: (productId: number) => boolean;
}

type TabType = "bestsellers" | "new" | "budget";

const tabs = [
    { id: "bestsellers" as TabType, label: "Eng Ko'p Sotilganlar", icon: TrendingUp },
    { id: "new" as TabType, label: "Yangi Kelganlar", icon: Sparkles },
    { id: "budget" as TabType, label: "Arzon Narxda", icon: Flame },
];

export function FeaturedProducts({ products, onAddToCart, addedItems, isInCart }: FeaturedProductsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("bestsellers");

    const getFilteredProducts = () => {
        switch (activeTab) {
            case "bestsellers":
                // Sort by some popularity metric (using id as proxy for now)
                return [...products].sort((a, b) => b.id - a.id).slice(0, 8);
            case "new":
                // Newest first (by createdAt)
                return [...products]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 8);
            case "budget":
                // Cheapest first
                return [...products].sort((a, b) => a.price - b.price).slice(0, 8);
            default:
                return products.slice(0, 8);
        }
    };

    const filteredProducts = getFilteredProducts();

    const getDisplayPrice = (product: Product) => {
        if (product.isFlashSale && product.flashSalePrice) {
            return product.flashSalePrice;
        }
        return product.price;
    };

    return (
        <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Tanlangan Mahsulotlar</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Eng yaxshi takliflar va mashhur mahsulotlar to'plami
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-secondary/50 rounded-full p-1.5 gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                            ? "bg-primary text-primary-foreground shadow-lg"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Products Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {filteredProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                            >
                                <Link href={`/product/${product.slug || product.id}`}>
                                    <div className="aspect-square overflow-hidden relative">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {product.isFlashSale && (
                                                <Badge className="bg-red-500 text-white text-xs">
                                                    <Flame className="w-3 h-3 mr-1" /> Sale
                                                </Badge>
                                            )}
                                            {activeTab === "new" && (
                                                <Badge className="bg-emerald-500 text-white text-xs">
                                                    <Sparkles className="w-3 h-3 mr-1" /> Yangi
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Quick Add Button - Visible on Hover */}
                                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                className={`w-full rounded-full ${addedItems.has(product.id)
                                                        ? "bg-green-500 text-white"
                                                        : "bg-white text-black hover:bg-primary hover:text-white"
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onAddToCart(product);
                                                }}
                                            >
                                                {addedItems.has(product.id) ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-1" /> Qo'shildi
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4 mr-1" /> Savatga
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wide">
                                        {product.category}
                                    </p>
                                    <Link href={`/product/${product.slug || product.id}`}>
                                        <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {product.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold">
                                                {formatPrice(getDisplayPrice(product))}
                                            </span>
                                            {product.isFlashSale && product.flashSalePrice && (
                                                <span className="text-xs text-muted-foreground line-through">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Mobile Add Button */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`lg:hidden rounded-full ${addedItems.has(product.id) ? "text-green-500" : ""
                                                }`}
                                            onClick={() => onAddToCart(product)}
                                        >
                                            {addedItems.has(product.id) ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <ShoppingCart className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* View All Button */}
                <div className="text-center mt-10">
                    <Link href="#products">
                        <Button variant="outline" size="lg" className="rounded-full px-8">
                            Barcha Mahsulotlar
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
