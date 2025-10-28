"use client";
import Link from "next/link";
import Image from "next/image";
import { FaBookmark, FaRegBookmark, FaShareAlt, FaVolumeUp } from "react-icons/fa";

export default function HeroArticle({ 
  article, 
  isSaved,
  isLatest,
  onSave,
  onShare,
  onListen
}) {
  if (!article) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Link href={`/${article.category}/${article.slug}`} className="block">
        {/* Image Section */}
        <div className="w-full h-[400px] lg:h-[450px] relative overflow-hidden group bg-gradient-to-br from-blue-50 to-purple-50">
          {isLatest && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 z-20">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
          )}
          {article.image && article.image !== "/news-image.jpg" ? (
            <Image
              src={article.image}
              alt={article.title}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, 100vw"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center line-clamp-5 leading-tight">
                {article.title}
              </h2>
            </div>
          )}
        </div>

        {/* Content Section - Title, Description, Author */}
        <div className="p-6 bg-white dark:bg-gray-800">
          {/* Category and Date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 dark:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded uppercase">
              {article.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(article.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Title - Full display */}
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h2>

          {/* Description - Full display */}
          <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {article.description}
          </p>

          {/* Author Details */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <Image
                  src="https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg"
                  alt="Author"
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="text-base lg:text-lg text-gray-900 dark:text-gray-100 font-semibold">
                  {article.author || "Dharaneesh"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.floor(Math.random() * 10) + 1} min read
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSave(article);
                }}
                className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label={isSaved ? "Unsave article" : "Save article"}
              >
                {isSaved ? (
                  <FaBookmark className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <FaRegBookmark className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShare(article);
                }}
                className="p-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Share article"
              >
                <FaShareAlt className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onListen(article);
                }}
                className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Listen to article"
              >
                <FaVolumeUp className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

