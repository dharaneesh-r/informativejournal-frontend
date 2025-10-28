"use client";
import { FaSearch, FaMicrophone } from "react-icons/fa";

export default function SearchBar({ 
  searchQuery, 
  setSearchQuery,
  isListening,
  setIsListening,
  isSpeechSupported,
  isMobile = false
}) {
  return (
    <div className={`mb-6 ${isMobile ? "block md:hidden" : "hidden md:block"}`}>
      <div className="bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <FaSearch className="text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
          />
          {isSpeechSupported && (
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-2 rounded-full transition-all ${
                isListening 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label="Voice search"
            >
              <FaMicrophone className="text-sm" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

