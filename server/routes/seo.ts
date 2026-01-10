import { Router } from "express";
import { storage } from "../storage";

const router = Router();

const BASE_URL = process.env.BASE_URL || "https://lumina-uz.onrender.com";

// Sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    const categories = await storage.getAllCategories();
    const blogPosts = await storage.getAllBlogPosts(true);

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/flash-sales</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Categories -->
${categories.map(cat => `  <url>
    <loc>${BASE_URL}/category/${cat.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
  
  <!-- Products -->
${products.map(p => `  <url>
    <loc>${BASE_URL}/product/${p.slug || p.id}</loc>
    <lastmod>${p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
  
  <!-- Blog Posts -->
${blogPosts.map(post => `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    console.error("Sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// robots.txt with sitemap reference
router.get("/robots.txt", (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin area
Disallow: /admin
Disallow: /api/
`;
  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export const seoRouter = router;
