import { 
  users, 
  products, 
  orders, 
  orderItems,
  telegramLogs,
  sessions,
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type TelegramLog,
  type InsertTelegramLog,
  type Session,
  type InsertSession,
  type ProductSearchFilters
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, isNull, sql, and, gte, lte, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAdmin(id: string, isAdmin: boolean): Promise<User | undefined>;
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<void>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getLatestProduct(): Promise<Product | undefined>;
  getRandomUnpostedProduct(): Promise<Product | undefined>;
  getFlashSaleProducts(): Promise<Product[]>;
  getRelatedProducts(productId: number, limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  advancedSearchProducts(filters: ProductSearchFilters): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  setFlashSale(id: number, flashSalePrice: number, endsAt: Date, marketingText?: string): Promise<Product | undefined>;
  clearFlashSale(id: number): Promise<Product | undefined>;
  updateProductMarketing(id: number, marketingCopy: string): Promise<Product | undefined>;
  
  // Order methods
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // OrderItem methods
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Telegram methods
  createTelegramLog(log: InsertTelegramLog): Promise<TelegramLog>;
  getTelegramLogs(): Promise<TelegramLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserAdmin(id: string, isAdmin: boolean): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  // Session methods
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateData: any = { ...product };
    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated || undefined;
  }

  // OrderItem methods
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db
      .insert(orderItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Extended Product methods
  async getLatestProduct(): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(1);
    return product || undefined;
  }

  async getRandomUnpostedProduct(): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(isNull(products.telegramPostedAt))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return product || undefined;
  }

  async getFlashSaleProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isFlashSale, true))
      .orderBy(desc(products.createdAt));
  }

  async getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
    const product = await this.getProduct(productId);
    if (!product) return [];

    const relatedProducts = await db
      .select()
      .from(products)
      .where(
        and(
          or(
            eq(products.category, product.category),
            product.brand ? eq(products.brand, product.brand) : sql`false`
          ),
          sql`${products.id} != ${productId}`
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return relatedProducts;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    return allProducts.filter(p => 
      p.title.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery) ||
      (p.brand && p.brand.toLowerCase().includes(lowercaseQuery)) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(lowercaseQuery))
    );
  }

  async advancedSearchProducts(filters: ProductSearchFilters): Promise<Product[]> {
    let allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const typoVariants = this.generateTypoVariants(query);
      
      allProducts = allProducts.filter(p => {
        const searchableText = [
          p.title,
          p.description,
          p.category,
          p.brand,
          p.shortDescription,
          ...(p.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        return typoVariants.some(variant => searchableText.includes(variant)) ||
               this.levenshteinMatch(query, searchableText, 2);
      });
    }
    
    if (filters.category) {
      allProducts = allProducts.filter(p => 
        p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    
    if (filters.brand) {
      allProducts = allProducts.filter(p => 
        p.brand && p.brand.toLowerCase() === filters.brand!.toLowerCase()
      );
    }
    
    if (filters.tags && filters.tags.length > 0) {
      allProducts = allProducts.filter(p => 
        p.tags && filters.tags!.some(tag => 
          p.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
        )
      );
    }
    
    if (filters.minPrice !== undefined) {
      allProducts = allProducts.filter(p => p.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      allProducts = allProducts.filter(p => p.price <= filters.maxPrice!);
    }
    
    return allProducts;
  }

  private generateTypoVariants(query: string): string[] {
    const variants = [query];
    const commonTypos: Record<string, string[]> = {
      'i': ['1', 'l'],
      'o': ['0'],
      'a': ['@'],
      's': ['5', '$'],
      'e': ['3'],
      'ph': ['f'],
      'ck': ['k'],
    };
    
    for (const [char, typos] of Object.entries(commonTypos)) {
      if (query.includes(char)) {
        for (const typo of typos) {
          variants.push(query.replace(char, typo));
        }
      }
    }
    
    return variants;
  }

  private levenshteinMatch(query: string, text: string, maxDistance: number): boolean {
    const words = text.split(/\s+/);
    for (const word of words) {
      if (word.length >= query.length - maxDistance && word.length <= query.length + maxDistance) {
        if (this.levenshteinDistance(query, word) <= maxDistance) {
          return true;
        }
      }
    }
    return false;
  }

  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }

  async setFlashSale(id: number, flashSalePrice: number, endsAt: Date, marketingText?: string): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ 
        isFlashSale: true,
        flashSalePrice: flashSalePrice,
        flashSaleEnds: endsAt,
        flashSaleMarketingText: marketingText || null
      })
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async clearFlashSale(id: number): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ 
        isFlashSale: false,
        flashSalePrice: null,
        flashSaleEnds: null,
        flashSaleMarketingText: null
      })
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async updateProductMarketing(id: number, marketingCopy: string): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ marketingCopy })
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  // Telegram methods
  async createTelegramLog(log: InsertTelegramLog): Promise<TelegramLog> {
    const [newLog] = await db
      .insert(telegramLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getTelegramLogs(): Promise<TelegramLog[]> {
    return await db
      .select()
      .from(telegramLogs)
      .orderBy(desc(telegramLogs.createdAt))
      .limit(50);
  }
}

export const storage = new DatabaseStorage();
