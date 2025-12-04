import { db } from "../server/db";
import { products, users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const existingAdmin = await db.select().from(users).limit(1);
  if (existingAdmin.length === 0) {
    const passwordHash = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: passwordHash,
      isAdmin: true,
    });
    console.log("Admin user created: admin / admin123");
  }

  // Add sample products
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length === 0) {
    const sampleProducts = [
      {
        title: "iPhone 15 Pro Max",
        price: 15990000,
        description: "Apple iPhone 15 Pro Max - eng yangi va zamonaviy smartfon. A17 Pro chip bilan jihozlangan, 48MP asosiy kamera, titanium korpus.",
        shortDescription: "A17 Pro chip, 256GB xotira",
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
        category: "Smartfonlar",
        brand: "Apple",
        stock: 50,
        tags: ["smartphone", "apple", "iphone", "premium"],
      },
      {
        title: "Samsung Galaxy S24 Ultra",
        price: 13990000,
        description: "Samsung Galaxy S24 Ultra - AI quvvatlangan zamonaviy smartfon. Galaxy AI funksiyalari, S Pen bilan birga keladi.",
        shortDescription: "Snapdragon 8 Gen 3, 512GB",
        imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
        category: "Smartfonlar",
        brand: "Samsung",
        stock: 35,
        tags: ["smartphone", "samsung", "galaxy", "ai"],
      },
      {
        title: "MacBook Pro 14 M3",
        price: 29990000,
        description: "Apple MacBook Pro 14 M3 chip bilan - professional noutbuk. Liquid Retina XDR displey, 18 soatgacha batareya.",
        shortDescription: "M3 Pro chip, 18GB RAM, 512GB SSD",
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        category: "Noutbuklar",
        brand: "Apple",
        stock: 20,
        tags: ["laptop", "apple", "macbook", "professional"],
      },
      {
        title: "AirPods Pro 2",
        price: 3290000,
        description: "Apple AirPods Pro 2 - eng yaxshi simsiz quloqchinlar. Active Noise Cancellation, Transparency mode, USB-C zaryadlash.",
        shortDescription: "Active Noise Cancellation, USB-C",
        imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500",
        category: "Aksessuarlar",
        brand: "Apple",
        stock: 100,
        tags: ["earphones", "apple", "airpods", "wireless"],
      },
      {
        title: "PlayStation 5",
        price: 7990000,
        description: "Sony PlayStation 5 - yangi avlod oyun konsoli. Ultra-tez SSD, ray tracing, DualSense controller bilan.",
        shortDescription: "825GB SSD, DualSense controller",
        imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500",
        category: "Oyinlar",
        brand: "Sony",
        stock: 15,
        tags: ["gaming", "playstation", "sony", "console"],
      },
      {
        title: "Apple Watch Ultra 2",
        price: 11990000,
        description: "Apple Watch Ultra 2 - eng kuchli va chidamli Apple soati. Titanium korpus, 72 soat batareya, GPS + Cellular.",
        shortDescription: "Titanium, 49mm, GPS + Cellular",
        imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500",
        category: "Soatlar",
        brand: "Apple",
        stock: 25,
        tags: ["smartwatch", "apple", "watch", "fitness"],
      },
      {
        title: "iPad Pro 12.9 M2",
        price: 16990000,
        description: "Apple iPad Pro 12.9 M2 chip bilan - eng kuchli planshet. Liquid Retina XDR, ProMotion texnologiyasi.",
        shortDescription: "M2 chip, 256GB, Wi-Fi + Cellular",
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
        category: "Planshetlar",
        brand: "Apple",
        stock: 30,
        tags: ["tablet", "apple", "ipad", "professional"],
      },
      {
        title: "Sony WH-1000XM5",
        price: 4990000,
        description: "Sony WH-1000XM5 - dunyo bo'ylab eng yaxshi noise-cancelling quloqchinlar. 30 soat batareya, multipoint ulanish.",
        shortDescription: "Industry-leading noise cancellation",
        imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
        category: "Aksessuarlar",
        brand: "Sony",
        stock: 45,
        tags: ["headphones", "sony", "wireless", "noise-cancelling"],
      },
    ];

    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }
    console.log(`${sampleProducts.length} sample products added`);
  } else {
    console.log("Products already exist, skipping...");
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
