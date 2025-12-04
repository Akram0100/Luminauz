import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, User, Shield } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register, user, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" });

  if (user) {
    return <Redirect to={isAdmin ? "/admin" : "/"} />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast({ title: "Xatolik", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginData.username, loginData.password);
      toast({ title: "Muvaffaqiyatli", description: "Tizimga kirdingiz" });
      setLocation("/admin");
    } catch (error: any) {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.username || !registerData.password) {
      toast({ title: "Xatolik", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: "Xatolik", description: "Parollar mos kelmayapti", variant: "destructive" });
      return;
    }

    if (registerData.password.length < 6) {
      toast({ title: "Xatolik", description: "Parol kamida 6 ta belgidan iborat bo'lishi kerak", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await register(registerData.username, registerData.password);
      toast({ title: "Muvaffaqiyatli", description: "Ro'yxatdan o'tdingiz" });
      setLocation("/");
    } catch (error: any) {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Lumina AI</CardTitle>
            <CardDescription>Admin paneliga kirish yoki ro'yxatdan o'tish</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Kirish</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Ro'yxatdan o'tish</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Foydalanuvchi nomi</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        placeholder="admin"
                        className="pl-10"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        disabled={isSubmitting}
                        data-testid="input-login-username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Parol</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Parolingizni kiriting"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        disabled={isSubmitting}
                        data-testid="input-login-password"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-login">
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Kirilmoqda...</>
                    ) : (
                      "Kirish"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Foydalanuvchi nomi</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-username"
                        placeholder="Foydalanuvchi nomini kiriting"
                        className="pl-10"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        disabled={isSubmitting}
                        data-testid="input-register-username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Parol</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Parol yarating (6+ belgi)"
                        className="pl-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        disabled={isSubmitting}
                        data-testid="input-register-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Parolni tasdiqlang</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Parolni qaytadan kiriting"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        disabled={isSubmitting}
                        data-testid="input-register-confirm"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-register">
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ro'yxatdan o'tilmoqda...</>
                    ) : (
                      "Ro'yxatdan o'tish"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
