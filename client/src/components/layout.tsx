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

      <footer className="border-t border-border py-12 mt-20 bg-secondary/20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
             <span className="font-display font-bold text-xl tracking-wide">
                Lumina<span className="text-primary">.</span>
              </span>
              <p className="mt-4 text-sm text-muted-foreground">
                Premium sifatli texnologiyalar do'koni. Eng yaxshi mahsulotlar, eng yaxshi narxlar.
              </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Xizmatlar</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Tezkor Qidiruv</li>
              <li>Sifat Kafolati</li>
              <li>Bepul Yetkazib Berish</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Kompaniya</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Biz Haqimizda</li>
              <li>Aloqa</li>
              <li>Yordam</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Kafolat</h4>
            <div className="flex items-center gap-2 text-primary/80">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm">100% Sifat Kafolati</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
