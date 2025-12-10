import type { Product, InsertProduct, Order, InsertOrder, TelegramLog, Category } from "@shared/schema";

const API_BASE = "/api";

// Products API
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Mahsulotlarni yuklab bo'lmadi");
  return res.json();
}

export async function getProduct(idOrSlug: number | string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
  if (!res.ok) throw new Error("Mahsulot topilmadi");
  return res.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Qidirishda xatolik");
  return res.json();
}

export async function createProduct(formData: FormData): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Mahsulot qo'shib bo'lmadi");
  }
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Mahsulotni o'chirib bo'lmadi");
}

export async function updateProduct(id: number, formData: FormData): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PATCH",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Mahsulotni yangilab bo'lmadi");
  }
  return res.json();
}

// Flash Sale API
export async function getFlashSales(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/flash-sales`);
  if (!res.ok) throw new Error("Flash sale mahsulotlarni yuklab bo'lmadi");
  return res.json();
}

export async function setFlashSale(productId: number, flashSalePrice: number, hours: number = 24): Promise<{ product: Product; marketing: any }> {
  const res = await fetch(`${API_BASE}/products/${productId}/flash-sale`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flashSalePrice, hours }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Flash sale o'rnatib bo'lmadi");
  }
  return res.json();
}

export async function clearFlashSale(productId: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${productId}/flash-sale`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Flash sale o'chirib bo'lmadi");
  return res.json();
}

// Telegram API
export async function getTelegramLogs(): Promise<TelegramLog[]> {
  const res = await fetch(`${API_BASE}/telegram/logs`, { credentials: "include" });
  if (!res.ok) throw new Error("Telegram loglarni yuklab bo'lmadi");
  return res.json();
}

export async function postToTelegram(productId: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/telegram/post/${productId}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Telegram'ga yuborib bo'lmadi");
  }
  return res.json();
}

export async function getCronStatus(): Promise<{ running: boolean }> {
  const res = await fetch(`${API_BASE}/telegram/cron/status`);
  return res.json();
}

export async function startCron(): Promise<{ success: boolean; running: boolean }> {
  const res = await fetch(`${API_BASE}/telegram/cron/start`, { method: "POST", credentials: "include" });
  return res.json();
}

export async function stopCron(): Promise<{ success: boolean; running: boolean }> {
  const res = await fetch(`${API_BASE}/telegram/cron/stop`, { method: "POST", credentials: "include" });
  return res.json();
}

export async function runCronNow(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/telegram/cron/run-now`, { method: "POST", credentials: "include" });
  return res.json();
}

// Instagram API
export async function getInstagramStatus(): Promise<{ connected: boolean; username?: string; cronRunning: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/instagram/status`, { credentials: "include" });
  return res.json();
}

export async function postToInstagram(productId: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/instagram/post/${productId}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Instagram'ga yuborib bo'lmadi");
  }
  return res.json();
}

export async function getInstagramCronStatus(): Promise<{ running: boolean }> {
  const res = await fetch(`${API_BASE}/instagram/cron/status`);
  return res.json();
}

export async function startInstagramCron(): Promise<{ success: boolean; running: boolean }> {
  const res = await fetch(`${API_BASE}/instagram/cron/start`, { method: "POST", credentials: "include" });
  return res.json();
}

export async function stopInstagramCron(): Promise<{ success: boolean; running: boolean }> {
  const res = await fetch(`${API_BASE}/instagram/cron/stop`, { method: "POST", credentials: "include" });
  return res.json();
}

export async function runInstagramCronNow(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/instagram/cron/run-now`, { method: "POST", credentials: "include" });
  return res.json();
}

export async function generateMarketing(productId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/products/${productId}/marketing`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Marketing yaratib bo'lmadi");
  return res.json();
}

// Orders API
export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders`, { credentials: "include" });
  if (!res.ok) throw new Error("Buyurtmalarni yuklab bo'lmadi");
  return res.json();
}

export async function createOrder(order: InsertOrder, items: Array<{ productId: number; quantity: number; priceAtPurchase: number }>): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order, items }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Buyurtma qo'shib bo'lmadi");
  }
  return res.json();
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Buyurtma holatini o'zgartirib bo'lmadi");
  return res.json();
}

// Auth API
export interface AuthUser {
  id: string;
  username: string;
  isAdmin: boolean;
}

export async function login(username: string, password: string): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Kirish muvaffaqiyatsiz");
  }
  return res.json();
}

export async function register(username: string, password: string): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Ro'yxatdan o'tish muvaffaqiyatsiz");
  }
  return res.json();
}

export async function logout(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Chiqishda xatolik");
  }
  return res.json();
}

export async function getCurrentUser(): Promise<{ user: AuthUser | null }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) {
    return { user: null };
  }
  return res.json();
}

export async function getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/related?limit=${limit}`);
  if (!res.ok) throw new Error("O'xshash mahsulotlarni yuklab bo'lmadi");
  return res.json();
}

export async function advancedSearch(params: {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set("q", params.query);
  if (params.category) searchParams.set("category", params.category);
  if (params.brand) searchParams.set("brand", params.brand);
  if (params.minPrice !== undefined) searchParams.set("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined) searchParams.set("maxPrice", params.maxPrice.toString());
  if (params.tags?.length) searchParams.set("tags", params.tags.join(","));

  const res = await fetch(`${API_BASE}/products/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Qidirishda xatolik");
  return res.json();
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Kategoriyalarni yuklab bo'lmadi");
  return res.json();
}

export async function createCategory(data: { name: string; slug: string; imageUrl?: string }): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Kategoriya qo'shib bo'lmadi");
  }
  return res.json();
}

export async function updateCategory(id: number, data: Partial<{ name: string; slug: string; imageUrl?: string }>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Kategoriya yangilab bo'lmadi");
  }
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Kategoriya o'chirib bo'lmadi");
}

export async function getBrands(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/brands`);
  if (!res.ok) throw new Error("Brendlarni yuklab bo'lmadi");
  return res.json();
}

// Blog API
import type { BlogPost, InsertBlogPost } from "@shared/schema";

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/blog`);
  if (!res.ok) throw new Error("Blog postlarni yuklab bo'lmadi");
  return res.json();
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blog/${slug}`);
  if (!res.ok) throw new Error("Blog post topilmadi");
  return res.json();
}

export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/admin/blog`, { credentials: "include" });
  if (!res.ok) throw new Error("Blog postlarni yuklab bo'lmadi");
  return res.json();
}

export async function createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Blog post yaratib bo'lmadi");
  return res.json();
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blog/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Blog post yangilab bo'lmadi");
  return res.json();
}

export async function deleteBlogPost(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/blog/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Blog post o'chirib bo'lmadi");
}

export async function publishBlogPost(id: number): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blog/${id}/publish`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Blog post nashr qilib bo'lmadi");
  return res.json();
}

export async function generateBlogContent(topic: string, category?: string, keywords?: string[]): Promise<any> {
  const res = await fetch(`${API_BASE}/blog/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, category, keywords }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("AI kontent yaratib bo'lmadi");
  return res.json();
}


