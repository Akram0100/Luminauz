import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Loader2, User, Mail, Phone, MapPin, Package, LogOut, ShoppingBag, Clock, CheckCircle, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CustomerProfile {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    address: string | null;
}

interface Order {
    id: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export default function Profile() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        fetchProfile();
        fetchOrders();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch("/api/customer/profile");
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            } else {
                setLocation("/customer-login");
            }
        } catch {
            setLocation("/customer-login");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/customer/orders");
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch {
            console.error("Buyurtmalarni yuklashda xatolik");
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/customer/logout", { method: "POST" });
            toast({
                title: "Chiqildi",
                description: "Muvaffaqiyatli chiqildi",
            });
            setLocation("/");
        } catch {
            toast({
                title: "Xatolik",
                description: "Chiqishda xatolik",
                variant: "destructive",
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "yangi":
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case "jarayonda":
                return <Truck className="w-4 h-4 text-blue-500" />;
            case "bajarildi":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Package className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "yangi":
                return "Yangi";
            case "jarayonda":
                return "Jarayonda";
            case "bajarildi":
                return "Bajarildi";
            default:
                return status;
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Mening Profilim</h1>
                    <Button variant="outline" onClick={handleLogout} className="rounded-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Chiqish
                    </Button>
                </div>

                {/* Profile Info */}
                <Card className="border-primary/20 mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Shaxsiy Ma'lumotlar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                                <User className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Ism</p>
                                    <p className="font-medium">{profile.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                                <Mail className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium">{profile.email}</p>
                                </div>
                            </div>
                            {profile.phone && (
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                                    <Phone className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Telefon</p>
                                        <p className="font-medium">{profile.phone}</p>
                                    </div>
                                </div>
                            )}
                            {profile.address && (
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Manzil</p>
                                        <p className="font-medium">{profile.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Orders */}
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            Buyurtmalar Tarixi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">Hali buyurtmalar yo'q</p>
                                <Link href="/">
                                    <Button className="mt-4 rounded-full">
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Xarid qilish
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Buyurtma #{order.id}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleDateString("uz-UZ", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                                            <div className="flex items-center gap-1 justify-end mt-1">
                                                {getStatusIcon(order.status)}
                                                <span className="text-sm">{getStatusText(order.status)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
