import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function Forbidden() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">403</h1>
              <h2 className="text-xl font-semibold text-muted-foreground">Ruxsat Berilmagan</h2>
              <p className="text-muted-foreground">
                Bu sahifaga kirish uchun admin huquqi talab qilinadi. 
                Iltimos, admin sifatida tizimga kiring.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild variant="outline">
                <Link href="/" data-testid="link-home">
                  <Home className="w-4 h-4 mr-2" />
                  Bosh Sahifa
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login" data-testid="link-login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Kirish
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
