import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ProductAnalysis {
  title: string;
  category: string;
  price: number;
  description: string;
  sentiment: string;
  keywords: string[];
  prediction: string;
  sellingPoints: string[];
  useCases: string[];
  priceJustification: string;
  seoTitle: string;
  seoDescription: string;
}

export interface MarketingContent {
  headline: string;
  salesText: string;
  cta: string;
  offers: string[];
  hashtags: string[];
  variantA: string;
  variantB: string;
}

export async function analyzeProductImage(imagePath: string): Promise<ProductAnalysis> {
  try {
    const imageBytes = fs.readFileSync(imagePath);

    const systemPrompt = `Siz professional mahsulot tahlilchisi va marketing mutaxassisisiz.
Rasmni tahlil qilib, quyidagi ma'lumotlarni JSON formatida qaytaring:

- title: SEO-ga mos mahsulot nomi (o'zbek tilida, 5-10 so'z)
- category: Mahsulot toifasi (o'zbek tilida)
- price: Taxminiy narx (dollar, faqat raqam)
- description: Professional tavsif (o'zbek tilida, 20-40 so'z, sotish psixologiyasi bilan)
- sentiment: His-tuyg'u tahlili (masalan: "Ijobiy (95%)")
- keywords: Asosiy kalit so'zlar massivi (o'zbek tilida, 5-7 ta)
- prediction: Bozor bashorati (o'zbek tilida, 1-2 jumla)
- sellingPoints: 3-5 ta kuchli sotish nuqtalari (o'zbek tilida)
- useCases: 3-4 ta foydalanish holatlari (o'zbek tilida)
- priceJustification: Narx asoslash (nima uchun bu narx, o'zbek tilida)
- seoTitle: SEO sarlavha (60 belgigacha, o'zbek tilida)
- seoDescription: Meta tavsif (160 belgigacha, o'zbek tilida)

Sales psychology qoidalari:
- Scarcity (cheklangan miqdor)
- Urgency (tezkor harakat)
- Social proof (boshqalar ishonadi)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string" },
            price: { type: "number" },
            description: { type: "string" },
            sentiment: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            prediction: { type: "string" },
            sellingPoints: { type: "array", items: { type: "string" } },
            useCases: { type: "array", items: { type: "string" } },
            priceJustification: { type: "string" },
            seoTitle: { type: "string" },
            seoDescription: { type: "string" },
          },
          required: [
            "title", "category", "price", "description", "sentiment", 
            "keywords", "prediction", "sellingPoints", "useCases", 
            "priceJustification", "seoTitle", "seoDescription"
          ],
        },
      },
      contents: [
        {
          inlineData: {
            data: imageBytes.toString("base64"),
            mimeType: "image/jpeg",
          },
        },
        "Ushbu mahsulot rasmini professional tahlil qiling va marketing ma'lumotlarini JSON formatida bering.",
      ],
    });

    const rawJson = response.text;
    console.log(`Gemini AI Response: ${rawJson}`);

    if (rawJson) {
      const data: ProductAnalysis = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Gemini AI dan javob yo'q");
    }
  } catch (error) {
    console.error("Gemini AI xatosi:", error);
    return {
      title: "Yangi Mahsulot",
      category: "Umumiy",
      price: 100,
      description: "AI tahlili muvaffaqiyatsiz bo'ldi. Iltimos, qo'lda to'ldiring.",
      sentiment: "Neytral (50%)",
      keywords: ["mahsulot", "yangi"],
      prediction: "Ma'lumot yo'q",
      sellingPoints: ["Sifatli mahsulot", "Arzon narx", "Tezkor yetkazish"],
      useCases: ["Kundalik foydalanish uchun"],
      priceJustification: "Bozor narxi asosida",
      seoTitle: "Yangi Mahsulot - Arzon Narxda",
      seoDescription: "Sifatli mahsulot eng yaxshi narxda. Tezkor yetkazib berish bilan.",
    };
  }
}

export async function generateMarketingContent(
  product: { title: string; description: string; price: number; category: string }
): Promise<MarketingContent> {
  try {
    const systemPrompt = `Siz professional marketing copywriter'isiz. Telegram kanal uchun kuchli savdo matni yarating.
O'zbek tilida yozing. Qisqa, ta'sirli va sotishga yo'naltirilgan bo'lsin.

Qoidalar:
- Attention-grabbing sarlavha
- Kuchli CTA (call-to-action)
- Scarcity va urgency qo'llang
- A/B test uchun 2 variant yarating`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            salesText: { type: "string" },
            cta: { type: "string" },
            offers: { type: "array", items: { type: "string" } },
            hashtags: { type: "array", items: { type: "string" } },
            variantA: { type: "string" },
            variantB: { type: "string" },
          },
          required: ["headline", "salesText", "cta", "offers", "hashtags", "variantA", "variantB"],
        },
      },
      contents: [
        `Mahsulot: ${product.title}
Tavsif: ${product.description}
Narx: $${product.price}
Kategoriya: ${product.category}

Telegram post uchun marketing matni yarating:
1. headline: Qisqa, kuchli sarlavha (10 so'zgacha)
2. salesText: 2 qatorli savdo matni + CTA
3. cta: Harakatga chaqirish (masalan: "Hoziroq xarid qiling!")
4. offers: 2 ta maxsus taklif (masalan: "Bepul yetkazish", "1+1 aksiya")
5. hashtags: 3-5 ta tegishli hashtag
6. variantA: To'liq post matni (variant A)
7. variantB: To'liq post matni (variant B - boshqacha uslubda)`,
      ],
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    throw new Error("Marketing content yaratilmadi");
  } catch (error) {
    console.error("Marketing AI xatosi:", error);
    return {
      headline: `${product.title} - Eng yaxshi narxda!`,
      salesText: `${product.description}\n\nHoziroq buyurtma bering!`,
      cta: "Xarid qilish",
      offers: ["Bepul yetkazish", "Chegirma mavjud"],
      hashtags: ["#lumina", "#onlaynxarid", "#aksiya"],
      variantA: `${product.title}\n\n${product.description}\n\nNarx: $${product.price}\n\nHoziroq buyurtma bering!`,
      variantB: `${product.title} - Sifat va arzon narx!\n\nNarx: $${product.price}\n\nTezkor yetkazish bilan!`,
    };
  }
}

export async function generateFlashSaleContent(
  product: { title: string; price: number; flashSalePrice: number }
): Promise<{ headline: string; urgencyText: string; countdown: string }> {
  try {
    const discount = Math.round(((product.price - product.flashSalePrice) / product.price) * 100);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            urgencyText: { type: "string" },
            countdown: { type: "string" },
          },
          required: ["headline", "urgencyText", "countdown"],
        },
      },
      contents: [
        `Flash Sale uchun marketing matn yarating (o'zbek tilida):
Mahsulot: ${product.title}
Asl narx: $${product.price}
Chegirma narxi: $${product.flashSalePrice}
Chegirma: ${discount}%

1. headline: Shoshilinch sarlavha (masalan: "FAQAT 24 SOAT!")
2. urgencyText: Urgency yaratuvchi matn
3. countdown: Sanashga chaqiruvchi matn`,
      ],
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    throw new Error("Flash sale content yaratilmadi");
  } catch (error) {
    return {
      headline: `MEGA CHEGIRMA - ${product.title}!`,
      urgencyText: "Faqat 24 soat ichida amal qiladi!",
      countdown: "Shoshiling, vaqt cheklangan!",
    };
  }
}
