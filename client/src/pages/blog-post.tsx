import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getBlogPost } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Calendar, Eye, ChevronLeft, User, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo";

export default function BlogPostPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug || "";

    const { data: post, isLoading, error } = useQuery({
        queryKey: ["blog-post", slug],
        queryFn: () => getBlogPost(slug),
        enabled: !!slug,
    });

    const formatDate = (date: Date | string | null) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const readingTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} daqiqa`;
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <Skeleton className="aspect-video w-full max-w-4xl mx-auto rounded-2xl mb-8" />
                    <div className="max-w-3xl mx-auto space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !post) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4">Maqola topilmadi</h1>
                    <p className="text-muted-foreground mb-6">Kechirasiz, bu maqola mavjud emas.</p>
                    <Button asChild>
                        <Link href="/blog">Blogga qaytish</Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={post.metaTitle || post.title}
                description={post.metaDescription || post.excerpt}
                image={post.imageUrl || undefined}
                url={`/blog/${post.slug}`}
            />

            {/* Article JSON-LD Schema */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: post.title,
                    description: post.excerpt,
                    image: post.imageUrl,
                    author: {
                        "@type": "Person",
                        name: post.author,
                    },
                    publisher: {
                        "@type": "Organization",
                        name: "Lumina",
                        logo: {
                            "@type": "ImageObject",
                            url: "https://luminauz.onrender.com/favicon.png"
                        }
                    },
                    datePublished: post.publishedAt,
                    dateModified: post.publishedAt,
                })
            }} />

            <article className="min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    {/* Back button */}
                    <Button variant="ghost" asChild className="mb-6">
                        <Link href="/blog">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Blogga qaytish
                        </Link>
                    </Button>

                    {/* Hero Image */}
                    {post.imageUrl && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto mb-8"
                        >
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full aspect-video object-cover rounded-2xl shadow-2xl"
                            />
                        </motion.div>
                    )}

                    {/* Article Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-3xl mx-auto"
                    >
                        {/* Category */}
                        <Badge variant="secondary" className="mb-4">
                            {post.category}
                        </Badge>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8 pb-8 border-b">
                            <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {post.author}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.publishedAt)}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {readingTime(post.content)}
                            </span>
                            <span className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                {post.viewCount} ko'rilgan
                            </span>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {(post.tags as string[]).map((tag: string, index: number) => (
                                    <Badge key={index} variant="outline">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </motion.div>
                </div>
            </article>
        </Layout>
    );
}
