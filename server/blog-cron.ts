import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

// Blog topic categories
const BLOG_TOPICS = [
    {
        category: "Qadoqlash",
        topics: [
            "Sovg'a qadoqlash uchun 10 ta kreativ g'oya",
            "Bayramga sovg'a qadoqlashning zamonaviy usullari",
            "Ekologik qadoqlash materiallari haqida bilishingiz kerak bo'lgan hamma narsa",
            "To'y sovg'alarini qadoqlashning 15 ta usuli",
            "Bolalar tug'ilgan kuniga qadoqlash g'oyalari",
            "Yangi yil sovg'alarini qadoqlashning eng yaxshi usullari",
            "Ramadan va Ro'za Hayit uchun sovg'a qadoqlash",
            "8 mart uchun sovg'a qadoqlash maslahatlari",
        ]
    },
    {
        category: "Maslahatlari",
        topics: [
            "Do'konda xarid qilishda pulni tejashning 10 ta usuli",
            "Online xarid qilishda xavfsizlik maslahatlari",
            "Bayramga tayyorgarlik: oxirgi daqiqadagi xaridlar",
            "Sovg'a tanlashda eng ko'p qilinadigan xatolar",
            "Ayollar uchun eng yaxshi sovg'a g'oyalari",
            "Erkaklar uchun sovg'a tanlash bo'yicha maslahatlar",
            "Bolalar uchun foydali va o'yinchoqlar",
            "Uy-ro'zg'or buyumlari tanlash maslahatlari",
        ]
    },
    {
        category: "Trendlar",
        topics: [
            "2024-yil uy bezatish trendlari",
            "Bu yilgi eng mashhur sovg'a g'oyalari",
            "Zamonaviy oshxona buyumlari trendlari",
            "Ekologik mahsulotlar popularlik oshmoqda",
            "Minimalistik dizayn trendi",
            "Smart uy jihozlari bozori",
            "Texnologik gadgetlar: eng so'nggi yangiliklar",
        ]
    },
    {
        category: "Bayramlar",
        topics: [
            "Navro'zga tayyorgarlik: xarid ro'yxati",
            "Yangi yil bayramiga 30 kun qoldi: nima qilish kerak",
            "Qurbon Hayitga sovg'a g'oyalari",
            "8 Mart - Xotin-qizlar kuniga sovg'a tayyorlash",
            "Mustaqillik kuniga uy bezatish g'oyalari",
            "O'qituvchilar kuniga sovg'a tanlash",
            "Valentine's Day uchun romantik sovg'alar",
        ]
    },
];

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[''`ʻʼ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100);
}

async function generateBlogPost(topic: string, category: string): Promise<any> {
    if (!genAI) {
        throw new Error("Gemini API sozlanmagan");
    }

    const prompt = `O'zbek tilida professional va foydali blog maqola yoz.

Mavzu: ${topic}
Kategoriya: ${category}

Quyidagi talablarga rioya qil:
1. Sarlavha jozibador va SEO-ga optimallashtirilgan bo'lsin (60-70 belgi)
2. Kontent kamida 800 so'zdan iborat bo'lsin
3. H2, H3 sarlavhalar, paragraflar, ro'yxatlar ishlatilsin
4. Foydali maslahatlar va amaliy tavsiyalar berilsin
5. O'quvchiga qiymat yaratsin

Quyidagi formatda JSON qaytaring:
{
  "title": "SEO-optimallashtirilgan sarlavha",
  "excerpt": "Qisqa tavsif (150-200 belgi)",
  "content": "To'liq HTML kontent h2, h3, p, ul, li bilan",
  "metaTitle": "SEO title (60 belgigacha)",
  "metaDescription": "SEO description (160 belgigacha)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Faqat JSON qaytaring, boshqa hech narsa yozmang.`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const text = result.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("AI javob formati noto'g'ri");
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
        console.error("[BLOG CRON] AI generation error:", error);
        throw error;
    }
}

export async function runDailyBlogCronJob(): Promise<void> {
    console.log("[BLOG CRON] Starting daily blog generation job...");

    if (!genAI) {
        console.error("[BLOG CRON] Gemini API key not configured");
        return;
    }

    const postsToGenerate = 5;
    let successCount = 0;

    // Select random topics from different categories
    const selectedTopics: { topic: string; category: string }[] = [];
    const shuffledCategories = [...BLOG_TOPICS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < postsToGenerate; i++) {
        const categoryData = shuffledCategories[i % shuffledCategories.length];
        const randomTopic = categoryData.topics[Math.floor(Math.random() * categoryData.topics.length)];
        selectedTopics.push({ topic: randomTopic, category: categoryData.category });
    }

    for (const { topic, category } of selectedTopics) {
        try {
            console.log(`[BLOG CRON] Generating post: "${topic}"`);

            const generatedContent = await generateBlogPost(topic, category);

            // Check if slug already exists
            const slug = generateSlug(generatedContent.title);
            const existingPost = await storage.getBlogPostBySlug(slug);

            if (existingPost) {
                console.log(`[BLOG CRON] Post with slug "${slug}" already exists, skipping...`);
                continue;
            }

            // Create blog post
            const post = await storage.createBlogPost({
                title: generatedContent.title,
                slug: slug + '-' + Date.now(),
                excerpt: generatedContent.excerpt,
                content: generatedContent.content,
                category: category,
                author: "Lumina AI",
                imageUrl: `https://picsum.photos/seed/${Date.now()}/800/400`,
                tags: generatedContent.tags || [],
                metaTitle: generatedContent.metaTitle,
                metaDescription: generatedContent.metaDescription,
                isPublished: true,
                publishedAt: new Date(),
            });

            // Publish immediately
            await storage.publishBlogPost(post.id);

            successCount++;
            console.log(`[BLOG CRON] Successfully created post: "${post.title}" (ID: ${post.id})`);

            // Wait between posts to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error: any) {
            console.error(`[BLOG CRON] Failed to generate post for "${topic}":`, error.message);
        }
    }

    console.log(`[BLOG CRON] Daily job completed. Created ${successCount}/${postsToGenerate} posts.`);
}

// Generate a single blog post (for distributed cron jobs throughout the day)
export async function runSingleBlogPost(): Promise<{ success: boolean; post?: any; error?: string }> {
    console.log("[BLOG CRON] Generating single blog post...");

    if (!genAI) {
        console.error("[BLOG CRON] Gemini API key not configured");
        return { success: false, error: "Gemini API sozlanmagan" };
    }

    try {
        // Select random category and topic
        const randomCategory = BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];
        const randomTopic = randomCategory.topics[Math.floor(Math.random() * randomCategory.topics.length)];

        console.log(`[BLOG CRON] Generating post: "${randomTopic}" (${randomCategory.category})`);

        const generatedContent = await generateBlogPost(randomTopic, randomCategory.category);

        // Create unique slug
        const slug = generateSlug(generatedContent.title) + '-' + Date.now();

        // Create blog post
        const post = await storage.createBlogPost({
            title: generatedContent.title,
            slug: slug,
            excerpt: generatedContent.excerpt,
            content: generatedContent.content,
            category: randomCategory.category,
            author: "Lumina AI",
            imageUrl: `https://picsum.photos/seed/${Date.now()}/800/400`,
            tags: generatedContent.tags || [],
            metaTitle: generatedContent.metaTitle,
            metaDescription: generatedContent.metaDescription,
            isPublished: true,
            publishedAt: new Date(),
        });

        // Publish immediately
        await storage.publishBlogPost(post.id);

        console.log(`[BLOG CRON] Successfully created post: "${post.title}" (ID: ${post.id})`);

        return {
            success: true,
            post: { id: post.id, title: post.title, slug: post.slug, category: post.category }
        };

    } catch (error: any) {
        console.error(`[BLOG CRON] Failed to generate post:`, error.message);
        return { success: false, error: error.message };
    }
}

// Cron job state
let blogCronInterval: NodeJS.Timeout | null = null;
let isBlogCronRunning = false;

export function startBlogCron(): void {
    if (blogCronInterval) {
        console.log("[BLOG CRON] Already running");
        return;
    }

    // Run every 24 hours (86400000 ms)
    const INTERVAL = 24 * 60 * 60 * 1000;

    blogCronInterval = setInterval(runDailyBlogCronJob, INTERVAL);
    isBlogCronRunning = true;
    console.log("[BLOG CRON] Started. Will run every 24 hours.");
}

export function stopBlogCron(): void {
    if (blogCronInterval) {
        clearInterval(blogCronInterval);
        blogCronInterval = null;
        isBlogCronRunning = false;
        console.log("[BLOG CRON] Stopped");
    }
}

export function getBlogCronStatus(): { running: boolean } {
    return { running: isBlogCronRunning };
}

