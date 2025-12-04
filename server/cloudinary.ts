import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Cloudinary konfiguratsiyasi
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    url: string;
    publicId: string;
}

/**
 * Buffer'dan Cloudinary'ga rasm yuklash
 */
export async function uploadImage(
    buffer: Buffer,
    folder: string = "lumina"
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [
                    { quality: "auto:good" },
                    { fetch_format: "auto" }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
}

/**
 * Cloudinary'dan rasm o'chirish
 */
export async function deleteImage(publicId: string): Promise<boolean> {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return false;
    }
}

/**
 * Cloudinary sozlanganmi tekshirish
 */
export function isCloudinaryConfigured(): boolean {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}
