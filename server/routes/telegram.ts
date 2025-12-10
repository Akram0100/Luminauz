import { Router } from "express";
import { storage } from "../storage";
import { postProductToTelegram, runHourlyCronJob, startCronJob, stopCronJob, isCronRunning } from "../telegram";
import { requireAdmin } from "../middleware";

const router = Router();

router.get("/logs", requireAdmin, async (req, res) => {
    try {
        const logs = await storage.getTelegramLogs();
        res.json(logs);
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

router.post("/cron/start", requireAdmin, async (req, res) => {
    try {
        startCronJob();
        res.json({ success: true, message: "Cron job boshlandi", running: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/cron/stop", requireAdmin, async (req, res) => {
    try {
        stopCronJob();
        res.json({ success: true, message: "Cron job to'xtatildi", running: false });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/cron/status", async (req, res) => {
    res.json({ running: isCronRunning() });
});

router.post("/cron/run-now", requireAdmin, async (req, res) => {
    try {
        await runHourlyCronJob();
        res.json({ success: true, message: "Cron job qo'lda ishga tushirildi" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const telegramRouter = router;
