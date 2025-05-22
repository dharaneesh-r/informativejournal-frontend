"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Loading from "../loading";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      loadData();
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const loadData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const portfolioData = JSON.parse(localStorage.getItem("cryptoPortfolio"));
      const articlesData = JSON.parse(localStorage.getItem("savedArticles"));

      setUser(userData);
      setPortfolio(portfolioData);
      setSavedArticles(articlesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Helper function to safely format numbers
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "$0";
    }
    return `$${Number(value).toLocaleString()}`;
  };

  // Helper function to safely get portfolio balance
  const getPortfolioBalance = () => {
    if (
      !portfolio ||
      portfolio.balance === null ||
      portfolio.balance === undefined
    ) {
      return "$0";
    }
    return formatCurrency(portfolio.balance);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
            <Loading />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to view your profile
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full bg-[#111829] hover:bg-white hover:border-2 hover:border-[#111829] text-white hover:text-[#111829] py-2 px-4 rounded-lg transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={loadData}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 md:h-40"></div>
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end">
              <div className="flex items-end -mt-16">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                  <img
                    src={`https://ui-avatars.com/api/?name=${
                      user.email.split("@")[0]
                    }&background=random`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4 md:ml-6 mb-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">
                    {user.email.split("@")[0].replace(".", " ")}
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base">
                    {user.email}
                  </p>
                </div>
              </div>

              {portfolio && (
                <div className="mt-4 md:mt-0 bg-blue-50 rounded-lg p-3 md:p-4 text-center shadow-inner">
                  <p className="text-xs md:text-sm text-blue-600 font-medium">
                    Current Balance
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-blue-900">
                    {getPortfolioBalance()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${
              activeTab === "portfolio"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`flex-shrink-0 px-4 py-2 font-medium text-sm ${
              activeTab === "articles"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Saved Articles ({savedArticles.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Account Details
              </h2>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div className="border-b pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </label>
                  <p className="text-gray-900 break-all">{user._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Account Created
                  </label>
                  <p className="text-gray-900">
                    {new Date(
                      parseInt(user._id.substring(0, 8), 16) * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Crypto Portfolio
              </h2>
              {portfolio ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 shadow-inner">
                      <p className="text-xs text-blue-600 font-medium">
                        Total Balance
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {getPortfolioBalance()}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 shadow-inner">
                      <p className="text-xs text-green-600 font-medium">
                        Assets Held
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        {portfolio.holdings
                          ? Object.keys(portfolio.holdings).length
                          : 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 shadow-inner">
                      <p className="text-xs text-purple-600 font-medium">
                        Transactions
                      </p>
                      <p className="text-xl font-bold text-purple-900">
                        {portfolio.transactions
                          ? portfolio.transactions.length
                          : 0}
                      </p>
                    </div>
                  </div>

                  {portfolio.holdings &&
                  Object.keys(portfolio.holdings).length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Your Holdings
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Asset
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Amount
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(portfolio.holdings).map(
                              ([asset, details]) => (
                                <tr key={asset}>
                                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                                    {asset}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {details?.amount || 0}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {formatCurrency(details?.value)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-2 text-gray-500">
                        Your portfolio is empty
                      </p>
                      <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Browse Assets
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No portfolio data found</p>
                </div>
              )}
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === "articles" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Saved Articles
              </h2>
              {savedArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedArticles.map((article) => (
                    <Link
                      href={`/${article.category}/${article.slug}`}
                      key={article._id}
                    >
                      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x200?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
                              {article.category}
                            </span>
                            <button className="text-gray-400 hover:text-red-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                          <h3 className="font-bold text-md mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                            {article.description}
                          </p>
                          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Read Article
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">
                    You haven't saved any articles yet
                  </p>
                  <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Browse Articles
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
