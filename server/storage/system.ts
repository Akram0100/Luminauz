import {
    telegramLogs,
    type TelegramLog,
    type InsertTelegramLog
} from "@shared/schema";
import { db } from "../db";
import { desc } from "drizzle-orm";

export class SystemStorage {
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
