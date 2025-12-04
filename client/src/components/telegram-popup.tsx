import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TelegramPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if popup was already shown
        const wasShown = localStorage.getItem("telegram_popup_shown");
        if (wasShown) return;

        // Show popup after 2 minutes (120000ms)
        const timer = setTimeout(() => {
            setIsOpen(true);
            localStorage.setItem("telegram_popup_shown", "true");
        }, 120000); // 2 minutes

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
                    >
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088cc]/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />

                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Content */}
                            <div className="relative text-center">
                                {/* Telegram Icon */}
                                <div className="w-20 h-20 bg-[#0088cc] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0088cc]/30">
                                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                </div>

                                <h3 className="text-2xl font-bold mb-2">Bizga Obuna Bo'ling!</h3>
                                <p className="text-muted-foreground mb-6">
                                    Chegirmalar, yangi mahsulotlar va maxsus takliflar haqida birinchi bo'lib xabar oling!
                                </p>

                                {/* Features */}
                                <div className="flex justify-center gap-4 mb-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <span className="text-green-500">✓</span> Chegirmalar
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-green-500">✓</span> Yangiliklar
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-green-500">✓</span> Aksiyalar
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <a
                                    href="https://t.me/Lumina_uzb"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Button className="w-full h-14 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-lg rounded-full shadow-lg">
                                        <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                        </svg>
                                        @Lumina_uzb
                                    </Button>
                                </a>

                                <p className="text-xs text-muted-foreground mt-4">
                                    5000+ odam allaqachon obuna bo'lgan!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
