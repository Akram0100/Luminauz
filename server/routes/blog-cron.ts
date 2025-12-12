import { Router } from "express";
import { requireAdmin } from "../middleware";
import {
    startBlogCron,
    stopBlogCron,
    getBlogCronStatus,
    runDailyBlogCronJob,
    runSingleBlogPost
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

// Run single post (for distributed cron - call 5 times at different hours)
// Returns immediately, generates post in background (for 30s timeout limit)
router.post("/run-single", (req, res) => {
    // Return immediately
    res.json({
        message: "Blog yaratish boshlandi. 1 ta maqola orqa fonda yaratilmoqda...",
        status: "started",
        timestamp: new Date().toISOString()
    });

    // Run in background
    runSingleBlogPost()
        .then(result => {
            if (result.success) {
                console.log(`[BLOG CRON] Background post created: ${result.post?.title}`);
            } else {
                console.error(`[BLOG CRON] Background post failed: ${result.error}`);
            }
        })
        .catch(err => {
            console.error("[BLOG CRON] Background post error:", err);
        });
});

export const blogCronRouter = router;
