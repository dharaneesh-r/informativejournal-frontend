"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import TradingView widget to avoid SSR issues
const TradingViewWidget = dynamic(
  () => import("react-tradingview-widget").then((mod) => mod.TradingViewWidget),
  { ssr: false }
);

// API configuration
const API_REFRESH_INTERVAL = 60000; // 60 seconds
const RETRY_DELAY = 5000; // 5 seconds
const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=250&page=1&sparkline=false";

export default function CryptoTradingDashboard() {
  const router = useRouter();
  // State management
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(100000);
  const [orderType, setOrderType] = useState("buy");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [activeTab, setActiveTab] = useState("market");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Check authentication and load data from localStorage
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsAuthenticated(true);

      // Load user data
      const userData = localStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Load trading data
      const tradingData = localStorage.getItem("tradingData");
      if (tradingData) {
        const { balance, portfolio, watchlist } = JSON.parse(tradingData);
        setBalance(balance || 100000);
        setPortfolio(portfolio || []);
        setWatchlist(watchlist || []);
      } else {
        // Initialize with default values if no trading data exists
        localStorage.setItem(
          "tradingData",
          JSON.stringify({
            balance: 100000,
            portfolio: [],
            watchlist: [],
          })
        );
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // Save trading data to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(
        "tradingData",
        JSON.stringify({
          balance,
          portfolio,
          watchlist,
        })
      );
    }
  }, [balance, portfolio, isAuthenticated, watchlist]);

  // Fetch crypto data with error handling and caching
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get(API_URL);
      // Map CoinGecko data to include TradingView-compatible symbols
      const mappedData = data.map((crypto) => ({
        ...crypto,
        tradingview_symbol: `BINANCE:${crypto.symbol.toUpperCase()}USDT`,
      }));
      setCryptos(mappedData);
      setLastUpdated(new Date());
      setError(null);

      // Update selected crypto if it exists in the new data
      if (selectedCrypto) {
        const updatedCrypto = mappedData.find(
          (c) => c.id === selectedCrypto.id
        );
        if (updatedCrypto) {
          setSelectedCrypto(updatedCrypto);
        }
      } else if (mappedData.length > 0) {
        setSelectedCrypto(mappedData[0]);
      }
    } catch (err) {
      setError("Failed to fetch market data. Please try again.");
      setTimeout(fetchData, RETRY_DELAY);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedCrypto]);

  // Fetch crypto data in intervals with cleanup
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();
    const interval = setInterval(fetchData, API_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData, isAuthenticated]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("tradingData");
    router.push("/login");
  };

  // Toggle watchlist
  const toggleWatchlist = (cryptoId) => {
    setWatchlist((prev) =>
      prev.includes(cryptoId)
        ? prev.filter((id) => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  // Place order function
  const placeOrder = () => {
    if (!selectedCrypto || !orderQuantity) {
      alert("Please select a cryptocurrency and enter a quantity.");
      return;
    }

    const quantity = parseFloat(orderQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    const currentPrice = selectedCrypto.current_price;
    const totalCost = currentPrice * quantity;
    const transaction = {
      id: Date.now(),
      cryptoId: selectedCrypto.id,
      name: selectedCrypto.name,
      symbol: selectedCrypto.symbol,
      type: orderType,
      price: currentPrice,
      quantity: quantity,
      total: totalCost,
      timestamp: new Date().toISOString(),
    };

    if (orderType === "buy") {
      if (totalCost > balance) {
        alert("Insufficient balance.");
        return;
      }
      setBalance((prev) => prev - totalCost);
    } else {
      const owned = portfolio
        .filter((p) => p.cryptoId === selectedCrypto.id)
        .reduce(
          (sum, p) => sum + (p.type === "buy" ? p.quantity : -p.quantity),
          0
        );
      if (quantity > owned) {
        alert("Insufficient holdings.");
        return;
      }
      setBalance((prev) => prev + totalCost);
    }

    setPortfolio((prev) => [...prev, transaction]);
    setOrderQuantity("");
  };

  // Calculate portfolio value
  const portfolioValue = portfolio.reduce((total, item) => {
    const currentPrice =
      cryptos.find((c) => c.id === item.cryptoId)?.current_price || 0;
    return item.type === "buy" ? total + currentPrice * item.quantity : total;
  }, 0);

  // Calculate current holdings
  const currentHoldings = cryptos
    .map((crypto) => {
      const transactions = portfolio.filter((p) => p.cryptoId === crypto.id);
      const quantity = transactions.reduce(
        (sum, p) => sum + (p.type === "buy" ? p.quantity : -p.quantity),
        0
      );
      const buyTransactions = transactions.filter((t) => t.type === "buy");
      const avgBuyPrice =
        buyTransactions.length > 0
          ? buyTransactions.reduce((sum, p) => sum + p.total, 0) /
            buyTransactions.reduce((sum, p) => sum + p.quantity, 0)
          : 0;
      const currentValue = quantity * (crypto.current_price || 0);
      const profitLoss = currentValue - quantity * avgBuyPrice;

      return {
        ...crypto,
        quantity,
        avgBuyPrice,
        currentValue,
        profitLoss,
        profitLossPercent:
          avgBuyPrice > 0 && quantity > 0
            ? (profitLoss / (quantity * avgBuyPrice)) * 100
            : 0,
      };
    })
    .filter((h) => h.quantity > 0);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  if (isLoading && cryptos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <div className="text-center">
          <p className="text-xl font-bold">Error loading data</p>
          <p className="mt-2">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Retrying in {RETRY_DELAY / 1000} seconds...
          </p>
          <button
            onClick={fetchData}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Crypto Paper Trading</h1>
            <p className="text-sm">Welcome, {user?.name || "Trader"}</p>
            {lastUpdated && (
              <p className="text-xs text-indigo-200 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center sm:text-right">
              <p className="text-lg">
                Balance: ₹
                {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm">
                Portfolio Value: ₹
                {portfolioValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto flex flex-wrap">
          <button
            className={`px-4 py-3 font-medium text-sm sm:text-base ${
              activeTab === "market"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("market")}
          >
            Market
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm sm:text-base ${
              activeTab === "portfolio"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("portfolio")}
          >
            Portfolio
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm sm:text-base ${
              activeTab === "trade"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
            onClick={() => {
              if (!selectedCrypto && cryptos.length > 0) {
                setSelectedCrypto(cryptos[0]);
              }
              setActiveTab("trade");
            }}
          >
            Trade
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm sm:text-base ${
              activeTab === "watchlist"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("watchlist")}
          >
            Watchlist
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {activeTab === "market" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {cryptos.map((crypto) => (
              <div
                key={crypto.id}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(crypto.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  {watchlist.includes(crypto.id) ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </button>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCrypto(crypto);
                    setActiveTab("trade");
                  }}
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 mr-3"
                    />
                    <div>
                      <h2 className="font-semibold text-sm sm:text-base">
                        {crypto.name}
                      </h2>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        {crypto.symbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg sm:text-xl font-bold">
                      ₹{crypto.current_price.toLocaleString("en-IN")}
                    </p>
                    <p
                      className={
                        crypto.price_change_percentage_24h >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {crypto.price_change_percentage_24h >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Market Cap: ₹{crypto.market_cap.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "watchlist" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Your Watchlist
            </h2>
            {watchlist.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                <p className="text-gray-500 mb-4">
                  Your watchlist is empty. Add coins from the Market tab.
                </p>
                <button
                  onClick={() => setActiveTab("market")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Browse Market
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {cryptos
                  .filter((crypto) => watchlist.includes(crypto.id))
                  .map((crypto) => (
                    <div
                      key={crypto.id}
                      className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(crypto.id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-yellow-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedCrypto(crypto);
                          setActiveTab("trade");
                        }}
                      >
                        <div className="flex items-center mb-4">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 mr-3"
                          />
                          <div>
                            <h2 className="font-semibold text-sm sm:text-base">
                              {crypto.name}
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm">
                              {crypto.symbol.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg sm:text-xl font-bold">
                            ₹{crypto.current_price.toLocaleString("en-IN")}
                          </p>
                          <p
                            className={
                              crypto.price_change_percentage_24h >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {crypto.price_change_percentage_24h >= 0
                              ? "↑"
                              : "↓"}{" "}
                            {Math.abs(
                              crypto.price_change_percentage_24h
                            ).toFixed(2)}
                            %
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            Market Cap: ₹
                            {crypto.market_cap.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Your Portfolio
            </h2>
            {currentHoldings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                <p className="text-gray-500 mb-4">
                  You don't have any holdings yet.
                </p>
                <button
                  onClick={() => {
                    if (cryptos.length > 0) {
                      setSelectedCrypto(cryptos[0]);
                      setActiveTab("trade");
                    }
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Start Trading
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Buy Price
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P&L
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentHoldings.map((holding) => (
                      <tr key={holding.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={holding.image}
                              alt={holding.name}
                              className="w-6 h-6 sm:w-8 sm:h-8 mr-3"
                            />
                            <div>
                              <p className="font-medium text-sm sm:text-base">
                                {holding.name}
                              </p>
                              <p className="text-gray-500 text-xs sm:text-sm">
                                {holding.symbol.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">
                          {holding.quantity.toFixed(6)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">
                          ₹
                          {holding.avgBuyPrice.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">
                          ₹
                          {holding.current_price.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base ${
                            holding.profitLoss >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          ₹
                          {Math.abs(holding.profitLoss).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                          )}{" "}
                          ({holding.profitLossPercent.toFixed(2)}%)
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">
                          ₹
                          {holding.currentValue.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedCrypto(holding);
                              setOrderType("sell");
                              setActiveTab("trade");
                            }}
                            className="text-red-500 hover:text-red-700 text-sm sm:text-base"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "trade" && selectedCrypto && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left column - Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center">
                  <img
                    src={selectedCrypto.image}
                    alt={selectedCrypto.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 mr-3"
                  />
                  <div>
                    <h2 className="font-bold text-lg sm:text-xl">
                      {selectedCrypto.name} (
                      {selectedCrypto.symbol.toUpperCase()})
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      ₹
                      {selectedCrypto.current_price.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-base sm:text-lg ${
                    selectedCrypto.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {selectedCrypto.price_change_percentage_24h >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(selectedCrypto.price_change_percentage_24h).toFixed(
                    2
                  )}
                  %
                </div>
              </div>

              {/* TradingView Chart */}
              <div className="h-64 sm:h-80 lg:h-96">
                {selectedCrypto.tradingview_symbol ? (
                  <TradingViewWidget
                    symbol={selectedCrypto.tradingview_symbol}
                    theme="light"
                    locale="en"
                    width="100%"
                    height="100%"
                    autosize
                  />
                ) : (
                  <div className="flex justify-center items-center h-full bg-gray-100 rounded-lg">
                    <p className="text-gray-500">
                      Chart not available for {selectedCrypto.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs sm:text-sm">24h High</p>
                  <p className="font-medium text-sm sm:text-base">
                    ₹
                    {selectedCrypto.high_24h?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    }) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs sm:text-sm">24h Low</p>
                  <p className="font-medium text-sm sm:text-base">
                    ₹
                    {selectedCrypto.low_24h?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    }) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs sm:text-sm">Market Cap</p>
                  <p className="font-medium text-sm sm:text-base">
                    ₹
                    {selectedCrypto.market_cap?.toLocaleString("en-IN") ||
                      "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs sm:text-sm">24h Volume</p>
                  <p className="font-medium text-sm sm:text-base">
                    ₹
                    {selectedCrypto.total_volume?.toLocaleString("en-IN") ||
                      "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Trading form */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex border-b mb-4">
                <button
                  className={`flex-1 py-2 font-medium text-sm sm:text-base ${
                    orderType === "buy"
                      ? "text-green-500 border-b-2 border-green-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => setOrderType("buy")}
                >
                  Buy
                </button>
                <button
                  className={`flex-1 py-2 font-medium text-sm sm:text-base ${
                    orderType === "sell"
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => setOrderType("sell")}
                >
                  Sell
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Current Price (₹)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"
                    value={selectedCrypto.current_price.toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 }
                    )}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="0.000001"
                    step="0.000001"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Estimated Total
                  </p>
                  <p className="font-medium text-sm sm:text-base">
                    ₹
                    {orderQuantity
                      ? (
                          selectedCrypto.current_price *
                          parseFloat(orderQuantity)
                        ).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                      : "0.00"}
                  </p>
                </div>

                <button
                  className={`w-full py-2 px-4 rounded-md font-medium text-white text-sm sm:text-base ${
                    orderType === "buy"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  } transition-colors disabled:opacity-50`}
                  onClick={placeOrder}
                  disabled={!orderQuantity}
                >
                  {orderType === "buy" ? "Buy" : "Sell"}{" "}
                  {selectedCrypto.symbol.toUpperCase()}
                </button>

                <div className="mt-6">
                  <h3 className="font-medium text-sm sm:text-base mb-2">
                    Your Holdings
                  </h3>
                  {currentHoldings.find((h) => h.id === selectedCrypto.id) ? (
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span>
                          {currentHoldings
                            .find((h) => h.id === selectedCrypto.id)
                            .quantity.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Buy Price:</span>
                        <span>
                          ₹
                          {currentHoldings
                            .find((h) => h.id === selectedCrypto.id)
                            .avgBuyPrice.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Value:</span>
                        <span>
                          ₹
                          {currentHoldings
                            .find((h) => h.id === selectedCrypto.id)
                            .currentValue.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">P&L:</span>
                        <span
                          className={
                            currentHoldings.find(
                              (h) => h.id === selectedCrypto.id
                            ).profitLoss >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          ₹
                          {Math.abs(
                            currentHoldings.find(
                              (h) => h.id === selectedCrypto.id
                            ).profitLoss
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                          (
                          {currentHoldings
                            .find((h) => h.id === selectedCrypto.id)
                            .profitLossPercent.toFixed(2)}
                          %)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-center text-xs sm:text-sm">
                        You don't own any {selectedCrypto.symbol.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
