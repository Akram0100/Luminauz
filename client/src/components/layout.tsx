import { Link, useLocation } from "wouter";
import { assets } from "@/lib/mock-data";
import { ShoppingCart, Search, User, Menu, ShieldCheck, Sun, Moon, LogOut, LogIn, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Chiqildi", description: "Tizimdan muvaffaqiyatli chiqdingiz" });
      setLocation("/");
    } catch (error) {
      toast({ title: "Xatolik", description: "Chiqishda xatolik yuz berdi", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-background transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img
                src={assets.logo}
                alt="Lumina"
                className="h-10 w-10 rounded-lg object-cover border border-primary/20 group-hover:border-primary/50 transition-all shadow-[0_0_15px_-5px_var(--color-primary)]"
              />
              <span className="font-display font-bold text-xl tracking-wide">
                Lumina<span className="text-primary">.</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/">
              <span className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                Do'kon
              </span>
            </Link>
            <Link href="/flash-sales">
              <span className={`text-sm font-medium hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1 ${location === '/flash-sales' ? 'text-red-500' : 'text-muted-foreground'}`}>
                <Flame className="w-4 h-4" /> Flash Sale
              </span>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <span className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Admin Panel
                </span>
              </Link>
            )}
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Biz Haqimizda
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                className="h-9 w-64 rounded-full bg-secondary/50 border border-border pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                data-testid="input-search"
              />
            </div>

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:text-primary"
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary relative"
              onClick={() => setLocation("/checkout")}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-background"
                  data-testid="badge-cart-count"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:text-primary" data-testid="button-user-menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border min-w-[180px]">
                {user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? "Administrator" : "Foydalanuvchi"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem
                        className="focus:bg-primary/10 focus:text-primary cursor-pointer"
                        onClick={() => setLocation('/admin')}
                        data-testid="menu-admin"
                      >
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                      onClick={handleLogout}
                      data-testid="menu-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Chiqish
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    className="focus:bg-primary/10 focus:text-primary cursor-pointer"
                    onClick={() => setLocation('/login')}
                    data-testid="menu-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Kirish
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-l border-border">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="text-lg font-medium cursor-pointer">Do'kon</span>
                  </Link>
                  <Link href="/flash-sales" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="text-lg font-medium cursor-pointer text-red-500 flex items-center gap-2">
                      <Flame className="w-5 h-5" /> Flash Sale
                    </span>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="text-lg font-medium cursor-pointer">Admin Panel</span>
                    </Link>
                  )}
                  {user ? (
                    <button
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      className="text-lg font-medium text-left text-destructive"
                    >
                      Chiqish
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="text-lg font-medium cursor-pointer text-primary">Kirish</span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>

      <footer className="border-t border-border mt-20 bg-secondary/30">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-12">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-2">Yangiliklarga Obuna Bo'ling!</h3>
            <p className="text-muted-foreground mb-6">Chegirmalar va yangi mahsulotlar haqida birinchi bo'lib xabar oling</p>
            <a
              href="https://t.me/Lumina_uzb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              @Lumina_uzb ga Obuna Bo'ling
            </a>
          </div>
        </div>

        {/* Main Footer */}
        <div className="py-12">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div>
              <span className="font-display font-bold text-xl tracking-wide">
                Lumina<span className="text-primary">.</span>
              </span>
              <p className="mt-4 text-sm text-muted-foreground">
                O'zbekistondagi eng ishonchli online do'kon. Premium sifat va tezkor yetkazib berish.
              </p>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://t.me/Lumina_uzb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center hover:bg-[#0088cc]/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold mb-4">Aloqa</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+998996448444" className="hover:text-primary">+998 99 644 84 44</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>O'rikzor bozori, sklad</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>9:00 - 21:00 (Har kuni)</span>
                </li>
              </ul>
            </div>

            {/* Delivery Info */}
            <div>
              <h4 className="font-bold mb-4">Yetkazib Berish</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Toshkent bo'ylab: <strong className="text-foreground">35,000 so'm</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Minimal buyurtma: <strong className="text-foreground">400,000 so'm</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>1-2 kun ichida yetkazish</span>
                </li>
              </ul>
            </div>

            {/* Guarantee */}
            <div>
              <h4 className="font-bold mb-4">Kafolat</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>100% Original mahsulotlar</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>14 kun qaytarish huquqi</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Xavfsiz to'lov</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2024 Lumina. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
