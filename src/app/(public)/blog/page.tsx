"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blogData";

export default function BlogListingPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  const featured = BLOG_POSTS[0];

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-6">
            Health & Wellness
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Healthcare Knowledge,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
              Simplified.
            </span>
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Read the latest medical insights, wellness tips, and platform updates straight from top doctors across Bihar.
          </p>
        </div>

        {/* Featured Article */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Featured Insight <ChevronRight className="w-5 h-5 text-slate-400" />
          </h2>
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-slate-100">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                  {featured.category}
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(featured.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {featured.readTime}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                  {featured.title}
                </h3>
                <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                      {featured.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{featured.author}</p>
                      <p className="text-xs text-slate-500">{featured.authorRole}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-10 overflow-x-auto -mx-4 px-4">
          <div className="flex items-center gap-2 min-w-max pb-2">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="font-bold text-lg">No articles in this category yet.</p>
            <p className="text-sm mt-2">Check back soon — our doctors are writing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.slice(activeCategory === "All" ? 1 : 0).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                  <div className="w-full h-48 relative overflow-hidden bg-slate-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-5 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                        {post.author.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate flex-1">{post.author}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
