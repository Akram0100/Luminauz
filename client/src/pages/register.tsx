import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Loader2, UserPlus, Mail, Lock, User, Phone, MapPin } from "lucide-react";

export default function Register() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Xatolik",
                description: "Parollar mos kelmayapti",
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Xatolik",
                description: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/customer/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone || null,
                    address: formData.address || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Muvaffaqiyatli!",
                    description: "Ro'yxatdan o'tdingiz",
                });
                setLocation("/profile");
            } else {
                toast({
                    title: "Xatolik",
                    description: data.error || "Ro'yxatdan o'tishda xatolik",
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
                            <UserPlus className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Ro'yxatdan O'tish</CardTitle>
                        <p className="text-muted-foreground text-sm mt-2">
                            Yangi akkaunt yarating
                        </p>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ismingiz *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="To'liq ismingiz"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
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
                                <Label htmlFor="password">Parol *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Kamida 6 ta belgi"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Parolni tasdiqlang *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Parolni qayta kiriting"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon (ixtiyoriy)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+998 90 123 45 67"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Manzil (ixtiyoriy)</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        placeholder="To'liq manzilingiz"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="pl-10"
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
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Ro'yxatdan O'tish
                                    </>
                                )}
                            </Button>
                            <p className="text-sm text-muted-foreground text-center">
                                Allaqachon akkountingiz bormi?{" "}
                                <Link href="/customer-login" className="text-primary hover:underline">
                                    Kirish
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </Layout>
    );
}
