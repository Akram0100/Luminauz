import { Router } from "express";
import { storage } from "../storage";
import { chatWithStoreAssistant, type ChatHistory } from "../gemini";

const router = Router();

router.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Xabar matni talab qilinadi" });
        }

        // Barcha mahsulotlarni olish
        const products = await storage.getAllProducts();

        // AI bilan suhbat
        const response = await chatWithStoreAssistant(message, history || [], products);

        res.json({ response });
    } catch (error: any) {
        console.error("Chat API error:", error);
        res.status(500).json({ error: "Server xatosi" });
    }
});

export const chatRouter = router;
