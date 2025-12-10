import {
    orders,
    orderItems,
    promoCodes,
    type Order,
    type InsertOrder,
    type OrderItem,
    type InsertOrderItem,
    type PromoCode,
    type InsertPromoCode
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";

export class OrderStorage {
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

    // PromoCode methods
    async getAllPromoCodes(): Promise<PromoCode[]> {
        return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
    }

    async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
        const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code));
        return promo || undefined;
    }

    async createPromoCode(promo: InsertPromoCode): Promise<PromoCode> {
        const [newPromo] = await db.insert(promoCodes).values(promo as any).returning();
        return newPromo;
    }

    async deletePromoCode(id: number): Promise<boolean> {
        const result = await db.delete(promoCodes).where(eq(promoCodes.id, id));
        return true;
    }

    async incrementPromoUsage(id: number): Promise<void> {
        await db.update(promoCodes)
            .set({ usedCount: sql`${promoCodes.usedCount} + 1` })
            .where(eq(promoCodes.id, id));
    }
}
