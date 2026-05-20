import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ChevronLeft, ArrowRight } from "lucide-react";
import { getPostBySlug, getFeaturedPosts } from "@/lib/blogData";
import { SITE_CONFIG } from "@/lib/seo/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  const ogUrl = `${SITE_CONFIG.baseUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: ogUrl,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.imageUrl],
    },
    alternates: {
      canonical: ogUrl,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getFeaturedPosts().filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header / Hero */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" /> Back to Articles
          </Link>
          
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            {post.title}
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
              {post.author.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{post.author}</p>
              <p className="text-sm text-slate-500">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl mt-10">
        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden mb-12 shadow-md">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>

        {/* Article Content */}
        <article className="prose prose-lg prose-slate max-w-none mb-16 prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl">
          {post.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // ## H2
            if (trimmed.startsWith('## ')) {
              return <h2 key={index} className="text-2xl md:text-3xl font-black text-slate-900 mt-10 mb-4">{trimmed.replace('## ', '')}</h2>;
            }
            // ### H3
            if (trimmed.startsWith('### ')) {
              return <h3 key={index} className="text-xl md:text-2xl font-bold text-slate-900 mt-8 mb-3">{trimmed.replace('### ', '')}</h3>;
            }
            // Blockquote
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote key={index} className="border-l-4 border-emerald-500 pl-5 py-2 italic text-slate-700 bg-emerald-50/50 rounded-r-xl my-6">
                  {trimmed.replace('> ', '')}
                </blockquote>
              );
            }
            // Unordered list
            if (trimmed.startsWith('* ')) {
              const items = trimmed.split('\n').filter(i => i.trim().startsWith('* '));
              return (
                <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                  {items.map((item, i) => {
                    const html = item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return <li key={i} className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
                  })}
                </ul>
              );
            }
            // Numbered list (1. 2. 3.)
            if (/^\d+\./.test(trimmed)) {
              const items = trimmed.split('\n').filter(i => /^\d+\./.test(i.trim()));
              return (
                <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
                  {items.map((item, i) => {
                    const html = item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return <li key={i} className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
                  })}
                </ol>
              );
            }
            // Regular paragraph — handle inline bold
            const html = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <p key={index} className="text-slate-600 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: html }} />;
          })}
        </article>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-16 pt-8 border-t border-slate-200">
          {post.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Read Next</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="group flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                    <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {related.title}
                    </h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 font-medium">
                      Read Article <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
