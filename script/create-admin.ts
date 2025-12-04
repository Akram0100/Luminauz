import "dotenv/config";
import { storage } from "../server/storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function main() {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username) {
        console.error("Iltimos, username ni kiriting!");
        console.error("Foydalanish: npx tsx script/create-admin.ts <username> [password]");
        process.exit(1);
    }

    console.log(`Foydalanuvchi qidirilmoqda: ${username}...`);
    let user = await storage.getUserByUsername(username);

    if (!user) {
        if (!password) {
            console.error(`Xatolik: '${username}' foydalanuvchisi topilmadi.`);
            console.error("Foydalanuvchi yaratish uchun parolni ham kiriting.");
            process.exit(1);
        }

        console.log(`Foydalanuvchi topilmadi. Yangi admin yaratilmoqda...`);
        const passwordHash = await hashPassword(password);
        user = await storage.createUser({ username, password: passwordHash });
    }

    if (user.isAdmin) {
        console.log(`'${username}' allaqachon admin.`);
        process.exit(0);
    }

    console.log(`'${username}' admin qilinmoqda...`);
    await storage.updateUserAdmin(user.id, true);

    console.log(`Muvaffaqiyatli! '${username}' endi admin huquqiga ega.`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Xatolik yuz berdi:", err);
    process.exit(1);
});
