import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Product Specifications Type
export const productSpecSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type ProductSpec = z.infer<typeof productSpecSchema>;

// Product Table with extended fields
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  imageUrl: text("image_url").notNull(),
  gallery: json("gallery").$type<string[]>().default([]),
  videoUrl: text("video_url"),
  category: text("category").notNull(),
  brand: text("brand"),
  stock: integer("stock").default(0),
  tags: json("tags").$type<string[]>().default([]).notNull(),
  specs: json("specs").$type<ProductSpec[]>().default([]),
  aiAnalysis: json("ai_analysis").$type<{
    sentiment: string;
    keywords: string[];
    prediction: string;
    sellingPoints: string[];
    useCases: string[];
    priceJustification: string;
    seoTitle: string;
    seoDescription: string;
  }>(),
  marketingCopy: text("marketing_copy"),
  isFlashSale: boolean("is_flash_sale").default(false).notNull(),
  flashSalePrice: integer("flash_sale_price"),
  flashSaleEnds: timestamp("flash_sale_ends"),
  flashSaleMarketingText: text("flash_sale_marketing_text"),
  telegramPostedAt: timestamp("telegram_posted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Telegram Post Log Table
export const telegramLogs = pgTable("telegram_logs", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  messageId: text("message_id"),
  caption: text("caption").notNull(),
  marketingVariantA: text("marketing_variant_a"),
  marketingVariantB: text("marketing_variant_b"),
  shortDescription: text("short_description"),
  videoUrl: text("video_url"),
  specsHighlights: json("specs_highlights").$type<string[]>().default([]),
  isCarousel: boolean("is_carousel").default(false),
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTelegramLogSchema = createInsertSchema(telegramLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertTelegramLog = z.infer<typeof insertTelegramLogSchema>;
export type TelegramLog = typeof telegramLogs.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// User Session Table for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Order Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("yangi"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// OrderItem Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: integer("price_at_purchase").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Search filters type
export interface ProductSearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
}
