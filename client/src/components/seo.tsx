import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "product";
    product?: {
        name: string;
        description: string;
        price: number;
        currency?: string;
        image: string;
        availability?: "InStock" | "OutOfStock";
        brand?: string;
        category?: string;
        sku?: string;
    };
    breadcrumbs?: { name: string; url: string }[];
}

const SITE_NAME = "Lumina";
const BASE_URL = "https://lumina-uz.onrender.com";
const DEFAULT_DESCRIPTION = "Premium sifatli mahsulotlar, arzon narxlar va tezkor yetkazib berish. O'zbekistondagi eng yaxshi online do'kon.";

export function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    image,
    url,
    type = "website",
    product,
    breadcrumbs,
}: SEOProps) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - O'zbekistondagi Eng Yaxshi Online Do'kon`;
    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
    const imageUrl = image || `${BASE_URL}/og-image.png`;

    // Product Schema
    const productSchema = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.image,
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency || "so'm",
            availability: product.availability === "OutOfStock"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            seller: {
                "@type": "Organization",
                name: SITE_NAME,
            },
        },
        ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
        ...(product.category && { category: product.category }),
        ...(product.sku && { sku: product.sku }),
    } : null;

    // Organization Schema
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: BASE_URL,
        description: DEFAULT_DESCRIPTION,
        logo: `${BASE_URL}/favicon.png`,
        contactPoint: {
            "@type": "ContactPoint",
            telephone: "+998-90-123-45-67",
            contactType: "customer service",
            availableLanguage: ["uz", "ru"],
        },
        sameAs: [
            "https://t.me/Lumina_uzb",
        ],
    };

    // WebSite Schema (for sitelinks search box)
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: BASE_URL,
        potentialAction: {
            "@type": "SearchAction",
            target: `${BASE_URL}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };

    // Breadcrumb Schema
    const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${BASE_URL}${item.url}`,
        })),
    } : null;

    // Combine schemas
    const schemas = [
        organizationSchema,
        websiteSchema,
        productSchema,
        breadcrumbSchema,
    ].filter(Boolean);

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />
            <meta name="robots" content="index, follow" />
            <meta name="keywords" content="online do'kon, internet magazin, arzon narxlar, yetkazib berish, O'zbekiston, Lumina" />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="uz_UZ" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Product specific meta */}
            {product && (
                <>
                    <meta property="product:price:amount" content={product.price.toString()} />
                    <meta property="product:price:currency" content={product.currency || "so'm"} />
                </>
            )}

            {/* JSON-LD Schema */}
            {schemas.map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
}

