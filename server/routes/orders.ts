import { Router } from "express";
import { storage } from "../storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { requireAdmin } from "../middleware";

const router = Router();

router.get("/orders", requireAdmin, async (req, res) => {
    try {
        const orders = await storage.getAllOrders();
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/orders", async (req, res) => {
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

router.patch("/orders/:id/status", requireAdmin, async (req, res) => {
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

router.get("/customer/orders", async (req, res) => {
    try {
        if (!req.session.customerId) {
            return res.status(401).json({ error: "Kirish talab qilinadi" });
        }

        const orders = await storage.getCustomerOrders(req.session.customerId);
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Promo Code API
router.post("/promo/validate", async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Promo kod kiritilmadi" });
        }

        const promo = await storage.getPromoCodeByCode(code.toUpperCase());

        if (!promo) {
            return res.status(404).json({ error: "Noto'g'ri promo kod" });
        }

        if (!promo.isActive) {
            return res.status(400).json({ error: "Promo kod faol emas" });
        }

        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return res.status(400).json({ error: "Promo kod muddati tugagan" });
        }

        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ error: "Promo kod limit tugagan" });
        }

        if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
            return res.status(400).json({
                error: `Minimal buyurtma: ${promo.minOrderAmount.toLocaleString()} so'm`
            });
        }

        let discount = 0;
        if (promo.discountPercent) {
            discount = Math.round(orderAmount * promo.discountPercent / 100);
        } else if (promo.discountAmount) {
            discount = promo.discountAmount;
        }

        res.json({
            valid: true,
            code: promo.code,
            discount,
            discountPercent: promo.discountPercent,
            discountAmount: promo.discountAmount,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Promo kodlarni boshqarish
router.get("/promo", requireAdmin, async (req, res) => {
    try {
        const codes = await storage.getAllPromoCodes();
        res.json(codes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/promo", requireAdmin, async (req, res) => {
    try {
        const promoData = {
            ...req.body,
            code: req.body.code.toUpperCase(),
        };
        const promo = await storage.createPromoCode(promoData);
        res.json(promo);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/promo/:id", requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await storage.deletePromoCode(id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const orderRouter = router;
