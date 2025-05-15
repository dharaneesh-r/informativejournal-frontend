"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loading from "../loading";
import Image from "next/image";
import { Clock, User, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";

const KeywordArticle = () => {
  const [keywordArticles, setKeywordArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = "https://informativejournal-backend.vercel.app";

  const fetchKeywordArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/keyword-articles`);
      setKeywordArticles(response.data.data || []);
    } catch (err) {
      console.error("Error fetching keyword articles:", err);
      setError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywordArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchKeywordArticles}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!keywordArticles.length) {
    return (
      <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
        <p className="text-xl">No keyword articles found.</p>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Randomly select articles
  const shuffledArticles = shuffleArray(keywordArticles);
  const mainArticle = shuffledArticles[0];
  const leftColumnArticles = shuffledArticles.slice(1, 4);
  const rightColumnArticles = shuffledArticles.slice(4, 7);

  return (
    <div className="w-full px-4 py-10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Recent Articles */}
        <div className="w-full lg:w-1/4 space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
            <span className="bg-blue-600 w-1 h-6 mr-2 rounded-full"></span>
            Recent Terminologies
          </h3>
          {leftColumnArticles.map((article, index) => (
            <Link
              href={`/keyword-articles/${article.category}/${article.slug}`}
              key={article._id}
            >
              <div className="group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
                <div className="relative h-40 mb-3 overflow-hidden rounded-lg">
                  <Image
                    src={article.image || "/placeholder-image.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h4 className="font-medium text-lg group-hover:text-blue-600 transition mb-1">
                  {truncateText(article.title, 60)}
                </h4>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={14} className="mr-1" />
                  <span>
                    {article.createdAt
                      ? formatDate(article.createdAt)
                      : "Recent"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Center Column - Main Article */}
        <div className="w-full lg:w-2/4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Link href={`/keyword-articles/${mainArticle.category}/${mainArticle.slug}`}>
              <div className="relative h-64 sm:h-80 md:h-96">
                <Image
                  src={mainArticle.image || "/placeholder-image.jpg"}
                  alt={mainArticle.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <User size={16} className="mr-1" />
                    <span>{mainArticle.author || "Dharaneesh R"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-1" />
                    <span>
                      {mainArticle.createdAt
                        ? formatDate(mainArticle.createdAt)
                        : "Recent"}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {mainArticle.title}
                </h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mainArticle.keywords?.slice(0, 3).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center"
                    >
                      <Tag size={12} className="mr-1" />
                      {keyword}
                    </span>
                  )) || (
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center">
                      <Tag size={12} className="mr-1" />
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">
                  {mainArticle.description}
                </p>

                <button className="flex items-center text-blue-600 hover:text-blue-800 transition font-medium">
                  Read Full Article <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column - Trending Topics */}
        <div className="w-full lg:w-1/4 space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
            <span className="bg-red-600 w-1 h-6 mr-2 rounded-full"></span>
            Trending Topics
          </h3>
          {rightColumnArticles.map((article, index) => (
            <div
              key={`right-${article._id || index}`}
              className="group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition"
            >
              <div className="relative h-40 mb-3 overflow-hidden rounded-lg">
                <Image
                  src={article.image || "/placeholder-image.jpg"}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h4 className="font-medium text-lg group-hover:text-blue-600 transition mb-1">
                {truncateText(article.title, 60)}
              </h4>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock size={14} className="mr-1" />
                <span>
                  {article.createdAt ? formatDate(article.createdAt) : "Recent"}
                </span>
              </div>
            </div>
          ))}

          {/* Newsletter Subscription */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">
              Stay Updated
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Get the latest articles delivered to your inbox
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
              >
                Subscribe Now
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordArticle;
