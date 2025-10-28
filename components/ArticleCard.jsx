"use client";
import Link from "next/link";
import Image from "next/image";
import { FaBookmark, FaRegBookmark, FaShareAlt, FaVolumeUp } from "react-icons/fa";

export default function ArticleCard({ 
  article, 
  isSaved, 
  isCurrentArticle,
  isLatest,
  onSave,
  onShare,
  onListen,
  size = "medium" // small, medium, large
}) {
  if (!article) return null;

  const sizes = {
    small: {
      imageHeight: "h-40",
      titleSize: "text-lg",
      descriptionSize: "text-sm",
      padding: "p-4"
    },
    medium: {
      imageHeight: "h-56",
      titleSize: "text-xl",
      descriptionSize: "text-base",
      padding: "p-5"
    },
    large: {
      imageHeight: "h-64",
      titleSize: "text-2xl",
      descriptionSize: "text-base",
      padding: "p-6"
    }
  };

  const style = sizes[size];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-all duration-300 ${
        isCurrentArticle ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <Link href={`/${article.category}/${article.slug}`} className="block h-full flex flex-col">
        <div className={`${style.imageHeight} relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50`}>
          {isLatest && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 z-20">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
          )}
          {article.image && article.image !== "/news-image.jpg" ? (
            <Image
              src={article.image}
              alt={article.title}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <h3 className={`${style.titleSize} font-bold text-gray-900 text-center line-clamp-4 leading-tight`}>
                {article.title}
              </h3>
            </div>
          )}
        </div>
        <div className={`${style.padding} flex flex-col flex-grow`}>
          <div className="flex justify-between items-start mb-2">
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded uppercase">
              {article.category}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(article.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </span>
          </div>
          <h3 className={`${style.titleSize} font-bold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight`}>
            {article.title}
          </h3>
          <p className={`${style.descriptionSize} text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed flex-grow`}>
            {article.description}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <Image
                  src="https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg"
                  alt="Author"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {article.author || "Dharaneesh"}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSave(article);
                }}
                className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                aria-label={isSaved ? "Unsave article" : "Save article"}
              >
                {isSaved ? (
                  <FaBookmark className="text-blue-600 text-sm" />
                ) : (
                  <FaRegBookmark className="text-gray-400 hover:text-blue-600 text-sm transition-colors" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShare(article);
                }}
                className="p-2 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Share article"
              >
                <FaShareAlt className="text-gray-400 hover:text-green-600 text-sm transition-colors" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onListen(article);
                }}
                className="p-2 hover:bg-purple-50 rounded-full transition-colors"
                aria-label="Listen to article"
              >
                <FaVolumeUp className="text-gray-400 hover:text-purple-600 text-sm transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

