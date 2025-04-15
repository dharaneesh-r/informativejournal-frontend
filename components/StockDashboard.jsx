"use client";
import React, { useEffect, useState } from "react";

const StockDashboard = () => {
  const [activeTab, setActiveTab] = useState("indices");
  const [selectedSymbol, setSelectedSymbol] = useState("NASDAQ:AAPL");
  const [marketSentiment, setMarketSentiment] = useState({
    rating: "Strong Buy",
    confidence: "High",
    updatedAt: new Date().toLocaleTimeString(),
  });
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    if (document.getElementById("tradingview-widget-script")) return;

    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (window.TradingView) {
        initializeWidgets();
        // Simulate receiving market sentiment data
        simulateMarketData();
      }
    };

    document.body.appendChild(script);

    return () => {
      const script = document.getElementById("tradingview-widget-script");
      if (script) document.body.removeChild(script);
      cleanupWidgets();
    };
  }, []);

  const initializeWidgets = () => {
    // Market Overview Widget
    new window.TradingView.widget({
      width: "100%",
      height: 500,
      symbolsGroups: [
        {
          name: "Indices",
          originalName: "Indices",
          symbols: [
            { name: "NSE:NIFTY", displayName: "Nifty 50" },
            { name: "BSE:SENSEX", displayName: "Sensex" },
            { name: "NASDAQ:NDX", displayName: "Nasdaq 100" },
            { name: "SP:SPX", displayName: "S&P 500" },
          ],
        },
        {
          name: "Stocks",
          originalName: "Stocks",
          symbols: [
            { name: "NASDAQ:AAPL", displayName: "Apple" },
            { name: "NASDAQ:MSFT", displayName: "Microsoft" },
            { name: "NSE:RELIANCE", displayName: "Reliance" },
            { name: "NSE:TATASTEEL", displayName: "Tata Steel" },
          ],
        },
      ],
      showSymbolLogo: true,
      colorTheme: "light",
      isTransparent: false,
      locale: "en",
      container_id: "market-overview-container",
    });

    // Advanced Chart Widget with technical analysis
    new window.TradingView.widget({
      autosize: true,
      symbol: selectedSymbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      studies: [
        "RSI@tv-basicstudies",
        "MACD@tv-basicstudies",
        "StochasticRSI@tv-basicstudies",
        "Volume@tv-basicstudies",
      ],
      container_id: "advanced-chart-container",
    });

    // Symbol Info Widget with fundamental data
    new window.TradingView.widget({
      symbol: selectedSymbol,
      width: "100%",
      height: 400,
      locale: "en",
      colorTheme: "light",
      isTransparent: false,
      container_id: "symbol-info-container",
    });

    // Market Quotes Widget
    new window.TradingView.widget({
      width: "100%",
      height: 600,
      symbols: [
        ["Apple", "AAPL"],
        ["Microsoft", "MSFT"],
        ["Amazon", "AMZN"],
        ["Google", "GOOGL"],
        ["Tesla", "TSLA"],
        ["Reliance", "RELIANCE"],
        ["Tata Steel", "TATASTEEL"],
        ["Infosys", "INFY"],
      ],
      colorTheme: "light",
      isTransparent: false,
      locale: "en",
      container_id: "market-quotes-container",
    });

    // Enhanced Market News Widget with callback
    new window.TradingView.widget({
      width: "100%",
      height: 500,
      feedMode: "all_symbols",
      colorTheme: "light",
      isTransparent: false,
      locale: "en",
      container_id: "market-news-container",
      callback: (data) => {
        if (data && data.news) {
          setNewsItems(data.news.slice(0, 5)); // Store top 5 news items
        }
      },
    });
  };

  const cleanupWidgets = () => {
    [
      "market-overview-container",
      "advanced-chart-container",
      "symbol-info-container",
      "market-quotes-container",
      "market-news-container",
    ].forEach((id) => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = "";
    });
  };

  const simulateMarketData = () => {
    // Simulate changing market sentiment
    const sentiments = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];
    const confidences = ["High", "Medium", "Low"];

    setInterval(() => {
      setMarketSentiment({
        rating: sentiments[Math.floor(Math.random() * sentiments.length)],
        confidence: confidences[Math.floor(Math.random() * confidences.length)],
        updatedAt: new Date().toLocaleTimeString(),
      });
    }, 30000); // Update every 30 seconds
  };

  const getSentimentColor = (rating) => {
    switch (rating) {
      case "Strong Buy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Buy":
        return "bg-green-50 text-green-800 dark:bg-green-900/10 dark:text-green-200";
      case "Hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Sell":
        return "bg-red-50 text-red-800 dark:bg-red-900/10 dark:text-red-200";
      case "Strong Sell":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const marketSections = [
    { id: "indices", name: "Indices" },
    { id: "stocks", name: "Stocks" },
    { id: "crypto", name: "Crypto" },
    { id: "commodities", name: "Commodities" },
  ];

  const stockData = {
    indices: [
      { symbol: "NSE:NIFTY", name: "Nifty 50" },
      { symbol: "BSE:SENSEX", name: "Sensex" },
      { symbol: "NASDAQ:NDX", name: "Nasdaq" },
      { symbol: "SP:SPX", name: "S&P 500" },
    ],
    stocks: [
      { symbol: "NASDAQ:AAPL", name: "Apple" },
      { symbol: "NASDAQ:MSFT", name: "Microsoft" },
      { symbol: "NSE:RELIANCE", name: "Reliance" },
      { symbol: "NSE:TATASTEEL", name: "Tata Steel" },
    ],
    crypto: [
      { symbol: "BINANCE:BTCUSDT", name: "Bitcoin" },
      { symbol: "BINANCE:ETHUSDT", name: "Ethereum" },
      { symbol: "BINANCE:BNBUSDT", name: "BNB" },
      { symbol: "BINANCE:XRPUSDT", name: "XRP" },
    ],
    commodities: [
      { symbol: "COMEX:GC1!", name: "Gold" },
      { symbol: "COMEX:SI1!", name: "Silver" },
      { symbol: "NYMEX:CL1!", name: "Crude Oil" },
      { symbol: "NYMEX:NG1!", name: "Natural Gas" },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 w-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Advanced Market Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Real-time market data with comprehensive analysis
        </p>
      </div>

      {/* Market Segments Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {marketSections.map((section) => (
          <button
            key={section.id}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === section.id
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab(section.id)}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Market Overview Section */}
      <div className="p-4">
        <div className="relative h-[500px] w-full mb-8">
          <div
            id="market-overview-container"
            className="tradingview-widget-container h-full w-full rounded-lg"
          />
        </div>
      </div>

      {/* Market Sentiment Indicator */}
      <div className="px-4">
        <div
          className={`p-4 rounded-lg mb-6 ${getSentimentColor(
            marketSentiment.rating
          )}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Market Sentiment</h3>
              <p className="text-sm">
                Current recommendation for {selectedSymbol.split(":")[1]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{marketSentiment.rating}</p>
              <p className="text-sm">
                Confidence: {marketSentiment.confidence}
              </p>
              <p className="text-xs mt-1">
                Updated: {marketSentiment.updatedAt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Symbol Selection and Detailed View */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Detailed Analysis
        </h2>

        {/* Symbol Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {stockData[activeTab]?.map((item) => (
            <button
              key={item.symbol}
              className={`p-3 rounded-lg text-sm font-medium ${
                selectedSymbol === item.symbol
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => setSelectedSymbol(item.symbol)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Chart and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                {selectedSymbol.split(":")[1]} Chart
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(
                  marketSentiment.rating
                )}`}
              >
                {marketSentiment.rating}
              </span>
            </div>
            <div className="relative h-[400px] w-full">
              <div
                id="advanced-chart-container"
                className="tradingview-widget-container h-full w-full"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Symbol Information
            </h3>
            <div className="relative h-[400px] w-full">
              <div
                id="symbol-info-container"
                className="tradingview-widget-container h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Market Quotes */}
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Market Quotes
        </h2>
        <div className="relative h-[600px] w-full">
          <div
            id="market-quotes-container"
            className="tradingview-widget-container h-full w-full rounded-lg"
          />
        </div>
      </div>

      {/* Market News */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Financial News
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Latest Market News
            </h3>
            <div className="relative h-[500px] w-full">
              <div
                id="market-news-container"
                className="tradingview-widget-container h-full w-full rounded-lg"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Top Headlines
            </h3>
            <div className="space-y-4">
              {newsItems.length > 0 ? (
                newsItems.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 pb-3"
                  >
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.source} -{" "}
                      {new Date(item.published).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Loading news...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>
          Data provided by TradingView. Free version has limited features and
          delayed data. Sentiment analysis updates every 30 seconds.
        </p>
      </div>
    </div>
  );
};

export default StockDashboard;
