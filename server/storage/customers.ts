import {
    customers,
    orders,
    type Customer,
    type InsertCustomer,
    type Order
} from "@shared/schema";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

export class CustomerStorage {
    async getCustomer(id: number): Promise<Customer | undefined> {
        const [customer] = await db.select().from(customers).where(eq(customers.id, id));
        return customer || undefined;
    }

    async getCustomerByEmail(email: string): Promise<Customer | undefined> {
        const [customer] = await db.select().from(customers).where(eq(customers.email, email));
        return customer || undefined;
    }

    async createCustomer(customer: InsertCustomer): Promise<Customer> {
        const [newCustomer] = await db.insert(customers).values(customer as any).returning();
        return newCustomer;
    }

    async getCustomerOrders(customerId: number): Promise<Order[]> {
        // TODO: orders tablega customerId qo'shish kerak agar hali yo'q bo'lsa
        // Hozirda schema bo'yicha bog'liqlikni tekshiramiz.
        // Agar orders tableda customerId bo'lmasa, bu method hozircha barcha buyurtmalarni qaytaradi (eski kod shunday edi)
        return await db.select().from(orders).orderBy(desc(orders.createdAt));
    }
}
