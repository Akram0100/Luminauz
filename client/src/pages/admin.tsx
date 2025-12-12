import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  Upload,
  Loader2,
  CheckCircle,
  Trash2,
  Send,
  Play,
  Pause,
  Clock,
  Flame,
  MessageSquare,
  Zap,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  X,
  Image,
  Video,
  Tag,
  Boxes,
  Edit,
  FolderPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  getTelegramLogs,
  postToTelegram,
  getCronStatus,
  startCron,
  stopCron,
  runCronNow,
  setFlashSale,
  clearFlashSale,
  getInstagramCronStatus,
  startInstagramCron,
  stopInstagramCron,
  runInstagramCronNow,
  getCategories,
  createCategory,
  deleteCategory
} from "@/lib/api";
import type { Product, Order, Category } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

interface ProductSpec {
  label: string;
  value: string;
}

export default function Admin() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [aiData, setAiData] = useState<any>(null);
  const [flashSaleProductId, setFlashSaleProductId] = useState<number | null>(null);
  const [flashSalePrice, setFlashSalePrice] = useState("");
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: telegramLogs = [] } = useQuery({
    queryKey: ["telegram-logs"],
    queryFn: getTelegramLogs,
  });

  const { data: cronStatus } = useQuery({
    queryKey: ["cron-status"],
    queryFn: getCronStatus,
    refetchInterval: 5000,
  });

  const { data: instagramCronStatus } = useQuery({
    queryKey: ["instagram-cron-status"],
    queryFn: getInstagramCronStatus,
    refetchInterval: 5000,
  });

  // Category state and hooks
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Kategoriya yaratildi", description: "Yangi kategoriya qo'shildi." });
      setNewCategoryName("");
      setNewCategorySlug("");
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "O'chirildi", description: "Kategoriya muvaffaqiyatli o'chirildi." });
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Mahsulot Yaratildi", description: "Mahsulot muvaffaqiyatli qo'shildi." });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "O'chirildi", description: "Mahsulot muvaffaqiyatli o'chirildi." });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Yangilandi", description: "Mahsulot muvaffaqiyatli yangilandi." });
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Yangilandi", description: "Buyurtma holati yangilandi." });
    },
  });

  const postToTelegramMutation = useMutation({
    mutationFn: postToTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-logs"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Yuborildi", description: "Mahsulot Telegram kanalga yuborildi." });
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const startCronMutation = useMutation({
    mutationFn: startCron,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-status"] });
      toast({ title: "Boshlandi", description: "Avtomatik post har soatda yuboriladi." });
    },
  });

  const stopCronMutation = useMutation({
    mutationFn: stopCron,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-status"] });
      toast({ title: "To'xtatildi", description: "Avtomatik post to'xtatildi." });
    },
  });

  const runCronNowMutation = useMutation({
    mutationFn: runCronNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-logs"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Ishga tushdi", description: "Qo'lda post yuborildi." });
    },
  });

  // Instagram cron mutations
  const startInstagramCronMutation = useMutation({
    mutationFn: startInstagramCron,
    onSuccess: () => {
      toast({ title: "Instagram boshlandi", description: "Har soatda Instagram'ga post yuboriladi." });
    },
  });

  const stopInstagramCronMutation = useMutation({
    mutationFn: stopInstagramCron,
    onSuccess: () => {
      toast({ title: "Instagram to'xtatildi", description: "Instagram avtomatik post to'xtatildi." });
    },
  });

  const runInstagramNowMutation = useMutation({
    mutationFn: runInstagramCronNow,
    onSuccess: () => {
      toast({ title: "Instagram'ga yuborildi", description: "Mahsulot Instagram'ga joylandi!" });
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const setFlashSaleMutation = useMutation({
    mutationFn: ({ id, price }: { id: number; price: number }) => setFlashSale(id, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      toast({ title: "Flash Sale", description: "Chegirma o'rnatildi." });
      setFlashSaleProductId(null);
      setFlashSalePrice("");
    },
  });

  const clearFlashSaleMutation = useMutation({
    mutationFn: clearFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      toast({ title: "Bekor qilindi", description: "Flash sale bekor qilindi." });
    },
  });

  const resetForm = () => {
    setPreview(null);
    setSelectedFile(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setAiData(null);
    setSpecs([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setIsAnalyzing(true);

        setTimeout(() => {
          setIsAnalyzing(false);
          setAiData({
            title: "AI tomonidan yaratilgan",
            category: "Texnologiya",
            price: 0,
            description: "AI tahlili serverda amalga oshiriladi",
          });
          toast({ title: "Tayyor", description: "Rasm yuklandi. Serverda AI tahlili amalga oshiriladi." });
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setGalleryPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    if (newSpecLabel && newSpecValue) {
      setSpecs(prev => [...prev, { label: newSpecLabel, value: newSpecValue }]);
      setNewSpecLabel("");
      setNewSpecValue("");
    }
  };

  const removeSpec = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({ title: "Xatolik", description: "Iltimos, asosiy rasm yuklang", variant: "destructive" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("image", selectedFile);

    galleryFiles.forEach(file => {
      formData.append("gallery", file);
    });

    if (specs.length > 0) {
      formData.set("specs", JSON.stringify(specs));
    }

    createProductMutation.mutate(formData);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const newOrders = orders.filter(o => o.status === "yangi").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Boshqaruv Paneli</h1>
            <p className="text-muted-foreground">AI va Telegram integratsiyalarini boshqarish</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Jami Mahsulotlar</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {products.filter(p => p.isFlashSale).length} ta aksiyada
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Jami Buyurtmalar</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                  <p className="text-xs text-purple-500 mt-1">
                    {orders.filter(o => o.status === "bajarildi").length} ta bajarilgan
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Jami Daromad</p>
                  <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+12.5% bu oy</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Yangi Buyurtmalar</p>
                  <p className="text-3xl font-bold">{newOrders}</p>
                  {newOrders > 0 && (
                    <p className="text-xs text-orange-500 mt-1 animate-pulse">
                      ⚡ Diqqat talab qiladi
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex gap-2">
            <TabsTrigger value="products" data-testid="tab-products">Mahsulotlar</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Buyurtmalar</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Kategoriyalar</TabsTrigger>
            <TabsTrigger value="telegram" data-testid="tab-telegram">Telegram</TabsTrigger>
            <TabsTrigger value="instagram" data-testid="tab-instagram">Instagram</TabsTrigger>
            <TabsTrigger value="flash-sale" data-testid="tab-flash-sale">Flash Sale</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Yangi Mahsulot Qo'shish</CardTitle>
                    <CardDescription>Rasm yuklang va Gemini AI avtomatik tahlil qiladi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Image className="w-4 h-4" /> Asosiy Rasm *
                          </Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors relative group bg-secondary/20">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handleImageUpload}
                              data-testid="input-product-image"
                            />
                            {preview ? (
                              <div className="relative h-48 w-full">
                                <img src={preview} className="h-full w-full object-contain rounded-lg" alt="Preview" />
                                {isAnalyzing && (
                                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm rounded-lg">
                                    <div className="flex flex-col items-center gap-2">
                                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                      <span className="text-sm font-medium animate-pulse">AI tahlil qilmoqda...</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="py-6">
                                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                                <p className="text-sm text-muted-foreground">Asosiy rasmni yuklang</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Image className="w-4 h-4" /> Gallery (ko'p rasm)
                          </Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-4 bg-secondary/20">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              id="gallery-upload"
                              onChange={handleGalleryUpload}
                              data-testid="input-gallery"
                            />
                            <label htmlFor="gallery-upload" className="cursor-pointer block text-center py-4">
                              <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Qo'shimcha rasmlar qo'shing</p>
                            </label>
                            {galleryPreviews.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mt-4">
                                {galleryPreviews.map((src, idx) => (
                                  <div key={idx} className="relative group/item">
                                    <img src={src} className="w-full h-20 object-cover rounded" alt={`Gallery ${idx}`} />
                                    <button
                                      type="button"
                                      onClick={() => removeGalleryImage(idx)}
                                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Mahsulot Nomi *</Label>
                          <Input id="title" name="title" placeholder="Mahsulot nomini kiriting" data-testid="input-product-title" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Narx ($) *</Label>
                          <Input id="price" name="price" type="number" placeholder="0" data-testid="input-product-price" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Kategoriya *</Label>
                          {showNewCategoryInput ? (
                            <div className="flex gap-2">
                              <Input
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                placeholder="Yangi kategoriya nomi"
                                data-testid="input-new-category"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (newCategoryInput.trim()) {
                                    setSelectedCategory(newCategoryInput.trim());
                                    setShowNewCategoryInput(false);
                                    setNewCategoryInput("");
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setShowNewCategoryInput(false);
                                  setNewCategoryInput("");
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <select
                              id="category"
                              name="category"
                              value={selectedCategory}
                              onChange={(e) => {
                                if (e.target.value === "__new__") {
                                  setShowNewCategoryInput(true);
                                } else {
                                  setSelectedCategory(e.target.value);
                                }
                              }}
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              data-testid="select-category"
                            >
                              <option value="">Kategoriya tanlang</option>
                              {/* Combine categories from both database and products */}
                              {Array.from(new Set([
                                ...categories.map((cat: Category) => cat.name),
                                ...products.map((p: Product) => p.category)
                              ])).filter(Boolean).map((catName: string) => (
                                <option key={catName} value={catName}>
                                  {catName}
                                </option>
                              ))}
                              <option value="__new__" className="text-primary font-medium">
                                ➕ Yangi kategoriya qo'shish
                              </option>
                            </select>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brand" className="flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Brend
                          </Label>
                          <Input id="brand" name="brand" placeholder="Apple, Samsung..." data-testid="input-product-brand" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock" className="flex items-center gap-2">
                            <Boxes className="w-4 h-4" /> Omborda (dona)
                          </Label>
                          <Input id="stock" name="stock" type="number" placeholder="100" data-testid="input-product-stock" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shortDescription">Qisqa Tavsif (200-300 belgi)</Label>
                        <Textarea
                          id="shortDescription"
                          name="shortDescription"
                          placeholder="Mahsulotning qisqa, jozibali tavsifi..."
                          className="min-h-[80px]"
                          maxLength={300}
                          data-testid="input-short-description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Tavsif *</Label>
                        <Textarea id="description" name="description" placeholder="Mahsulot haqida asosiy ma'lumot..." className="min-h-[100px]" data-testid="input-product-description" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullDescription">To'liq Tavsif (SEO uchun)</Label>
                        <Textarea
                          id="fullDescription"
                          name="fullDescription"
                          placeholder="Mahsulotning batafsil tavsifi, texnik ma'lumotlar, foydalanish holatlari va boshqalar..."
                          className="min-h-[150px]"
                          data-testid="input-full-description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoUrl" className="flex items-center gap-2">
                          <Video className="w-4 h-4" /> YouTube Video URL
                        </Label>
                        <Input
                          id="videoUrl"
                          name="videoUrl"
                          placeholder="https://www.youtube.com/watch?v=..."
                          data-testid="input-video-url"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                          <Edit className="w-4 h-4" /> Xususiyatlar (Specifications)
                        </Label>
                        <div className="space-y-3">
                          {specs.map((spec, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                              <span className="font-medium">{spec.label}:</span>
                              <span className="text-muted-foreground">{spec.value}</span>
                              <button
                                type="button"
                                onClick={() => removeSpec(idx)}
                                className="ml-auto text-destructive hover:text-destructive/80"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <div className="flex flex-wrap gap-2">
                            <Input
                              placeholder="Nomi (masalan: Ekran)"
                              value={newSpecLabel}
                              onChange={(e) => setNewSpecLabel(e.target.value)}
                              className="flex-1 min-w-[150px]"
                              data-testid="input-spec-label"
                            />
                            <Input
                              placeholder="Qiymati (masalan: 6.7 inch)"
                              value={newSpecValue}
                              onChange={(e) => setNewSpecValue(e.target.value)}
                              className="flex-1 min-w-[150px]"
                              data-testid="input-spec-value"
                            />
                            <Button type="button" variant="outline" onClick={addSpec} data-testid="button-add-spec">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <Button type="submit" className="w-full" disabled={!selectedFile || createProductMutation.isPending} data-testid="button-create-product">
                        {createProductMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI tahlil qilmoqda va saqlanyapti...</>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-2" /> Mahsulotni Chop Etish</>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Barcha Mahsulotlar ({products.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4 pr-4">
                        {products.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">Hozircha mahsulotlar yo'q</p>
                        ) : (
                          products.map((product: Product) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border" data-testid={`product-item-${product.id}`}>
                              <img src={product.imageUrl} className="w-16 h-16 rounded object-cover" alt={product.title} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{product.title}</div>
                                <div className="text-xs text-muted-foreground">{product.category} {product.brand && `- ${product.brand}`}</div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="font-bold">{formatPrice(product.price)}</span>
                                  {product.stock !== null && product.stock !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      <Boxes className="w-3 h-3 mr-1" /> {product.stock}
                                    </Badge>
                                  )}
                                  {product.isFlashSale && (
                                    <Badge variant="destructive" className="text-xs">
                                      <Flame className="w-3 h-3 mr-1" /> {formatPrice(product.flashSalePrice || 0)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setEditingProduct(product)} data-testid={`button-edit-${product.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => postToTelegramMutation.mutate(product.id)} disabled={postToTelegramMutation.isPending} data-testid={`button-telegram-${product.id}`}>
                                  <Send className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteProductMutation.mutate(product.id)} disabled={deleteProductMutation.isPending} data-testid={`button-delete-${product.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary">Tizim Holati</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ma'lumotlar Bazasi</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">Onlayn</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gemini API</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">Ulangan</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Telegram Bot</span>
                      <Badge variant="outline" className={cronStatus?.running ? "bg-green-500/10 text-green-500 border-green-500/50" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/50"}>
                        {cronStatus?.running ? "Aktiv" : "To'xtagan"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tez Yordam</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>* Asosiy rasm majburiy</p>
                    <p>* Gallery - mahsulot slayderi uchun qo'shimcha rasmlar</p>
                    <p>* Video URL - YouTube link</p>
                    <p>* Xususiyatlar - texnik ma'lumotlar uchun</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Buyurtmalar ({orders.length})</CardTitle>
                <CardDescription>Barcha buyurtmalarni boshqaring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Hozircha buyurtmalar yo'q</p>
                  ) : (
                    orders.map((order: Order) => (
                      <div key={order.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border" data-testid={`order-item-${order.id}`}>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                          #{order.id}
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                          <div className="text-xs text-muted-foreground truncate">{order.customerAddress}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatPrice(order.totalAmount)}</div>
                          <Badge variant={order.status === "bajarildi" ? "default" : order.status === "jarayonda" ? "secondary" : "outline"}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateOrderMutation.mutate({ id: order.id, status: "jarayonda" })} disabled={order.status !== "yangi"}>
                            Jarayonda
                          </Button>
                          <Button size="sm" onClick={() => updateOrderMutation.mutate({ id: order.id, status: "bajarildi" })} disabled={order.status === "bajarildi"}>
                            Bajarildi
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderPlus className="w-5 h-5" /> Kategoriyalar ({categories.length})
                  </CardTitle>
                  <CardDescription>Mahsulot kategoriyalarini boshqaring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {categories.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Hozircha kategoriyalar yo'q</p>
                      ) : (
                        categories.map((category: Category) => (
                          <div key={category.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border" data-testid={`category-item-${category.id}`}>
                            <div className="flex items-center gap-3">
                              {category.imageUrl && (
                                <img src={category.imageUrl} className="w-10 h-10 rounded object-cover" alt={category.name} />
                              )}
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-xs text-muted-foreground">/{category.slug}</div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              disabled={deleteCategoryMutation.isPending}
                              data-testid={`button-delete-category-${category.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Yangi Kategoriya</CardTitle>
                  <CardDescription>Yangi kategoriya qo'shing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Kategoriya Nomi</Label>
                    <Input
                      id="category-name"
                      placeholder="Elektronika"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        // Auto-generate slug
                        setNewCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
                      }}
                      data-testid="input-category-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-slug">Slug (URL)</Label>
                    <Input
                      id="category-slug"
                      placeholder="elektronika"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                      data-testid="input-category-slug"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (newCategoryName && newCategorySlug) {
                        createCategoryMutation.mutate({ name: newCategoryName, slug: newCategorySlug });
                      }
                    }}
                    disabled={!newCategoryName || !newCategorySlug || createCategoryMutation.isPending}
                    data-testid="button-create-category"
                  >
                    {createCategoryMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Qo'shilmoqda...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Kategoriya Qo'shish</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="telegram">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Cron Job Boshqaruvi
                  </CardTitle>
                  <CardDescription>Har soatda avtomatik mahsulot postlash</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">Avtomatik Post</p>
                      <p className="text-sm text-muted-foreground">Har 1 soatda bitta mahsulot</p>
                    </div>
                    <Badge variant={cronStatus?.running ? "default" : "secondary"} className="text-lg px-4 py-1">
                      {cronStatus?.running ? "Ishlayapti" : "To'xtagan"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cronStatus?.running ? (
                      <Button variant="destructive" onClick={() => stopCronMutation.mutate()} disabled={stopCronMutation.isPending} className="flex-1" data-testid="button-stop-cron">
                        <Pause className="w-4 h-4 mr-2" /> To'xtatish
                      </Button>
                    ) : (
                      <Button onClick={() => startCronMutation.mutate()} disabled={startCronMutation.isPending} className="flex-1" data-testid="button-start-cron">
                        <Play className="w-4 h-4 mr-2" /> Boshlash
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => runCronNowMutation.mutate()} disabled={runCronNowMutation.isPending} data-testid="button-run-now">
                      <Zap className="w-4 h-4 mr-2" /> Hozir Ishga Tushirish
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Telegram Loglar
                  </CardTitle>
                  <CardDescription>So'nggi yuborilgan postlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {telegramLogs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Hozircha loglar yo'q</p>
                      ) : (
                        telegramLogs.map((log: any) => (
                          <div key={log.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={log.status === "sent" ? "default" : "destructive"}>{log.status}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("uz-UZ")}</span>
                            </div>
                            <p className="text-sm line-clamp-2">{log.caption}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="instagram">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" /> Instagram Avtomatik Post
                </CardTitle>
                <CardDescription>Har soatda Instagram'ga avtomatik mahsulot joylashtirish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">Instagram Avtomatik Post</p>
                    <p className="text-sm text-muted-foreground">Har 1 soatda bitta mahsulot</p>
                  </div>
                  <Badge variant={instagramCronStatus?.running ? "default" : "secondary"} className="text-lg px-4 py-1">
                    {instagramCronStatus?.running ? "Ishlayapti" : "To'xtagan"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {instagramCronStatus?.running ? (
                    <Button variant="destructive" onClick={() => stopInstagramCronMutation.mutate()} disabled={stopInstagramCronMutation.isPending} className="flex-1">
                      <Pause className="w-4 h-4 mr-2" /> To'xtatish
                    </Button>
                  ) : (
                    <Button onClick={() => startInstagramCronMutation.mutate()} disabled={startInstagramCronMutation.isPending} className="flex-1">
                      <Play className="w-4 h-4 mr-2" /> Boshlash
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => runInstagramNowMutation.mutate()} disabled={runInstagramNowMutation.isPending}>
                    <Zap className="w-4 h-4 mr-2" /> Hozir Instagram'ga Joylashtirish
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <strong>Eslatma:</strong> Instagram API ishlashi uchun hisobingizda 2FA o'chirilgan bo'lishi kerak.
                    Yangi qurilmadan kirganda Instagram tasdiqlashni so'rashi mumkin.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flash-sale">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" /> Flash Sale Boshqaruvi
                </CardTitle>
                <CardDescription>24 soatlik chegirmalarni boshqaring</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {products.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Hozircha mahsulotlar yo'q</p>
                    ) : (
                      products.map((product: Product) => (
                        <div key={product.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border" data-testid={`flash-sale-item-${product.id}`}>
                          <img src={product.imageUrl} className="w-16 h-16 rounded object-cover" alt={product.title} />
                          <div className="flex-1 min-w-[200px]">
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-muted-foreground">Asl narx: {formatPrice(product.price)}</div>
                          </div>

                          {product.isFlashSale ? (
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <Badge variant="destructive" className="mb-1">
                                  <Flame className="w-3 h-3 mr-1" /> {formatPrice(product.flashSalePrice || 0)}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {product.flashSaleEnds && new Date(product.flashSaleEnds).toLocaleString("uz-UZ")}
                                </div>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => clearFlashSaleMutation.mutate(product.id)} data-testid={`button-clear-flash-${product.id}`}>
                                Bekor qilish
                              </Button>
                            </div>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setFlashSaleProductId(product.id)} data-testid={`button-set-flash-${product.id}`}>
                                  <Flame className="w-4 h-4 mr-2" /> Flash Sale
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Flash Sale O'rnatish</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex items-center gap-4">
                                    <img src={product.imageUrl} className="w-20 h-20 rounded object-cover" alt={product.title} />
                                    <div>
                                      <p className="font-medium">{product.title}</p>
                                      <p className="text-sm text-muted-foreground">Asl narx: ${product.price}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Chegirma Narxi ($)</Label>
                                    <Input
                                      type="number"
                                      placeholder="Yangi narx"
                                      value={flashSalePrice}
                                      onChange={(e) => setFlashSalePrice(e.target.value)}
                                      data-testid="input-flash-sale-price"
                                    />
                                  </div>
                                  <Button
                                    className="w-full"
                                    onClick={() => {
                                      if (flashSalePrice) {
                                        setFlashSaleMutation.mutate({ id: product.id, price: parseInt(flashSalePrice) });
                                      }
                                    }}
                                    disabled={!flashSalePrice || setFlashSaleMutation.isPending}
                                    data-testid="button-confirm-flash-sale"
                                  >
                                    <Flame className="w-4 h-4 mr-2" /> Flash Sale Boshlash (24 soat)
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mahsulotni Tahrirlash</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateProductMutation.mutate({ id: editingProduct.id, formData });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Mahsulot Nomi</Label>
                    <Input id="edit-title" name="title" defaultValue={editingProduct.title} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Narx ($)</Label>
                    <Input id="edit-price" name="price" type="number" defaultValue={editingProduct.price} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Kategoriya</Label>
                    <Input id="edit-category" name="category" defaultValue={editingProduct.category} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-brand">Brend</Label>
                    <Input id="edit-brand" name="brand" defaultValue={editingProduct.brand || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">Omborda (dona)</Label>
                    <Input id="edit-stock" name="stock" type="number" defaultValue={editingProduct.stock || 0} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Tavsif</Label>
                  <Textarea id="edit-description" name="description" defaultValue={editingProduct.description} required className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-shortDescription">Qisqa Tavsif</Label>
                  <Textarea id="edit-shortDescription" name="shortDescription" defaultValue={editingProduct.shortDescription || ""} className="min-h-[80px]" maxLength={300} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-videoUrl">YouTube Video URL</Label>
                  <Input id="edit-videoUrl" name="videoUrl" defaultValue={editingProduct.videoUrl || ""} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit" disabled={updateProductMutation.isPending}>
                    {updateProductMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saqlanmoqda...</>
                    ) : (
                      <>Saqlash</>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
