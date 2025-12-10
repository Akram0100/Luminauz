import { db } from "../db";
import { categories, type Category, type InsertCategory } from "@shared/schema";
import { eq } from "drizzle-orm";

export class CategoryStorage {
    async getAllCategories(): Promise<Category[]> {
        return db.select().from(categories).orderBy(categories.name);
    }

    async getCategory(id: number): Promise<Category | undefined> {
        const [category] = await db.select().from(categories).where(eq(categories.id, id));
        return category;
    }

    async getCategoryBySlug(slug: string): Promise<Category | undefined> {
        const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
        return category;
    }

    async createCategory(category: InsertCategory): Promise<Category> {
        const [created] = await db.insert(categories).values(category).returning();
        return created;
    }

    async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
        const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
        return updated;
    }

    async deleteCategory(id: number): Promise<boolean> {
        const result = await db.delete(categories).where(eq(categories.id, id)).returning();
        return result.length > 0;
    }
}
