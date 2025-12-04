# Lumina AI E-Commerce Platform - Loyiha Hisoboti

## Umumiy Ma'lumot

**Loyiha nomi:** Lumina AI E-Commerce Platform  
**Maqsad:** Google Gemini AI yordamida mahsulot rasmlarini tahlil qiluvchi, avtomatik marketing kontenti yaratuvchi va Telegram bilan integratsiya qilingan zamonaviy elektron tijorat platformasi.

Bu platforma foydalanuvchilarga mahsulotlarni ko'rish, savatchani boshqarish va buyurtmalarni qayta ishlash imkonini beradi. Shuningdek, admin panel orqali AI yordamida mahsulotlarni boshqarish, Telegram kanaliga avtomatik post yuborish va Flash Sale aksiyalarini boshqarish mumkin.

---

## Loyiha Holati (Dekabr 2025)

**Holat:** Ishga tayyor

### Oxirgi Yangilanishlar
- Replit Agent muhitidan Replit muhitiga muvaffaqiyatli migratsiya qilindi
- Node.js 20 muhiti sozlandi
- Barcha paketlar o'rnatildi va ishga tushirildi
- PostgreSQL ma'lumotlar bazasi Drizzle ORM orqali ulandi
- Deployment konfiguratsiyasi sozlandi (autoscale rejimi)
- Workflow `npm run dev` bilan ishga tushirildi va muvaffaqiyatli ishlayapti

---

## Yangi Xususiyatlar (2024-2025)

### AI Marketing Kengaytmalari
- SEO optimallashtirilgan sarlavhalar generatsiyasi
- Sotish nuqtalari (Selling Points) avtomatik yaratish
- Use-case va foydalanish ssenariylarini tavsiya qilish
- Narx asoslash va raqobatchilar tahlili
- Professional marketing copy O'zbek tilida

### Telegram Bot Integratsiyasi
- Mahsulotlarni Telegram kanalga avtomatik post qilish
- Har soatda bir mahsulotni avtomatik ulashish (Cron Job)
- Marketing matnlari bilan to'ldirilgan professional postlar
- Post tarixini kuzatish va loglarni ko'rish

### Flash Sale Tizimi
- 24 soatlik chegirma aksiyalarini o'rnatish
- Countdown timer bilan real-time kuzatish
- AI tomonidan yaratilgan Flash Sale marketing matni
- Admin paneldan oson boshqarish

### Qidiruv va Filtrlash
- Mahsulotlar bo'yicha qidiruv
- Kategoriya bo'yicha filtrlash
- Real-time qidiruv natijalari

---

## Texnik Arxitektura

### Frontend (Foydalanuvchi interfeysi)

| Texnologiya | Vazifasi |
|-------------|----------|
| **React 19** | Asosiy UI kutubxonasi |
| **TypeScript** | Xavfsiz kod yozish uchun |
| **Wouter** | Sahifalar orasida navigatsiya |
| **TanStack React Query** | Server ma'lumotlarini boshqarish |
| **Radix UI + shadcn/ui** | UI komponentlar kutubxonasi |
| **Tailwind CSS** | Stillar va dizayn |
| **Framer Motion** | Animatsiyalar |
| **Vite 7** | Tezkor dastur yig'ish vositasi |

### Backend (Server tomoni)

| Texnologiya | Vazifasi |
|-------------|----------|
| **Express.js** | HTTP server |
| **TypeScript** | Xavfsiz kod |
| **Multer** | Fayl yuklash (5MB limit) |
| **Drizzle ORM** | Ma'lumotlar bazasi bilan ishlash |
| **PostgreSQL (Neon)** | Ma'lumotlar bazasi |
| **Google Gemini AI** | Mahsulot rasmlarini tahlil qilish |
| **Telegram Bot API** | Kanal bilan integratsiya |

---

## Ma'lumotlar Bazasi Tuzilishi

### Jadvallar

#### 1. `users` - Foydalanuvchilar
| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | UUID | Unikal identifikator |
| username | Text | Foydalanuvchi nomi |
| password | Text | Shifrlangan parol |
| isAdmin | Boolean | Admin huquqi |
| createdAt | Timestamp | Yaratilgan vaqt |

#### 2. `products` - Mahsulotlar
| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | Serial | Unikal raqam |
| title | Text | Mahsulot nomi |
| price | Integer | Narxi |
| description | Text | Tavsifi |
| imageUrl | Text | Rasm manzili |
| category | Text | Kategoriyasi |
| tags | JSON | Teglar ro'yxati |
| aiAnalysis | JSON | AI tahlili natijalari (sentiment, keywords, prediction, sellingPoints, useCases, priceJustification, seoTitle, seoDescription) |
| isFlashSale | Boolean | Flash sale holati |
| flashSalePrice | Integer | Chegirma narxi |
| flashSaleEnds | Timestamp | Chegirma tugash vaqti |
| telegramPostedAt | Timestamp | Oxirgi Telegram post vaqti |
| createdAt | Timestamp | Yaratilgan vaqt |

#### 3. `orders` - Buyurtmalar
| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | Serial | Unikal raqam |
| customerName | Text | Mijoz ismi |
| customerPhone | Text | Telefon raqami |
| customerAddress | Text | Manzil |
| totalAmount | Integer | Umumiy summa |
| status | Text | Holati (yangi/jarayonda/bajarildi) |
| createdAt | Timestamp | Yaratilgan vaqt |

#### 4. `order_items` - Buyurtma tarkibi
| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | Serial | Unikal raqam |
| orderId | Integer | Buyurtma ID |
| productId | Integer | Mahsulot ID |
| quantity | Integer | Miqdori |
| priceAtPurchase | Integer | Sotib olish narxi |

#### 5. `telegram_logs` - Telegram post tarixi
| Maydon | Turi | Tavsif |
|--------|------|--------|
| id | Serial | Unikal raqam |
| productId | Integer | Mahsulot ID |
| messageId | Text | Telegram xabar ID |
| caption | Text | Post matni |
| marketingVariantA | Text | Marketing variant A |
| marketingVariantB | Text | Marketing variant B |
| status | Text | Holati (sent/failed) |
| createdAt | Timestamp | Yuborilgan vaqt |

---

## API Endpointlar

### Autentifikatsiya
| Metod | Endpoint | Vazifa |
|-------|----------|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Tizimga kirish |

### Mahsulotlar
| Metod | Endpoint | Vazifa |
|-------|----------|--------|
| GET | `/api/products` | Barcha mahsulotlar |
| GET | `/api/products/:id` | Bitta mahsulot |
| GET | `/api/products/search?q=...` | Mahsulot qidirish |
| POST | `/api/products` | Yangi mahsulot qo'shish (AI tahlili bilan) |
| PATCH | `/api/products/:id` | Mahsulotni yangilash |
| DELETE | `/api/products/:id` | Mahsulotni o'chirish |
| POST | `/api/products/:id/marketing` | Marketing matni yaratish |

### Flash Sale
| Metod | Endpoint | Vazifa |
|-------|----------|--------|
| GET | `/api/flash-sales` | Barcha aktiv chegirmalar |
| POST | `/api/products/:id/flash-sale` | Flash sale o'rnatish |
| DELETE | `/api/products/:id/flash-sale` | Flash sale bekor qilish |

### Telegram
| Metod | Endpoint | Vazifa |
|-------|----------|--------|
| POST | `/api/telegram/post/:id` | Mahsulotni kanalga yuborish |
| GET | `/api/telegram/logs` | Post tarixini ko'rish |
| GET | `/api/telegram/cron/status` | Cron job holati |
| POST | `/api/telegram/cron/start` | Avtomatik postni boshlash |
| POST | `/api/telegram/cron/stop` | Avtomatik postni to'xtatish |
| POST | `/api/telegram/cron/run-now` | Hozir post yuborish |

### Buyurtmalar
| Metod | Endpoint | Vazifa |
|-------|----------|--------|
| GET | `/api/orders` | Barcha buyurtmalar |
| POST | `/api/orders` | Yangi buyurtma |
| PATCH | `/api/orders/:id/status` | Buyurtma holatini yangilash |

---

## AI Integratsiyasi (Google Gemini)

Platforma Google Gemini 2.5 Flash modelidan foydalanadi:

**Asosiy imkoniyatlar:**
- Rasm tahlili orqali mahsulot ma'lumotlarini chiqarish
- Avtomatik nom, kategoriya va narx bashorati
- Sentiment tahlili va hissiyot bahosi
- Kalit so'zlarni ajratib olish
- Bozor bashorati va trend tahlili

**Kengaytirilgan imkoniyatlar:**
- SEO optimallashtirilgan sarlavhalar yaratish
- Sotish nuqtalari va afzalliklarni ajratib ko'rsatish
- Use-case va foydalanish ssenariylarini tavsiya qilish
- Narx asoslash va raqobatchilar tahlili
- Professional marketing copy generatsiyasi
- Telegram post matni yaratish
- Flash sale marketing matni

**Til:** O'zbek tili uchun to'liq optimallashtirilgan

---

## Telegram Bot Xususiyatlari

### Avtomatik Postlash
- Har 1 soatda bitta mahsulotni avtomatik tanlash
- Eng kam post qilingan mahsulotdan boshlash
- Professional formatda post yuborish

### Post Formati
```
[Mahsulot nomi] - [Kategoriya]

[Marketing tavsifi]

[Sotish nuqtalari ro'yxati]

Narx: $[narx]

#[teglar]
```

### Flash Sale Postlari
- Maxsus chegirma formatida post
- Countdown timer ko'rsatish
- Urgentlik hissini uyg'otuvchi matn

---

## Loyiha Fayllari Tuzilishi

```
lumina-ai-ecommerce/
├── client/                    # Frontend
│   ├── public/               # Statik fayllar
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/       # UI komponentlar
│   │   │   ├── ui/          # shadcn/ui komponentlar
│   │   │   └── layout.tsx   # Asosiy layout
│   │   ├── hooks/           # Custom React hooklar
│   │   │   ├── use-cart.tsx # Savatcha hook
│   │   │   └── use-toast.ts # Bildirishnoma hook
│   │   ├── lib/             # Yordamchi funksiyalar
│   │   │   ├── api.ts       # API so'rovlari
│   │   │   ├── mock-data.ts # Test ma'lumotlar
│   │   │   └── utils.ts     # Utilita funksiyalar
│   │   ├── pages/           # Sahifalar
│   │   │   ├── home.tsx     # Bosh sahifa (qidiruv, flash sale)
│   │   │   ├── checkout.tsx # To'lov sahifasi
│   │   │   ├── admin.tsx    # Admin panel (Telegram, Flash Sale)
│   │   │   └── not-found.tsx
│   │   ├── App.tsx          # Asosiy komponent
│   │   ├── main.tsx         # Kirish nuqtasi
│   │   └── index.css        # Global stillar
│   └── index.html
├── server/                    # Backend
│   ├── db.ts                 # Ma'lumotlar bazasi ulanishi
│   ├── gemini.ts             # AI integratsiyasi (kengaytirilgan)
│   ├── telegram.ts           # Telegram bot integratsiyasi
│   ├── index.ts              # Server kirish nuqtasi
│   ├── routes.ts             # API endpointlar
│   ├── static.ts             # Statik fayllar
│   ├── storage.ts            # Ma'lumotlar qatlami
│   └── vite.ts               # Vite integratsiyasi
├── shared/                    # Umumiy kod
│   └── schema.ts             # Ma'lumotlar bazasi sxemasi
├── script/
│   └── build.ts              # Build skripti
├── uploads/                   # Yuklangan rasmlar
├── attached_assets/           # Generatsiya qilingan rasmlar
├── package.json              # Loyiha sozlamalari
├── vite.config.ts            # Vite konfiguratsiyasi
├── drizzle.config.ts         # Drizzle ORM sozlamalari
├── tsconfig.json             # TypeScript sozlamalari
├── loyiham.md                # Loyiha hisoboti
└── replit.md                 # Loyiha hujjatlari
```

---

## Xususiyatlar

### Foydalanuvchilar uchun:
- Mahsulotlarni ko'rish va qidirish
- Kategoriya bo'yicha filtrlash
- Flash Sale chegirmalarini ko'rish
- Countdown timer bilan aksiyalarni kuzatish
- Savatchaga mahsulot qo'shish
- Buyurtma berish
- Qorong'u/yorug' rejim

### Adminlar uchun:
- Rasm yuklash orqali mahsulot qo'shish
- AI yordamida avtomatik ma'lumotlar to'ldirish
- Professional marketing copy generatsiyasi
- Mahsulotlarni tahrirlash/o'chirish
- Buyurtmalarni boshqarish
- Telegram kanaliga post yuborish
- Avtomatik postlashni boshqarish (Cron Job)
- Flash Sale aksiyalarini o'rnatish
- Telegram loglarini kuzatish

---

## Muhit O'zgaruvchilari

| O'zgaruvchi | Vazifasi |
|-------------|----------|
| `DATABASE_URL` | PostgreSQL ulanish manzili |
| `GEMINI_API_KEY` | Google Gemini AI kaliti |
| `TELEGRAM_BOT_TOKEN` | Telegram bot tokeni |
| `TELEGRAM_CHANNEL_ID` | Telegram kanal ID |

---

## Xavfsizlik Choralari

1. **Parol shifrlash:** scrypt algoritmi bilan xavfsiz saqlash
2. **Ma'lumotlar validatsiyasi:** Zod kutubxonasi bilan tekshirish
3. **Fayl yuklash cheklovlari:** 5MB maksimal hajm
4. **CORS sozlamalari:** Xavfsiz API so'rovlari
5. **Muhit o'zgaruvchilari:** API kalitlarini xavfsiz saqlash

---

## Ishga Tushirish

**Development rejim:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm run start
```

**Ma'lumotlar bazasini yangilash:**
```bash
npm run db:push
```

---

## Deployment Konfiguratsiyasi

**Rejim:** Autoscale  
**Build buyrug'i:** `npm run build`  
**Ishga tushirish:** `npm run start`  
**Port:** 5000

---

## Xulosa

Lumina AI - bu zamonaviy, AI-powered elektron tijorat platformasi bo'lib, O'zbekiston bozori uchun to'liq moslashtirilgan. Platforma Google Gemini AI dan foydalanib, mahsulot rasmlarini avtomatik tahlil qiladi, professional marketing kontentini yaratadi va Telegram kanalga avtomatik post yuboradi.

**Asosiy afzalliklar:**
- Zamonaviy texnologiyalar (React 19, TypeScript, Tailwind CSS, Vite 7)
- Kengaytirilgan AI-powered mahsulot tahlili
- Professional marketing copy generatsiyasi
- Telegram bot integratsiyasi
- Flash Sale tizimi
- Qidiruv va filtrlash
- O'zbek tilida to'liq interfeys
- Xavfsiz va ishonchli arxitektura
- Replit platformasiga to'liq moslashgan

---

*Hisobot yangilangan: 3 Dekabr 2025*  
*Platforma: Replit*  
*Holat: Ishga tayyor*
