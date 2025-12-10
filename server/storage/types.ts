import type {
    User, InsertUser,
    Session, InsertSession,
    Product, InsertProduct, ProductSearchFilters,
    Order, InsertOrder,
    OrderItem, InsertOrderItem,
    TelegramLog, InsertTelegramLog,
    PromoCode, InsertPromoCode,
    Customer, InsertCustomer
} from "@shared/schema";

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
    getProductBySlug(slug: string): Promise<Product | undefined>;
    getLatestProduct(): Promise<Product | undefined>;
    getRandomUnpostedProduct(): Promise<Product | undefined>;
    getRandomUnpostedInstagramProduct(): Promise<Product | undefined>;
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

    // PromoCode methods
    getAllPromoCodes(): Promise<PromoCode[]>;
    getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
    createPromoCode(promo: InsertPromoCode): Promise<PromoCode>;
    deletePromoCode(id: number): Promise<boolean>;
    incrementPromoUsage(id: number): Promise<void>;

    // Customer methods
    getCustomer(id: number): Promise<Customer | undefined>;
    getCustomerByEmail(email: string): Promise<Customer | undefined>;
    createCustomer(customer: InsertCustomer): Promise<Customer>;
    getCustomerOrders(customerId: number): Promise<Order[]>;
}
