import { Router } from "express";
import { requireAdmin } from "../middleware";
import {
    startBlogCron,
    stopBlogCron,
    getBlogCronStatus,
    runDailyBlogCronJob
} from "../blog-cron";

const router = Router();

// Get cron status
router.get("/status", requireAdmin, (req, res) => {
    res.json(getBlogCronStatus());
});

// Start cron
router.post("/start", requireAdmin, (req, res) => {
    startBlogCron();
    res.json({ message: "Blog cron boshlandi", ...getBlogCronStatus() });
});

// Stop cron
router.post("/stop", requireAdmin, (req, res) => {
    stopBlogCron();
    res.json({ message: "Blog cron to'xtatildi", ...getBlogCronStatus() });
});

// Run now (manually trigger)
router.post("/run-now", requireAdmin, async (req, res) => {
    try {
        // Run in background
        runDailyBlogCronJob().catch(err => {
            console.error("[BLOG CRON] Manual run error:", err);
        });

        res.json({
            message: "Blog yaratish boshlandi. 5 ta maqola yaratiladi (3-5 daqiqa)",
            ...getBlogCronStatus()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const blogCronRouter = router;
