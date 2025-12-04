import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Checkout from "@/pages/checkout";
import Login from "@/pages/login";
import ProductPage from "@/pages/product";
import FlashSalesPage from "@/pages/flash-sales";
import Forbidden from "@/pages/forbidden";
import { Link } from "wouter";

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!isAdmin) {
    return <Forbidden />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/flash-sales" component={FlashSalesPage} />
      <Route path="/admin">
        <ProtectedAdminRoute component={Admin} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
