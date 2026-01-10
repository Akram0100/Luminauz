import { storage } from "./storage";
import { generateMarketingContent } from "./gemini";
import type { Product, InsertTelegramLog } from "@shared/schema";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string
): Promise<TelegramResponse> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.log("Telegram credentials not configured");
    return { ok: false, description: "Telegram credentials not configured" };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          photo: photoUrl,
          caption: caption,
          parse_mode: "HTML",
        }),
      }
    );

    const data: TelegramResponse = await response.json();
    console.log("Telegram API response:", data);
    return data;
  } catch (error) {
    console.error("Telegram API error:", error);
    return { ok: false, description: String(error) };
  }
}

export async function postProductToTelegram(product: Product): Promise<boolean> {
  try {
    const marketing = await generateMarketingContent({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
    });

    const caption = formatTelegramCaption(product, marketing);

    const fullImageUrl = getFullImageUrl(product.imageUrl);

    const result = await sendTelegramPhoto(fullImageUrl, caption);

    if (result.ok) {
      const logEntry: InsertTelegramLog = {
        productId: product.id,
        messageId: result.result?.message_id?.toString(),
        caption: caption,
        marketingVariantA: marketing.variantA,
        marketingVariantB: marketing.variantB,
        status: "sent",
      };

      await storage.createTelegramLog(logEntry);
      await storage.updateProduct(product.id, {
        telegramPostedAt: new Date()
      } as any);

      console.log(`Product ${product.id} posted to Telegram successfully`);
      return true;
    } else {
      console.error("Failed to post to Telegram:", result.description);

      await storage.createTelegramLog({
        productId: product.id,
        caption: caption,
        status: "failed",
      });

      return false;
    }
  } catch (error) {
    console.error("Error posting to Telegram:", error);
    return false;
  }
}

function formatTelegramCaption(
  product: Product,
  marketing: { headline: string; salesText: string; cta: string; offers: string[]; hashtags: string[] }
): string {
  const baseUrl = "https://lumina-uz.onrender.com";
  const productUrl = `${baseUrl}/product/${product.id}`;

  const priceFormatted = product.price.toLocaleString('uz-UZ');
  const brandText = product.brand ? `\n🏷 Brend: ${product.brand}` : "";

  return `${marketing.headline}
${brandText}

${product.description}

💰 <b>${priceFormatted} so'm</b>
📦 Ulgurji narxlarda!

${marketing.hashtags.slice(0, 5).join(" ")}

🛒 <a href="${productUrl}">Sotib Olish</a>
📞 Aloqa: +998 99 644 84 44
🌐 <a href="${baseUrl}">lumina-uz.onrender.com</a>`;
}


function getFullImageUrl(imageUrl: string): string {
  // Agar Cloudinary URL bo'lsa, to'g'ridan-to'g'ri qaytarish
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Render domain yoki custom domain
  const domain = process.env.RENDER_EXTERNAL_URL || "https://lumina-uz.onrender.com";
  return `${domain}${imageUrl}`;
}

export async function runHourlyCronJob(): Promise<void> {
  console.log("[CRON] Starting hourly Telegram post job...");

  try {
    const product = await storage.getRandomUnpostedProduct();

    if (!product) {
      console.log("[CRON] No unposted products found. Looking for the one posted longest ago...");
      const recycledProduct = await storage.getRandomProductPostedLongestAgo();

      if (recycledProduct) {
        console.log(`[CRON] Found recycled product: ${recycledProduct.id} (${recycledProduct.title})`);
        await postProductToTelegram(recycledProduct);
      } else {
        console.log("[CRON] No products available to post at all");
      }
    } else {
      await postProductToTelegram(product);
    }
  } catch (error) {
    console.error("[CRON] Error in hourly job:", error);
  }
}

let cronInterval: ReturnType<typeof setInterval> | null = null;

export function startCronJob(): void {
  if (cronInterval) {
    console.log("[CRON] Cron job already running");
    return;
  }

  console.log("[CRON] Starting hourly cron job...");

  cronInterval = setInterval(async () => {
    await runHourlyCronJob();
  }, 60 * 60 * 1000);

  console.log("[CRON] Cron job started - will post every hour");
}

export function stopCronJob(): void {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("[CRON] Cron job stopped");
  }
}

export function isCronRunning(): boolean {
  return cronInterval !== null;
}
