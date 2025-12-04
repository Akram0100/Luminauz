import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, Minus, Plus, Trash2, Loader2, CheckCircle, ArrowLeft, Truck, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

export default function Checkout() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });

  // Promo kod
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  const DELIVERY_COST = 35000;
  const finalTotal = totalPrice - promoDiscount + DELIVERY_COST;

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsCheckingPromo(true);
    setPromoError("");

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, orderAmount: totalPrice }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setPromoDiscount(data.discount);
        setPromoApplied(true);
        toast({
          title: "Promo kod qo'shildi!",
          description: `Sizga ${formatPrice(data.discount)} chegirma berildi`,
        });
      } else {
        setPromoError(data.error || "Promo kod noto'g'ri");
        setPromoDiscount(0);
        setPromoApplied(false);
      }
    } catch {
      setPromoError("Promo kodni tekshirishda xatolik");
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: "Savat bo'sh",
        description: "Iltimos, avval mahsulot qo'shing",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast({
        title: "Ma'lumotlar to'liq emas",
        description: "Iltimos, barcha maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      }));

      await createOrder(
        {
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          totalAmount: finalTotal,
          status: "yangi",
        },
        orderItems
      );

      setOrderComplete(true);
      clearCart();

      toast({
        title: "Buyurtma qabul qilindi!",
        description: "Tez orada siz bilan bog'lanamiz",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Buyurtma Qabul Qilindi!</h1>
            <p className="text-muted-foreground mb-8">
              Rahmat! Sizning buyurtmangiz muvaffaqiyatli qabul qilindi.
              Tez orada operatorlarimiz siz bilan bog'lanadi.
            </p>
            <Button onClick={() => setLocation("/")} className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Bosh Sahifaga Qaytish
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Buyurtma Berish</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Savat bo'sh</h2>
            <p className="text-muted-foreground mb-6">Xarid qilish uchun mahsulot qo'shing</p>
            <Button onClick={() => setLocation("/")} className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Xaridni Boshlash
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Savatdagi Mahsulotlar ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border"
                      data-testid={`cart-item-${item.product.id}`}
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.product.category}</p>
                        <p className="font-bold text-primary">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          data-testid={`button-decrease-${item.product.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.product.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Form */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Buyurtma Ma'lumotlari</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Ismingiz</Label>
                      <Input
                        id="customerName"
                        placeholder="To'liq ismingiz"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        required
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Telefon Raqam</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        placeholder="+998 90 123 45 67"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                        data-testid="input-customer-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Yetkazib Berish Manzili</Label>
                      <Input
                        id="customerAddress"
                        placeholder="To'liq manzilingiz"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        required
                        data-testid="input-customer-address"
                      />
                    </div>

                    <Separator className="my-4" />

                    {/* Minimum Order Warning */}
                    {totalPrice < 400000 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-yellow-600">Minimal buyurtma summasi: {formatPrice(400000)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Yana {formatPrice(400000 - totalPrice)} qo'shing
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Promo Code Input */}
                    <div className="space-y-2">
                      <Label>Promo Kod</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Kod kiriting"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validatePromoCode}
                          disabled={isCheckingPromo || promoApplied || !promoCode}
                        >
                          {isCheckingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : promoApplied ? <CheckCircle className="w-4 h-4 text-green-500" /> : "Qo'llash"}
                        </Button>
                      </div>
                      {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                      {promoApplied && <p className="text-xs text-green-500">Promo kod qabul qilindi!</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mahsulotlar:</span>
                        <span>{items.reduce((sum, i) => sum + i.quantity, 0)} ta</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mahsulotlar narxi:</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>

                      {promoApplied && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Chegirma:</span>
                          <span>-{formatPrice(promoDiscount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yetkazib berish (Toshkent):</span>
                        <span className="text-primary font-medium">{formatPrice(DELIVERY_COST)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Jami to'lov:</span>
                        <span className="text-primary" data-testid="text-total-price">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Truck className="w-4 h-4 text-primary" />
                        <span>1-2 kun ichida yetkazib beramiz</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>+998 99 644 84 44</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>100% sifat kafolati</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className={`w-full rounded-full font-bold ${totalPrice < 400000 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-background'}`}
                      disabled={isSubmitting || totalPrice < 400000}
                      data-testid="button-submit-order"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Buyurtma Yuborilmoqda...
                        </>
                      ) : totalPrice < 400000 ? (
                        <>
                          Minimal summa: {formatPrice(400000)}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" /> Buyurtmani Tasdiqlash
                        </>
                      )}
                    </Button>
                    {totalPrice < 400000 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Buyurtma berish uchun yana {formatPrice(400000 - totalPrice)} qo'shing
                      </p>
                    )}
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
