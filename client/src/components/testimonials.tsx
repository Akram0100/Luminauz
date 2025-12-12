import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    text: string;
    product: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Aziza Karimova",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        rating: 5,
        text: "Juda tez yetkazib berishdi! Mahsulot sifati ham a'lo darajada. Keyingi xaridimni ham shu yerdan qilaman.",
        product: "iPhone 15 Pro",
    },
    {
        id: 2,
        name: "Sardor Aliyev",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 5,
        text: "Narxi bozordagidan arzonroq, sifati esa original. Ishonchli do'kon!",
        product: "Samsung Galaxy S24",
    },
    {
        id: 3,
        name: "Malika Rahimova",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        rating: 5,
        text: "Xizmat ko'rsatish juda yaxshi. Savollarimga tezda javob berishdi. Rahmat!",
        product: "AirPods Pro",
    },
];

export function Testimonials() {
    return (
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Mijozlarimiz Fikrlari</h2>
                    <p className="text-muted-foreground">10,000+ mamnun xaridorlar</p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors"
                        >
                            {/* Quote Icon */}
                            <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-foreground/80 mb-6 leading-relaxed">
                                "{testimonial.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold">{testimonial.name}</h4>
                                    <p className="text-sm text-muted-foreground">{testimonial.product} xaridori</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { value: "10K+", label: "Xaridorlar" },
                        { value: "99%", label: "Mamnunlik" },
                        { value: "24/7", label: "Qo'llab-quvvatlash" },
                        { value: "1-3", label: "Kunlik Yetkazish" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="text-center p-4 rounded-xl bg-secondary/50"
                        >
                            <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
