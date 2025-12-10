import {
    products,
    telegramLogs,
    orderItems,
    type Product,
    type InsertProduct,
    type ProductSearchFilters
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, isNull, sql, and, or } from "drizzle-orm";

export class ProductStorage {
    async getAllProducts(): Promise<Product[]> {
        return await db.select().from(products).orderBy(desc(products.createdAt));
    }

    async getProduct(id: number): Promise<Product | undefined> {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        return product || undefined;
    }

    async getProductBySlug(slug: string): Promise<Product | undefined> {
        const [product] = await db.select().from(products).where(eq(products.slug, slug));
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
        // Avval bog'liq yozuvlarni o'chirish
        await db.delete(telegramLogs).where(eq(telegramLogs.productId, id));
        await db.delete(orderItems).where(eq(orderItems.productId, id));

        const result = await db.delete(products).where(eq(products.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
    }

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

    async getRandomUnpostedInstagramProduct(): Promise<Product | undefined> {
        const [product] = await db
            .select()
            .from(products)
            .where(isNull(products.instagramPostedAt))
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
}
