import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

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

const router = Router();

router.post("/register", async (req, res) => {
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

router.post("/login", async (req, res) => {
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

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Chiqishda xatolik" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true });
    });
});

router.get("/me", (req, res) => {
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

export const authRouter = router;
export { hashPassword, comparePassword };
