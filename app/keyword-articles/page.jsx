"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loading from "../loading";
import Image from "next/image";
import {
  Clock,
  User,
  Tag,
  ChevronRight,
  TrendingUp,
  BarChart2,
  DollarSign,
  Bitcoin,
} from "lucide-react";
import Link from "next/link";

const KeywordArticle = () => {
  // State initialization with safe defaults
  const [keywordArticles, setKeywordArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedArticles, setDisplayedArticles] = useState({
    main: null,
    left: [],
    right: [],
  });

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://informativejournal-backend.vercel.app";

  // Market data with safe defaults
  const [marketData, setMarketData] = useState({
    sensex: { value: 72450, change: 0.42 },
    nifty: { value: 22000, change: 0.38 },
    gold: { value: 62000, change: 0.25 },
    bitcoin: { value: 4200000, change: -1.25 },
  });

  // Fetch articles from API
  const fetchKeywordArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/keyword-articles`);

      if (!response.data?.data) {
        throw new Error("Invalid data format from API");
      }

      const articles = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setKeywordArticles(articles);
      shuffleAndSetArticles(articles);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(
        err.message || "Failed to load articles. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Shuffle articles with Fisher-Yates algorithm
  const shuffleAndSetArticles = (articles) => {
    if (!Array.isArray(articles) || articles.length === 0) {
      setDisplayedArticles({
        main: null,
        left: [],
        right: [],
      });
      return;
    }

    const shuffled = [...articles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setDisplayedArticles({
      main: shuffled[0] || null,
      left: shuffled.slice(1, 4).filter(Boolean),
      right: shuffled.slice(4, 7).filter(Boolean),
    });
  };

  // Simulate market data updates
  useEffect(() => {
    const updateMarketData = () => {
      setMarketData((prev) => ({
        sensex: {
          value: Math.round(72450 + Math.random() * 200 - 100),
          change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        },
        nifty: {
          value: Math.round(22000 + Math.random() * 100 - 50),
          change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        },
        gold: {
          value: Math.round(62000 + Math.random() * 1000 - 500),
          change: parseFloat((Math.random() * 1 - 0.5).toFixed(2)),
        },
        bitcoin: {
          value: Math.round(4200000 + Math.random() * 100000 - 50000),
          change: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        },
      }));
    };

    // Initial update
    updateMarketData();

    // Update every 30 seconds
    const interval = setInterval(updateMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch articles on mount
  useEffect(() => {
    fetchKeywordArticles();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error Loading Content
        </h3>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchKeywordArticles}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // No articles state
  if (!keywordArticles.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-gray-600">No Articles Found</h3>
        <p className="text-gray-500 mt-1">
          Please check back later or try refreshing.
        </p>
        <button
          onClick={fetchKeywordArticles}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10 max-w-7xl mx-auto">
      {/* Market Ticker */}
      <MarketTicker data={marketData} />

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Recent Articles */}
        <div className="w-full lg:w-1/4 space-y-6">
          <SectionHeader title="Recent Terminologies" iconColor="blue" />

          {displayedArticles.left.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              hoverColor="blue"
            />
          ))}

          <FinancialToolsSection />
        </div>

        {/* Center Column - Main Article */}
        <MainArticleSection
          article={displayedArticles.main}
          onRefresh={() => shuffleAndSetArticles(keywordArticles)}
        />

        {/* Right Column - Trending Topics */}
        <div className="w-full lg:w-1/4 space-y-6">
          <SectionHeader title="Trending Topics" iconColor="red" />

          {displayedArticles.right.map((article) => (
            <ArticleCard
              key={`right-${article._id}`}
              article={article}
              hoverColor="red"
            />
          ))}

          <CryptoMarketWidget />
          <TopMutualFundsSection />
        </div>
      </div>
    </div>
  );
};

// Component: Market Ticker
const MarketTicker = ({ data }) => (
  <div className="bg-gray-900 text-white p-3 rounded-lg mb-6 overflow-hidden">
    <div className="flex flex-wrap justify-between items-center gap-4">
      <MarketTickerItem
        icon={<TrendingUp className="text-green-400 mr-2" size={18} />}
        label="SENSEX"
        value={data.sensex.value}
        change={data.sensex.change}
      />
      <MarketTickerItem
        icon={<BarChart2 className="text-blue-400 mr-2" size={18} />}
        label="NIFTY 50"
        value={data.nifty.value}
        change={data.nifty.change}
      />
      <MarketTickerItem
        icon={<DollarSign className="text-yellow-400 mr-2" size={18} />}
        label="GOLD"
        value={data.gold.value}
        change={data.gold.change}
        prefix="₹"
      />
      <MarketTickerItem
        icon={<Bitcoin className="text-orange-400 mr-2" size={18} />}
        label="BTC"
        value={data.bitcoin.value}
        change={data.bitcoin.change}
        prefix="₹"
      />
    </div>
  </div>
);

// Component: Market Ticker Item
const MarketTickerItem = ({ icon, label, value, change, prefix = "" }) => (
  <div className="flex items-center">
    {icon}
    <span className="font-medium mr-1">{label}:</span>
    <span className="mr-1">{prefix}</span>
    <span
      className={`text-sm ${change >= 0 ? "text-green-400" : "text-red-400"}`}
    >
      {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
    </span>
  </div>
);

// Component: Section Header
const SectionHeader = ({ title, iconColor }) => (
  <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
    <span className={`bg-${iconColor}-600 w-1 h-6 mr-2 rounded-full`}></span>
    {title}
  </h3>
);

// Component: Article Card
const ArticleCard = ({ article, hoverColor = "blue" }) => {
  if (!article) return null;

  return (
    <Link
      href={`/keyword-articles/${article.category}/${article.slug}`}
      className="block"
    >
      <div
        className={`group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition border border-gray-100 hover:border-${hoverColor}-100`}
      >
        <div className="relative h-40 mb-3 overflow-hidden rounded-lg">
          <Image
            src={article.image || "/placeholder-image.jpg"}
            alt={article.title || "Article image"}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg";
            }}
          />
        </div>
        <h4
          className={`font-medium text-lg group-hover:text-${hoverColor}-600 transition mb-1`}
        >
          {article.title || "Untitled Article"}
        </h4>
        <div className="flex items-center text-gray-500 text-sm">
          <Clock size={14} className="mr-1" />
          <span>
            {new Date(article.createdAt || new Date()).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

// Component: Financial Tools Section
const FinancialToolsSection = () => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <SectionHeader title="Financial Tools" iconColor="green" />
    <div className="grid grid-cols-2 gap-3">
      <FinancialToolItem
        icon={<DollarSign size={18} />}
        title="SIP Calculator"
        href="https://www.newwss.com/financial-calculators"
        color="blue"
      />
      <FinancialToolItem
        icon={<BarChart2 size={18} />}
        title="EMI Calculator"
        href="https://www.newwss.com/financial-calculators"
        color="purple"
      />
      <FinancialToolItem
        icon={<TrendingUp size={18} />}
        title="FD Calculator"
        href="https://www.newwss.com/financial-calculators"
        color="green"
      />
      <FinancialToolItem
        icon={<Tag size={18} />}
        title="Tax Calculator"
        href="https://www.newwss.com/financial-calculators"
        color="red"
      />
    </div>
  </div>
);

// Component: Financial Tool Item
const FinancialToolItem = ({ icon, title, href, color }) => (
  <Link
    href={href}
    className={`bg-${color}-50 hover:bg-${color}-100 text-${color}-800 p-3 rounded-md transition flex flex-col items-center`}
  >
    <div className={`bg-${color}-100 p-2 rounded-full mb-2`}>{icon}</div>
    <span className="text-sm font-medium text-center">{title}</span>
  </Link>
);

// Component: Main Article Section
const MainArticleSection = ({ article, onRefresh }) => {
  if (!article) {
    return (
      <div className="w-full lg:w-2/4">
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p>No featured article available</p>
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Refresh Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-2/4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <Link href={`/keyword-articles/${article.category}/${article.slug}`}>
          <div className="relative h-64 sm:h-80 md:h-96">
            <Image
              src={article.image || "/placeholder-image.jpg"}
              alt={article.title || "Featured article"}
              fill
              className="object-cover hover:scale-105 transition duration-500"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <User size={16} className="mr-1" />
                <span>{article.author || "Dharaneesh R"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>
                  {new Date(
                    article.createdAt || new Date()
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition">
              {article.title || "Featured Article"}
            </h1>

            {article.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.keywords.slice(0, 3).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center"
                  >
                    <Tag size={12} className="mr-1" />
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-700 leading-relaxed mb-6">
              {article.description || "No description available."}
            </p>

            <button className="flex items-center text-blue-600 hover:text-blue-800 transition font-medium">
              Read Full Article <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </Link>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition flex items-center mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Show Different Articles
        </button>
      </div>
    </div>
  );
};

// Component: Crypto Market Widget
const CryptoMarketWidget = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && !window.TradingView) {
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        width: "100%",
        height: "400",
        defaultColumn: "overview",
        screener_type: "crypto_mkt",
        displayCurrency: "USD",
        colorTheme: "light",
        locale: "in",
        isTransparent: false,
      });

      const container = document.querySelector(
        ".tradingview-widget-container__widget"
      );
      if (container) {
        container.appendChild(script);
      }
    }
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <SectionHeader title="Crypto Market" iconColor="orange" />
      <div className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
};

// Component: Top Mutual Funds Section
const TopMutualFundsSection = () => {
  const funds = [
    { name: "Axis Bluechip Fund", return: "18.2%", type: "Equity" },
    { name: "Mirae Asset Tax Saver", return: "22.1%", type: "ELSS" },
    { name: "Parag Parikh Flexi Cap", return: "20.5%", type: "Flexi Cap" },
    { name: "SBI Small Cap Fund", return: "25.3%", type: "Small Cap" },
    { name: "ICICI Pru Bond Fund", return: "8.7%", type: "Debt" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <SectionHeader title="Top Performing Funds" iconColor="green" />
      <div className="space-y-3">
        {funds.map((fund, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
          >
            <div>
              <p className="font-medium text-sm">{fund.name}</p>
              <p className="text-xs text-gray-500">{fund.type}</p>
            </div>
            <span className="text-green-600 font-medium">{fund.return}</span>
          </div>
        ))}
        <Link
          href="/mutual-funds"
          className="text-blue-600 text-sm font-medium hover:underline flex items-center justify-end"
        >
          View All <ChevronRight size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default KeywordArticle;
