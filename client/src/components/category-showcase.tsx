import { motion } from "framer-motion";
import { Link } from "wouter";

interface Category {
    name: string;
    slug: string;
    image: string;
    productCount?: number;
}

const categories: Category[] = [
    {
        name: "Telefonlar",
        slug: "Elektronika",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    },
    {
        name: "Noutbuklar",
        slug: "Elektronika",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    },
    {
        name: "Kiyimlar",
        slug: "Kiyim-kechak",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
    },
    {
        name: "Soatlar",
        slug: "Aksessuarlar",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    },
    {
        name: "Sport",
        slug: "Sport",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    },
    {
        name: "Uy-ro'zg'or",
        slug: "Uy-ro'zg'or",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    },
];

interface CategoryShowcaseProps {
    onCategoryClick: (category: string) => void;
}

export function CategoryShowcase({ onCategoryClick }: CategoryShowcaseProps) {
    return (
        <section className="py-12 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold">Kategoriyalar</h2>
                    <span className="text-sm text-muted-foreground">Barcha toifalar</span>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {categories.map((category, idx) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => onCategoryClick(category.slug)}
                            className="flex-shrink-0 w-32 md:w-40 cursor-pointer group"
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-secondary">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-center font-medium text-sm group-hover:text-primary transition-colors">
                                {category.name}
                            </h3>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Custom scrollbar hide */}
            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </section>
    );
}
