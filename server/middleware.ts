import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
    }
    next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
    }
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: "Admin huquqi talab qilinadi" });
    }
    next();
}
