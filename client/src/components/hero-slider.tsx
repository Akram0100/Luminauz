import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    bgGradient: string;
    accentColor: string;
}

const slides: Slide[] = [
    {
        id: 1,
        title: "Yangi Mahsulotlar Yetib Keldi!",
        subtitle: "Eng so'nggi modellar va trendlar sizni kutmoqda",
        buttonText: "Xarid Qilish",
        buttonLink: "#products",
        bgGradient: "from-violet-600 via-purple-600 to-indigo-700",
        accentColor: "bg-white text-purple-600",
    },
    {
        id: 2,
        title: "Kuzgi Chegirmalar — 50% gacha",
        subtitle: "Cheklangan vaqt! Eng yaxshi takliflarni qo'ldan boy bermang",
        buttonText: "Chegirmalarni Ko'rish",
        buttonLink: "/flash-sales",
        bgGradient: "from-orange-500 via-red-500 to-pink-600",
        accentColor: "bg-white text-red-600",
    },
    {
        id: 3,
        title: "Bepul Yetkazib Berish",
        subtitle: "200,000 so'mdan ortiq buyurtmalarga butun O'zbekiston bo'ylab",
        buttonText: "Batafsil",
        buttonLink: "#products",
        bgGradient: "from-emerald-500 via-teal-500 to-cyan-600",
        accentColor: "bg-white text-teal-600",
    },
];

export function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const slide = slides[currentSlide];

    return (
        <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.7 }}
                    className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>

                    {/* Content */}
                    <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="max-w-2xl text-white"
                        >
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-lg md:text-xl opacity-90 mb-8">
                                {slide.subtitle}
                            </p>
                            <Link href={slide.buttonLink}>
                                <Button
                                    size="lg"
                                    className={`${slide.accentColor} font-bold px-8 h-14 rounded-full shadow-xl hover:scale-105 transition-transform`}
                                >
                                    {slide.buttonText}
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/70"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
