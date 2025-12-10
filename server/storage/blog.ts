import { db } from "../db";
import { blogPosts, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export class BlogStorage {
    async getAllPosts(publishedOnly = true): Promise<BlogPost[]> {
        if (publishedOnly) {
            return db.select().from(blogPosts)
                .where(eq(blogPosts.isPublished, true))
                .orderBy(desc(blogPosts.publishedAt));
        }
        return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    }

    async getPost(id: number): Promise<BlogPost | undefined> {
        const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
        return post;
    }

    async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
        const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
        return post;
    }

    async getPostsByCategory(category: string): Promise<BlogPost[]> {
        return db.select().from(blogPosts)
            .where(and(eq(blogPosts.category, category), eq(blogPosts.isPublished, true)))
            .orderBy(desc(blogPosts.publishedAt));
    }

    async createPost(post: InsertBlogPost): Promise<BlogPost> {
        const [created] = await db.insert(blogPosts).values({
            ...post,
            tags: post.tags || [],
        } as any).returning();
        return created;
    }

    async updatePost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
        const [updated] = await db.update(blogPosts).set(data as any).where(eq(blogPosts.id, id)).returning();
        return updated;
    }

    async deletePost(id: number): Promise<boolean> {
        const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
        return result.length > 0;
    }

    async incrementViewCount(id: number): Promise<void> {
        const post = await this.getPost(id);
        if (post) {
            await db.update(blogPosts)
                .set({ viewCount: post.viewCount + 1 })
                .where(eq(blogPosts.id, id));
        }
    }

    async publishPost(id: number): Promise<BlogPost | undefined> {
        const [updated] = await db.update(blogPosts)
            .set({ isPublished: true, publishedAt: new Date() })
            .where(eq(blogPosts.id, id))
            .returning();
        return updated;
    }

    async unpublishPost(id: number): Promise<BlogPost | undefined> {
        const [updated] = await db.update(blogPosts)
            .set({ isPublished: false })
            .where(eq(blogPosts.id, id))
            .returning();
        return updated;
    }
}
