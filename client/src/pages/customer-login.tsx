import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Loader2, LogIn, Mail, Lock } from "lucide-react";

export default function CustomerLogin() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/customer/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Xush kelibsiz!",
                    description: `Salom, ${data.name}`,
                });
                setLocation("/profile");
            } else {
                toast({
                    title: "Xatolik",
                    description: data.error || "Email yoki parol noto'g'ri",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Xatolik",
                description: "Server bilan bog'lanishda xatolik",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-md border-primary/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                            <LogIn className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Kirish</CardTitle>
                        <p className="text-muted-foreground text-sm mt-2">
                            Akkountingizga kiring
                        </p>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Parol</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Parolingiz"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full rounded-full bg-primary text-background font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Yuklanmoqda...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Kirish
                                    </>
                                )}
                            </Button>
                            <p className="text-sm text-muted-foreground text-center">
                                Akkountingiz yo'qmi?{" "}
                                <Link href="/register" className="text-primary hover:underline">
                                    Ro'yxatdan o'tish
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </Layout>
    );
}
