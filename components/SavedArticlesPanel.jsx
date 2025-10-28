"use client";
import Link from "next/link";
import Image from "next/image";
import { FaBook, FaTimes } from "react-icons/fa";

export default function SavedArticlesPanel({ 
  savedArticles, 
  show, 
  onClose,
  onRemove 
}) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transition-transform duration-300 overflow-hidden ${
        show ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold flex items-center text-gray-900">
            <FaBook className="mr-2 text-blue-600" /> 
            Saved ({savedArticles.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4">
          {savedArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaBook className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>No saved articles yet.</p>
              <p className="text-sm mt-1">Click the bookmark icon to save articles.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedArticles.map((article) => (
                <div
                  key={article._id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <Link href={`/${article.category}/${article.slug}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 relative flex-shrink-0 rounded bg-gray-100">
                        <Image
                          src={article.image || "/news-image.jpg"}
                          alt={article.title}
                          className="object-cover rounded"
                          fill
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 text-gray-900 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {article.author || "Editor"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => onRemove(article)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

