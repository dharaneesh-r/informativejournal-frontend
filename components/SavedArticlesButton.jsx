"use client";
import { FaBookmark } from "react-icons/fa";

export default function SavedArticlesButton({ count, onClick }) {
  // Don't display if count is 0
  if (!count || count === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
      aria-label={`View saved articles (${count})`}
    >
      <FaBookmark className="text-xl" />
      <span className="hidden sm:block font-semibold pr-2">Saved</span>
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
        {count > 9 ? "9+" : count}
      </span>
    </button>
  );
}

