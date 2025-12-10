import type { Express } from "express";
import express from "express";
import { type Server } from "http";
import path from "path";

import { authRouter } from "./auth";
import { productRouter } from "./products";
import { orderRouter } from "./orders";
import { telegramRouter } from "./telegram";
import { instagramRouter } from "./instagram";
import { categoryRouter } from "./categories";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Static uploads folder
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(path.join(process.cwd(), "uploads")));

  // API Routers
  app.use("/api/auth", authRouter);
  app.use("/api", productRouter); // /api/products, /api/brands etc.
  app.use("/api", orderRouter);   // /api/orders, /api/promo etc.
  app.use("/api", categoryRouter); // /api/categories

  app.use("/api/telegram", telegramRouter);
  app.use("/api/instagram", instagramRouter);

  return httpServer;
}

