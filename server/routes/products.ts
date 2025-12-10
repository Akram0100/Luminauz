import { Router } from "express";
import { storage } from "../storage";
import { insertProductSchema, type ProductSearchFilters } from "@shared/schema";
import { analyzeProductImage, generateMarketingContent, generateFlashSaleContent } from "../gemini";
import { uploadImage, isCloudinaryConfigured } from "../cloudinary";
import { requireAdmin, requireAuth } from "../middleware";
import { generateSlug } from "../utils";
import { galleryUpload } from "../multer";

const router = Router();

// --- Public Data Routes ---

router.get("/flash-sales", async (req, res) => {
    try {
        const products = await storage.getFlashSaleProducts();
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const products = await storage.getAllProducts();
        const categories = Array.from(new Set(products.map(p => p.category)));
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/brands", async (req, res) => {
    try {
        const products = await storage.getAllProducts();
        const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
        res.json(brands);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- Product CRUD & Search ---

router.get("/products", async (req, res) => {
    try {
        const products = await storage.getAllProducts();
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/products/search", async (req, res) => {
    try {
        const query = req.query.q as string || "";
        const category = req.query.category as string | undefined;
        const brand = req.query.brand as string | undefined;
        const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
        const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
        const tags = req.query.tags ? (req.query.tags as string).split(",") : undefined;

        const filters: ProductSearchFilters = {
            query,
            category,
            brand,
            minPrice,
            maxPrice,
            tags,
        };

        const products = await storage.advancedSearchProducts(filters);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/products/:idOrSlug", async (req, res) => {
    try {
        const param = req.params.idOrSlug;
        let product;

        if (/^\d+$/.test(param)) {
            product = await storage.getProduct(parseInt(param));
        } else {
            product = await storage.getProductBySlug(param);
            if (!product) {
                const idMatch = param.match(/-(\d+)$/);
                if (idMatch) {
                    product = await storage.getProduct(parseInt(idMatch[1]));
                }
            }
        }

        if (!product) {
            return res.status(404).json({ error: "Mahsulot topilmadi" });
        }

        res.json(product);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/products/:id/related", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
        const products = await storage.getRelatedProducts(id, limit);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/products", requireAdmin, galleryUpload, async (req, res) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files.image || files.image.length === 0) {
            return res.status(400).json({ error: "Rasm yuklanmadi" });
        }

        const mainImage = files.image[0];
        let imageUrl: string;
        let imagePath: string | null = null;

        if (isCloudinaryConfigured() && mainImage.buffer) {
            const result = await uploadImage(mainImage.buffer, "lumina/products");
            imageUrl = result.url;
        } else {
            imagePath = mainImage.path;
            imageUrl = `/uploads/${mainImage.filename}`;
        }

        const galleryUrls: string[] = [];
        if (files.gallery) {
            for (const file of files.gallery) {
                if (isCloudinaryConfigured() && file.buffer) {
                    const result = await uploadImage(file.buffer, "lumina/gallery");
                    galleryUrls.push(result.url);
                } else {
                    galleryUrls.push(`/uploads/${file.filename}`);
                }
            }
        }

        const imageForAI = imagePath || imageUrl;
        let aiData;
        try {
            aiData = await analyzeProductImage(imageForAI);
        } catch (aiError) {
            console.error("AI tahlil xatosi:", aiError);
            aiData = {
                title: "Yangi Mahsulot",
                category: "Umumiy",
                price: 100,
                description: "AI tahlili muvaffaqiyatsiz bo'ldi. Iltimos, qo'lda to'ldiring.",
                sentiment: "Neytral (50%)",
                keywords: ["mahsulot", "yangi"],
                prediction: "Ma'lumot yo'q",
            };
        }

        const specs = req.body.specs ? JSON.parse(req.body.specs) : [];

        const productData = insertProductSchema.parse({
            title: req.body.title || aiData.title,
            price: req.body.price ? parseInt(req.body.price) : aiData.price,
            description: req.body.description || aiData.description,
            shortDescription: req.body.shortDescription || null,
            fullDescription: req.body.fullDescription || null,
            imageUrl,
            gallery: galleryUrls,
            videoUrl: req.body.videoUrl || null,
            category: req.body.category || aiData.category,
            brand: req.body.brand || null,
            stock: req.body.stock ? parseInt(req.body.stock) : 0,
            tags: aiData.keywords || [],
            specs,
            aiAnalysis: {
                sentiment: aiData.sentiment,
                keywords: aiData.keywords,
                prediction: aiData.prediction,
                sellingPoints: aiData.sellingPoints || [],
                useCases: aiData.useCases || [],
                priceJustification: aiData.priceJustification || "",
                seoTitle: aiData.seoTitle || "",
                seoDescription: aiData.seoDescription || "",
            },
        });

        const product = await storage.createProduct(productData);
        const slug = generateSlug(product.title, product.id);
        const updatedProduct = await storage.updateProduct(product.id, { slug } as any);

        res.json(updatedProduct || product);
    } catch (error: any) {
        console.error("Mahsulot yaratish xatosi:", error);
        res.status(400).json({ error: error.message });
    }
});

router.patch("/products/:id", requireAdmin, galleryUpload, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const updates: any = {};

        if (req.body.title) updates.title = req.body.title;
        if (req.body.price) updates.price = parseInt(req.body.price);
        if (req.body.description) updates.description = req.body.description;
        if (req.body.shortDescription !== undefined) updates.shortDescription = req.body.shortDescription;
        if (req.body.fullDescription !== undefined) updates.fullDescription = req.body.fullDescription;
        if (req.body.videoUrl !== undefined) updates.videoUrl = req.body.videoUrl;
        if (req.body.category) updates.category = req.body.category;
        if (req.body.brand !== undefined) updates.brand = req.body.brand;
        if (req.body.stock) updates.stock = parseInt(req.body.stock);
        if (req.body.specs) updates.specs = JSON.parse(req.body.specs);
        if (req.body.tags) updates.tags = JSON.parse(req.body.tags);

        if (files?.image && files.image.length > 0) {
            updates.imageUrl = `/uploads/${files.image[0].filename}`;
        }

        if (files?.gallery && files.gallery.length > 0) {
            const existingProduct = await storage.getProduct(id);
            const existingGallery = existingProduct?.gallery || [];
            const newGalleryUrls = files.gallery.map(f => `/uploads/${f.filename}`);
            updates.gallery = [...existingGallery, ...newGalleryUrls];
        }

        if (req.body.gallery) {
            updates.gallery = JSON.parse(req.body.gallery);
        }

        const product = await storage.updateProduct(id, updates);
        if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });

        res.json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const success = await storage.deleteProduct(id);
        if (!success) return res.status(404).json({ error: "Mahsulot topilmadi" });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/products/:id/flash-sale", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { flashSalePrice, hours = 24 } = req.body;
        if (!flashSalePrice || flashSalePrice <= 0) return res.status(400).json({ error: "Chegirma narxini kiriting" });

        const endsAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        let flashContent = null;
        let marketingText: string | undefined = undefined;
        try {
            const existingProduct = await storage.getProduct(id);
            if (existingProduct) {
                flashContent = await generateFlashSaleContent({
                    title: existingProduct.title,
                    price: existingProduct.price,
                    flashSalePrice: flashSalePrice,
                });
                marketingText = `${flashContent.headline}\n\n${flashContent.urgencyText}\n\n${flashContent.countdown}`;
            }
        } catch (e) {
            console.error("Flash sale marketing xatosi:", e);
        }

        const product = await storage.setFlashSale(id, flashSalePrice, endsAt, marketingText);
        if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });

        res.json({ product, marketing: flashContent });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/products/:id/flash-sale", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const product = await storage.clearFlashSale(id);
        if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });
        res.json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/products/:id/marketing", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const product = await storage.getProduct(id);
        if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });

        const marketing = await generateMarketingContent({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
        });

        await storage.updateProductMarketing(id, marketing.variantA);
        res.json(marketing);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const productRouter = router;
