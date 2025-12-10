import { Router } from "express";
import { storage } from "../storage";
import { insertCategorySchema } from "@shared/schema";
import { requireAdmin } from "../middleware";

const router = Router();

// Public: Get all categories
router.get("/categories", async (req, res) => {
    try {
        const categories = await storage.getAllCategories();
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Create category
router.post("/categories", requireAdmin, async (req, res) => {
    try {
        const data = insertCategorySchema.parse(req.body);
        const category = await storage.createCategory(data);
        res.json(category);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: Update category
router.patch("/categories/:id", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;
        const category = await storage.updateCategory(id, updates);
        if (!category) return res.status(404).json({ error: "Kategoriya topilmadi" });
        res.json(category);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Admin: Delete category
router.delete("/categories/:id", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const success = await storage.deleteCategory(id);
        if (!success) return res.status(404).json({ error: "Kategoriya topilmadi" });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const categoryRouter = router;
