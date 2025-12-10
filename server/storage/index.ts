import { IStorage } from "./types";
import { UserStorage } from "./users";
import { ProductStorage } from "./products";
import { OrderStorage } from "./orders";
import { CustomerStorage } from "./customers";
import { SystemStorage } from "./system";
import { CategoryStorage } from "./categories";
import { BlogStorage } from "./blog";
import type {
    User, InsertUser,
    Session, InsertSession,
    Product, InsertProduct, ProductSearchFilters,
    Order, InsertOrder,
    OrderItem, InsertOrderItem,
    TelegramLog, InsertTelegramLog,
    PromoCode, InsertPromoCode,
    Customer, InsertCustomer,
    Category, InsertCategory,
    BlogPost, InsertBlogPost
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
    private users = new UserStorage();
    private products = new ProductStorage();
    private orders = new OrderStorage();
    private customers = new CustomerStorage();
    private system = new SystemStorage();
    private categoriesStorage = new CategoryStorage();
    private blogStorage = new BlogStorage();


    // User methods
    getUser(id: string): Promise<User | undefined> { return this.users.getUser(id); }
    getUserByUsername(username: string): Promise<User | undefined> { return this.users.getUserByUsername(username); }
    createUser(user: InsertUser): Promise<User> { return this.users.createUser(user); }
    updateUserAdmin(id: string, isAdmin: boolean): Promise<User | undefined> { return this.users.updateUserAdmin(id, isAdmin); }

    // Session methods
    createSession(session: InsertSession): Promise<Session> { return this.users.createSession(session); }
    getSession(id: string): Promise<Session | undefined> { return this.users.getSession(id); }
    deleteSession(id: string): Promise<boolean> { return this.users.deleteSession(id); }
    deleteExpiredSessions(): Promise<void> { return this.users.deleteExpiredSessions(); }

    // Product methods
    getAllProducts(): Promise<Product[]> { return this.products.getAllProducts(); }
    getProduct(id: number): Promise<Product | undefined> { return this.products.getProduct(id); }
    getProductBySlug(slug: string): Promise<Product | undefined> { return this.products.getProductBySlug(slug); }
    getLatestProduct(): Promise<Product | undefined> { return this.products.getLatestProduct(); }
    getRandomUnpostedProduct(): Promise<Product | undefined> { return this.products.getRandomUnpostedProduct(); }
    getRandomUnpostedInstagramProduct(): Promise<Product | undefined> { return this.products.getRandomUnpostedInstagramProduct(); }
    getFlashSaleProducts(): Promise<Product[]> { return this.products.getFlashSaleProducts(); }
    getRelatedProducts(productId: number, limit?: number): Promise<Product[]> { return this.products.getRelatedProducts(productId, limit); }
    searchProducts(query: string): Promise<Product[]> { return this.products.searchProducts(query); }
    advancedSearchProducts(filters: ProductSearchFilters): Promise<Product[]> { return this.products.advancedSearchProducts(filters); }
    createProduct(product: InsertProduct): Promise<Product> { return this.products.createProduct(product); }
    updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> { return this.products.updateProduct(id, product); }
    deleteProduct(id: number): Promise<boolean> { return this.products.deleteProduct(id); }
    setFlashSale(id: number, flashSalePrice: number, endsAt: Date, marketingText?: string): Promise<Product | undefined> { return this.products.setFlashSale(id, flashSalePrice, endsAt, marketingText); }
    clearFlashSale(id: number): Promise<Product | undefined> { return this.products.clearFlashSale(id); }
    updateProductMarketing(id: number, marketingCopy: string): Promise<Product | undefined> { return this.products.updateProductMarketing(id, marketingCopy); }

    // Order methods
    getAllOrders(): Promise<Order[]> { return this.orders.getAllOrders(); }
    getOrder(id: number): Promise<Order | undefined> { return this.orders.getOrder(id); }
    createOrder(order: InsertOrder): Promise<Order> { return this.orders.createOrder(order); }
    updateOrderStatus(id: number, status: string): Promise<Order | undefined> { return this.orders.updateOrderStatus(id, status); }

    // OrderItem methods
    createOrderItem(item: InsertOrderItem): Promise<OrderItem> { return this.orders.createOrderItem(item); }
    getOrderItems(orderId: number): Promise<OrderItem[]> { return this.orders.getOrderItems(orderId); }

    // Telegram methods
    createTelegramLog(log: InsertTelegramLog): Promise<TelegramLog> { return this.system.createTelegramLog(log); }
    getTelegramLogs(): Promise<TelegramLog[]> { return this.system.getTelegramLogs(); }

    // PromoCode methods
    getAllPromoCodes(): Promise<PromoCode[]> { return this.orders.getAllPromoCodes(); }
    getPromoCodeByCode(code: string): Promise<PromoCode | undefined> { return this.orders.getPromoCodeByCode(code); }
    createPromoCode(promo: InsertPromoCode): Promise<PromoCode> { return this.orders.createPromoCode(promo); }
    deletePromoCode(id: number): Promise<boolean> { return this.orders.deletePromoCode(id); }
    incrementPromoUsage(id: number): Promise<void> { return this.orders.incrementPromoUsage(id); }

    // Customer methods
    getCustomer(id: number): Promise<Customer | undefined> { return this.customers.getCustomer(id); }
    getCustomerByEmail(email: string): Promise<Customer | undefined> { return this.customers.getCustomerByEmail(email); }
    createCustomer(customer: InsertCustomer): Promise<Customer> { return this.customers.createCustomer(customer); }
    getCustomerOrders(customerId: number): Promise<Order[]> { return this.customers.getCustomerOrders(customerId); }

    // Category methods
    getAllCategories(): Promise<Category[]> { return this.categoriesStorage.getAllCategories(); }
    getCategory(id: number): Promise<Category | undefined> { return this.categoriesStorage.getCategory(id); }
    getCategoryBySlug(slug: string): Promise<Category | undefined> { return this.categoriesStorage.getCategoryBySlug(slug); }
    createCategory(category: InsertCategory): Promise<Category> { return this.categoriesStorage.createCategory(category); }
    updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> { return this.categoriesStorage.updateCategory(id, data); }
    deleteCategory(id: number): Promise<boolean> { return this.categoriesStorage.deleteCategory(id); }

    // Blog methods
    getAllBlogPosts(publishedOnly = true): Promise<BlogPost[]> { return this.blogStorage.getAllPosts(publishedOnly); }
    getBlogPost(id: number): Promise<BlogPost | undefined> { return this.blogStorage.getPost(id); }
    getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> { return this.blogStorage.getPostBySlug(slug); }
    createBlogPost(post: InsertBlogPost): Promise<BlogPost> { return this.blogStorage.createPost(post); }
    updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> { return this.blogStorage.updatePost(id, data); }
    deleteBlogPost(id: number): Promise<boolean> { return this.blogStorage.deletePost(id); }
    incrementBlogViewCount(id: number): Promise<void> { return this.blogStorage.incrementViewCount(id); }
    publishBlogPost(id: number): Promise<BlogPost | undefined> { return this.blogStorage.publishPost(id); }
    unpublishBlogPost(id: number): Promise<BlogPost | undefined> { return this.blogStorage.unpublishPost(id); }
}

export const storage = new DatabaseStorage();
export * from "./types";


