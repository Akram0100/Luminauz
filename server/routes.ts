import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertOrderItemSchema, insertUserSchema, type ProductSearchFilters } from "@shared/schema";
import { analyzeProductImage, generateMarketingContent, generateFlashSaleContent } from "./gemini";
import { postProductToTelegram, runHourlyCronJob, startCronJob, stopCronJob, isCronRunning } from "./telegram";
import multer from "multer";
import path from "path";
import fs from "fs";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const galleryUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "gallery", maxCount: 10 }
]);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedBuf);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
  }
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Admin huquqi talab qilinadi" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Foydalanuvchi allaqachon mavjud" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({ username, password: passwordHash });
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      req.session.username = user.username;
      
      res.json({ user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Noto'g'ri login yoki parol" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Noto'g'ri login yoki parol" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      req.session.username = user.username;

      res.json({ user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Chiqishda xatolik" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.userId) {
      res.json({
        user: {
          id: req.session.userId,
          username: req.session.username,
          isAdmin: req.session.isAdmin,
        },
      });
    } else {
      res.json({ user: null });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/search", async (req, res) => {
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

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id/related", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const products = await storage.getRelatedProducts(id, limit);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", requireAdmin, galleryUpload, async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.image || files.image.length === 0) {
        return res.status(400).json({ error: "Rasm yuklanmadi" });
      }

      const mainImage = files.image[0];
      const imagePath = mainImage.path;
      const imageUrl = `/uploads/${mainImage.filename}`;

      const galleryUrls: string[] = [];
      if (files.gallery) {
        for (const file of files.gallery) {
          galleryUrls.push(`/uploads/${file.filename}`);
        }
      }

      let aiData;
      try {
        aiData = await analyzeProductImage(imagePath);
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
      res.json(product);
    } catch (error: any) {
      console.error("Mahsulot yaratish xatosi:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", requireAdmin, galleryUpload, async (req, res) => {
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
      
      if (!product) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      const orderData = insertOrderSchema.parse(order);
      const createdOrder = await storage.createOrder(orderData);
      
      for (const item of items) {
        const itemData = insertOrderItemSchema.parse({
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
        });
        await storage.createOrderItem(itemData);
      }
      
      res.json(createdOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const order = await storage.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ error: "Buyurtma topilmadi" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/flash-sales", async (req, res) => {
    try {
      const products = await storage.getFlashSaleProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products/:id/flash-sale", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { flashSalePrice, hours = 24 } = req.body;
      
      if (!flashSalePrice || flashSalePrice <= 0) {
        return res.status(400).json({ error: "Chegirma narxini kiriting" });
      }

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
      
      if (!product) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }

      res.json({ product, marketing: flashContent });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id/flash-sale", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.clearFlashSale(id);
      
      if (!product) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/telegram/logs", requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getTelegramLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/telegram/post/:productId", requireAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }

      const success = await postProductToTelegram(product);
      
      if (success) {
        res.json({ success: true, message: "Telegram kanalga yuborildi" });
      } else {
        res.status(500).json({ error: "Telegram yuborishda xatolik" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/telegram/cron/start", requireAdmin, async (req, res) => {
    try {
      startCronJob();
      res.json({ success: true, message: "Cron job boshlandi", running: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/telegram/cron/stop", requireAdmin, async (req, res) => {
    try {
      stopCronJob();
      res.json({ success: true, message: "Cron job to'xtatildi", running: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/telegram/cron/status", async (req, res) => {
    res.json({ running: isCronRunning() });
  });

  app.post("/api/telegram/cron/run-now", requireAdmin, async (req, res) => {
    try {
      await runHourlyCronJob();
      res.json({ success: true, message: "Cron job qo'lda ishga tushirildi" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products/:id/marketing", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }

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

  app.get("/api/categories", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const categories = Array.from(new Set(products.map(p => p.category)));
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/brands", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
      res.json(brands);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadDir));

  return httpServer;
}
