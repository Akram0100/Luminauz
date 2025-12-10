import {
    users,
    sessions,
    type User,
    type InsertUser,
    type Session,
    type InsertSession
} from "@shared/schema";
import { db } from "../db";
import { eq, lte } from "drizzle-orm";

export class UserStorage {
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
}
