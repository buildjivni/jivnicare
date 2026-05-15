"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Search } from "lucide-react";

interface TrendingTopic {
  query: string;
  count: number;
}

export function TrendingSearches() {
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/search/trending`);
        if (res.ok) {
          const data = await res.json();
          // Assume backend returns { searches: [], specialties: [] } or just an array
          if (Array.isArray(data)) {
            setTrending(data);
          } else if (data.searches) {
            setTrending(data.searches);
          }
        }
      } catch (err) {
        console.error("Failed to load trending searches", err);
      } finally {
        setLoading(false);
      }
    }
    
    // In local dev, maybe the API isn't running. Provide a fallback.
    fetchTrending();
  }, []);

  const fallbackTrending = [
    { query: "Cardiologist in Patna", count: 120 },
    { query: "Child Specialist", count: 85 },
    { query: "Skin Doctor", count: 64 },
    { query: "Fever", count: 50 },
  ];

  const displayData = trending.length > 0 ? trending : fallbackTrending;

  if (loading) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4 text-slate-700">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Trending Searches</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {displayData.map((item, index) => (
          <Link
            key={index}
            href={`/doctors?query=${encodeURIComponent(item.query)}`}
            className="group flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full hover:border-primary hover:shadow-sm transition-all duration-300"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
              {item.query}
            </span>
            {item.count > 10 && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold">
                HOT
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
