"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function NotFound() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "https://informativejournal-backend.vercel.app/articles"
        );
        if (response.data?.status === "success") {
          setArticles(response.data.data.slice(0, 30));
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles");
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 404 Hero Section */}
      <div className="w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            {/* 404 Number with Animation */}
            <div className="relative mb-8">
              <h1 className="text-8xl sm:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-300 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800">
                  404
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Oops! Page Not Found
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                The article or page you're looking for might have been moved, deleted, 
                or the URL might be incorrect. Don't worry, our newsroom has plenty more to explore!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Homepage
                </span>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </span>
              </button>
            </div>

            {/* Search Suggestion */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Or try searching for what you need:</p>
              <div className="max-w-md mx-auto relative">
                <input
                  type="text"
                  placeholder="Search articles, topics, or keywords..."
                  className="w-full px-4 py-3 pl-12 pr-4 text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Articles Section */}
      <div className="w-full py-16 lg:py-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 text-sm font-semibold rounded-full mb-4">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Trending Now
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Latest News & Updates
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay informed with our most recent articles and breaking news stories
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animate-reverse"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading latest articles...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Articles</h4>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            /* Articles Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {articles.map((article, index) => (
                <Link
                  key={article._id}
                  href={`/${article.category}/${article.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1"
                >
                  {/* Article Image */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-400 group-hover:text-gray-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Reading Time Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-white bg-black bg-opacity-70 backdrop-blur-sm rounded-full">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {Math.floor(Math.random() * 5) + 3} min read
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full capitalize tracking-wide">
                        {article.category}
                      </span>
                    </div>

                    {/* Article Title */}
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors leading-tight">
                      {article.title}
                    </h4>

                    {/* Article Description */}
                    <p className="text-gray-600 text-sm sm:text-base line-clamp-3 mb-4 leading-relaxed">
                      {article.description}
                    </p>

                    {/* Read More Link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors">
                        <span>Read Full Story</span>
                        <svg
                          className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                      
                      {/* Article Meta */}
                      <div className="text-xs text-gray-500">
                        {new Date().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Articles Button */}
          {!isLoading && !error && articles.length > 0 && (
            <div className="text-center mt-12 lg:mt-16">
              <Link
                href="/articles"
                className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View All Articles
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}