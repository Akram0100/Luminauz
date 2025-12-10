import multer from "multer";
import path from "path";
import fs from "fs";
import { isCloudinaryConfigured } from "./cloudinary";

// Lokal upload uchun (fallback)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary mavjud bo'lsa memory storage, aks holda disk storage
const multerStorage = isCloudinaryConfigured()
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    });

export const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
});

export const galleryUpload = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
]);
