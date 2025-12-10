import { Router } from "express";
import { storage } from "../storage";
import { postProductToInstagram, runInstagramCronJob, startInstagramCron, stopInstagramCron, isInstagramCronRunning, checkInstagramConnection } from "../instagram";
import { requireAdmin } from "../middleware";

const router = Router();

router.get("/status", requireAdmin, async (req, res) => {
    try {
        const status = await checkInstagramConnection();
        res.json({ ...status, cronRunning: isInstagramCronRunning() });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/post/:productId", requireAdmin, async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const product = await storage.getProduct(productId);

        if (!product) {
            return res.status(404).json({ error: "Mahsulot topilmadi" });
        }

        const success = await postProductToInstagram(product);

        if (success) {
            res.json({ success: true, message: "Instagram'ga muvaffaqiyatli joylandi!" });
        } else {
            res.status(500).json({ error: "Instagram'ga joylab bo'lmadi" });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/cron/start", requireAdmin, async (req, res) => {
    try {
        startInstagramCron();
        res.json({ success: true, message: "Instagram cron job boshlandi", running: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/cron/stop", requireAdmin, async (req, res) => {
    try {
        stopInstagramCron();
        res.json({ success: true, message: "Instagram cron job to'xtatildi", running: false });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/cron/status", async (req, res) => {
    res.json({ running: isInstagramCronRunning() });
});

router.post("/cron/run-now", requireAdmin, async (req, res) => {
    try {
        await runInstagramCronJob();
        res.json({ success: true, message: "Instagram cron job qo'lda ishga tushirildi" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const instagramRouter = router;
