import { Router } from "express";
import { storage } from "../storage";
import { insertBlogPostSchema } from "@shared/schema";
import { requireAdmin } from "../middleware";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

// Generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Public: Get all published posts
router.get("/blog", async (req, res) => {
    try {
        const posts = await storage.getAllBlogPosts(true);
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Public: Get single post by slug
router.get("/blog/:slug", async (req, res) => {
    try {
        const post = await storage.getBlogPostBySlug(req.params.slug);
        if (!post) return res.status(404).json({ error: "Maqola topilmadi" });

        // Increment view count
        await storage.incrementBlogViewCount(post.id);

        res.json(post);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get all posts (including unpublished)
router.get("/admin/blog", requireAdmin, async (req, res) => {
    try {
        const posts = await storage.getAllBlogPosts(false);
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Create post
router.post("/blog", requireAdmin, async (req, res) => {
    try {
        const data = insertBlogPostSchema.parse({
            ...req.body,
            slug: req.body.slug || generateSlug(req.body.title),
        });
        const post = await storage.createBlogPost(data);
        res.json(post);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: Update post
router.patch("/blog/:id", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const post = await storage.updateBlogPost(id, req.body);
        if (!post) return res.status(404).json({ error: "Maqola topilmadi" });
        res.json(post);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: Delete post
router.delete("/blog/:id", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const success = await storage.deleteBlogPost(id);
        if (!success) return res.status(404).json({ error: "Maqola topilmadi" });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Publish post
router.post("/blog/:id/publish", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const post = await storage.publishBlogPost(id);
        if (!post) return res.status(404).json({ error: "Maqola topilmadi" });
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Unpublish post
router.post("/blog/:id/unpublish", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const post = await storage.unpublishBlogPost(id);
        if (!post) return res.status(404).json({ error: "Maqola topilmadi" });
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Generate AI content
router.post("/blog/generate", requireAdmin, async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: "Gemini API sozlanmagan" });
        }

        const { topic, category, keywords } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Mavzu kiritilmagan" });
        }

        const prompt = `O'zbek tilida professional blog maqola yoz. 

Mavzu: ${topic}
Kategoriya: ${category || "Texnologiya"}
Kalit so'zlar: ${keywords?.join(", ") || topic}

Quyidagi formatda JSON qaytaring:
{
  "title": "SEO-optimallashtirilgan sarlavha (60-70 belgi)",
  "excerpt": "Qisqa tavsif kartalar uchun (150-200 belgi)",
  "content": "To'liq HTML kontent, h2, h3 sarlavhalar, p paragraflar, ul/li ro'yxatlar bilan. Kamida 500 so'z.",
  "metaTitle": "SEO title (60 belgigacha)",
  "metaDescription": "SEO description (160 belgigacha)",
  "tags": ["tag1", "tag2", "tag3"]
}

Faqat JSON qaytaring, boshqa hech narsa yozmang.`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        const text = result.text || "";

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI javob formati noto'g'ri");
        }

        const generatedContent = JSON.parse(jsonMatch[0]);

        res.json({
            ...generatedContent,
            category: category || "Texnologiya",
            aiGenerated: true,
        });
    } catch (error: any) {
        console.error("AI generation error:", error);
        res.status(500).json({ error: error.message || "AI kontent yaratishda xatolik" });
    }
});

export const blogRouter = router;
