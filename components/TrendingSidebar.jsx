"use client";
import { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChartLine } from "react-icons/fa";

export default function TrendingSidebar({ articles = [] }) {
  const sidebarRef = useRef(null);
  // Filter articles from last 3 days and randomize
  const trendingArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Filter articles from last 3 days
    const recentArticles = articles.filter((article) => {
      const articleDate = new Date(article.createdAt);
      return articleDate >= threeDaysAgo;
    });

    // Shuffle using Fisher-Yates algorithm
    const shuffled = [...recentArticles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return top 10 random articles from last 3 days
    return shuffled.slice(0, 10);
  }, [articles]);

  // Auto-scroll trending sidebar when main content scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const sidebar = sidebarRef.current;
        const sidebarHeight = sidebar.scrollHeight - sidebar.clientHeight;
        sidebar.scrollTop = scrollPercentage * sidebarHeight;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!trendingArticles || trendingArticles.length === 0) return null;

  return (
    <div ref={sidebarRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <FaChartLine className="text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Trending Now</h3>
      </div>
      <div className="space-y-3">
        {trendingArticles.map((article, idx) => (
          <Link
            key={article._id}
            href={`/${article.category}/${article.slug}`}
            className="block group"
          >
            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-50 to-purple-50">
                {article.image && article.image !== "/news-image.jpg" ? (
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-2">
                    <h4 className="font-semibold text-xs text-gray-900 text-center line-clamp-3 leading-tight">
                      {article.title}
                    </h4>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-600">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {article.category}
                  </span>
                </div>
                <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(article.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

