import { IgApiClient } from "instagram-private-api";
import { storage } from "./storage";
import { generateMarketingContent } from "./gemini";
import type { Product } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || "";
const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD || "";

let igClient: IgApiClient | null = null;
let isLoggedIn = false;

// Instagram client'ni yaratish va login qilish
async function getInstagramClient(): Promise<IgApiClient | null> {
    if (!INSTAGRAM_USERNAME || !INSTAGRAM_PASSWORD) {
        console.error("[Instagram] Credentials not configured");
        return null;
    }

    if (igClient && isLoggedIn) {
        return igClient;
    }

    try {
        igClient = new IgApiClient();
        igClient.state.generateDevice(INSTAGRAM_USERNAME);

        console.log("[Instagram] Logging in...");
        await igClient.account.login(INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD);
        isLoggedIn = true;
        console.log("[Instagram] Login successful!");

        return igClient;
    } catch (error: any) {
        console.error("[Instagram] Login error:", error.message);
        isLoggedIn = false;
        igClient = null;
        return null;
    }
}

// Rasmni URL dan yuklab olish
async function downloadImage(imageUrl: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const protocol = imageUrl.startsWith("https") ? https : http;

        protocol.get(imageUrl, (response) => {
            // Redirect bo'lsa
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    downloadImage(redirectUrl).then(resolve).catch(reject);
                    return;
                }
            }

            const chunks: Buffer[] = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks)));
            response.on("error", reject);
        }).on("error", reject);
    });
}

// To'liq rasm URL'ni olish
function getFullImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
    }
    const domain = process.env.RENDER_EXTERNAL_URL || "https://luminauz.onrender.com";
    return `${domain}${imageUrl}`;
}

// Instagram caption formatlash
function formatInstagramCaption(
    product: Product,
    marketing: { headline: string; salesText: string; cta: string; offers: string[]; hashtags: string[] }
): string {
    const baseUrl = "luminauz.onrender.com";
    const priceFormatted = product.price.toLocaleString('uz-UZ');

    return `${marketing.headline}

${product.description}

💰 Narxi: ${priceFormatted} so'm
📦 Ulgurji narxlarda!

🛒 Buyurtma: ${baseUrl}
📞 Aloqa: +998 99 644 84 44

${marketing.hashtags.slice(0, 5).join(" ")} #luminauz #ulgurji #arzonnarx`;
}


// Mahsulotni Instagramga post qilish
export async function postProductToInstagram(product: Product): Promise<boolean> {
    try {
        const client = await getInstagramClient();
        if (!client) {
            console.error("[Instagram] Could not get client");
            return false;
        }

        // Marketing content yaratish
        const marketing = await generateMarketingContent({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
        });

        // Caption yaratish
        const caption = formatInstagramCaption(product, marketing);

        // Rasmni yuklab olish
        const imageUrl = getFullImageUrl(product.imageUrl);
        console.log("[Instagram] Downloading image:", imageUrl);
        const imageBuffer = await downloadImage(imageUrl);

        // Instagramga post qilish
        console.log("[Instagram] Uploading to Instagram...");
        const publishResult = await client.publish.photo({
            file: imageBuffer,
            caption: caption,
        });

        console.log(`[Instagram] Product ${product.id} posted successfully!`);

        // Product'ni yangilash
        await storage.updateProduct(product.id, { instagramPostedAt: new Date() } as any);

        return true;
    } catch (error: any) {
        console.error("[Instagram] Error posting:", error.message);
        return false;
    }
}

// Cron job uchun
export async function runInstagramCronJob(): Promise<void> {
    console.log("[Instagram CRON] Starting hourly Instagram post job...");

    try {
        const product = await storage.getRandomUnpostedInstagramProduct();

        if (!product) {
            const latestProduct = await storage.getLatestProduct();
            if (latestProduct) {
                await postProductToInstagram(latestProduct);
            } else {
                console.log("[Instagram CRON] No products available to post");
            }
        } else {
            await postProductToInstagram(product);
        }
    } catch (error) {
        console.error("[Instagram CRON] Error in hourly job:", error);
    }
}

let instagramCronInterval: ReturnType<typeof setInterval> | null = null;

export function startInstagramCron(): void {
    if (instagramCronInterval) {
        console.log("[Instagram CRON] Cron job already running");
        return;
    }

    console.log("[Instagram CRON] Starting hourly cron job...");

    // Har soatda bir marta
    instagramCronInterval = setInterval(async () => {
        await runInstagramCronJob();
    }, 60 * 60 * 1000);

    console.log("[Instagram CRON] Cron job started - will post every hour");
}

export function stopInstagramCron(): void {
    if (instagramCronInterval) {
        clearInterval(instagramCronInterval);
        instagramCronInterval = null;
        console.log("[Instagram CRON] Cron job stopped");
    }
}

export function isInstagramCronRunning(): boolean {
    return instagramCronInterval !== null;
}

// Instagram login holatini tekshirish
export async function checkInstagramConnection(): Promise<{ connected: boolean; username?: string; error?: string }> {
    try {
        const client = await getInstagramClient();
        if (client) {
            return { connected: true, username: INSTAGRAM_USERNAME };
        }
        return { connected: false, error: "Could not connect to Instagram" };
    } catch (error: any) {
        return { connected: false, error: error.message };
    }
}
