import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getBlogPosts } from "@/lib/api";
import { Link } from "wouter";
import { Calendar, Eye, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { BlogPost } from "@shared/schema";
import { SEO } from "@/components/seo";

export default function BlogPage() {
    const { data: posts = [], isLoading } = useQuery({
        queryKey: ["blog-posts"],
        queryFn: getBlogPosts,
    });

    const formatDate = (date: Date | string | null) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Layout>
            <SEO
                title="Blog - Foydali Maqolalar"
                description="Lumina blog - texnologiya, gadjetlar, va elektronika haqida foydali maqolalar. Eng so'nggi yangiliklarni bilib oling."
                url="/blog"
            />

            <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
                {/* Hero Section */}
                <section className="relative py-16 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4"
                        >
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <BookOpen className="w-8 h-8 text-primary" />
                                <h1 className="text-4xl md:text-5xl font-bold">Blog</h1>
                            </div>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Texnologiya, gadjetlar, va elektronika haqida foydali maqolalar
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Posts Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <Skeleton className="aspect-video w-full" />
                                        <CardContent className="p-6 space-y-4">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-16">
                                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Hozircha maqolalar yo'q</h2>
                                <p className="text-muted-foreground">Tez orada foydali maqolalar chiqadi!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post: BlogPost, index: number) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link href={`/blog/${post.slug}`}>
                                            <Card className="group overflow-hidden cursor-pointer h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                                                {post.imageUrl && (
                                                    <div className="relative aspect-video overflow-hidden">
                                                        <img
                                                            src={post.imageUrl}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                        <Badge className="absolute top-4 left-4" variant="secondary">
                                                            {post.category}
                                                        </Badge>
                                                    </div>
                                                )}
                                                <CardContent className="p-6 space-y-4">
                                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-muted-foreground line-clamp-3">
                                                        {post.excerpt}
                                                    </p>
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {formatDate(post.publishedAt)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="w-4 h-4" />
                                                                {post.viewCount}
                                                            </span>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
