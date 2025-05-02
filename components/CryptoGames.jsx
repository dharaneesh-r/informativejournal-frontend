"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function CryptoTradingPlatform() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("authToken");
      const userEmail = localStorage.getItem("userEmail");
      setIsAuthenticated(!!authToken && !!userEmail);
    }
  }, []);

  // State management
  const [cryptos, setCryptos] = useState([]);
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [portfolio, setPortfolio] = useState({
    balance: 10000,
    holdings: {},
    transactions: [],
  });
  const [watchlist, setWatchlist] = useState([]);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState("buy");
  const [isLoading, setIsLoading] = useState(true);
  const [tradeFeedback, setTradeFeedback] = useState(null);
  const tradingViewWidget = useRef(null);

  // Initialize portfolio and watchlist from localStorage if authenticated
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      const savedPortfolio = localStorage.getItem("cryptoPortfolio");
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      }

      const savedWatchlist = localStorage.getItem("cryptoWatchlist");
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    }
  }, [isAuthenticated]);

  // Save to localStorage when portfolio or watchlist changes
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("cryptoPortfolio", JSON.stringify(portfolio));
    }
  }, [portfolio, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("cryptoWatchlist", JSON.stringify(watchlist));
    }
  }, [watchlist, isAuthenticated]);

  // Fetch top 200 cryptos
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        // First fetch top 200 by market cap
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false"
        );
        let data = await response.json();

        // If we have less than 200, fetch another page
        if (data.length < 200) {
          const response2 = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=2&sparkline=false"
          );
          const data2 = await response2.json();
          data = [...data, ...data2].slice(0, 200);
        }

        setCryptos(data);
        setFilteredCryptos(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching cryptos:", error);
        setIsLoading(false);
      }
    };

    fetchCryptos();

    // Set up interval to refresh prices every 10 seconds
    const interval = setInterval(fetchCryptos, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter cryptos based on search term
  useEffect(() => {
    const filtered = cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCryptos(filtered);
  }, [searchTerm, cryptos]);

  // Load TradingView widget when crypto is selected
  useEffect(() => {
    if (selectedCrypto && typeof window !== "undefined") {
      // Remove previous widget if exists
      if (tradingViewWidget.current) {
        tradingViewWidget.current.innerHTML = "";
      }

      // Create new widget
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${selectedCrypto.symbol.toUpperCase()}USDT`,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#1E1E1E",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: "tradingview-widget",
        });
      };
      document.body.appendChild(script);
      tradingViewWidget.current = document.getElementById("tradingview-widget");
    }
  }, [selectedCrypto]);

  // Toggle crypto in watchlist
  const toggleWatchlist = (cryptoId) => {
    if (!isAuthenticated) return;

    if (watchlist.includes(cryptoId)) {
      setWatchlist(watchlist.filter((id) => id !== cryptoId));
    } else {
      setWatchlist([...watchlist, cryptoId]);
    }
  };

  // Calculate average buy price for a crypto
  const calculateAverageBuyPrice = (cryptoId) => {
    const buyTransactions = portfolio.transactions.filter(
      (tx) => tx.cryptoId === cryptoId && tx.type === "buy"
    );

    if (buyTransactions.length === 0) return 0;

    const totalSpent = buyTransactions.reduce(
      (sum, tx) => sum + tx.totalCost,
      0
    );
    const totalBought = buyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    return totalSpent / totalBought;
  };

  // Sell specific amount of crypto
  const sellCrypto = (cryptoId, amount) => {
    if (!isAuthenticated) return;

    const crypto = cryptos.find((c) => c.id === cryptoId);
    if (!crypto) return;

    const price = crypto.current_price;
    const totalValue = amount * price;
    const avgBuyPrice = calculateAverageBuyPrice(cryptoId);
    const originalCost = amount * avgBuyPrice;
    const profitLoss = totalValue - originalCost;
    const profitLossPercentage = ((price - avgBuyPrice) / avgBuyPrice) * 100;
    const timestamp = new Date().toISOString();

    const newPortfolio = {
      balance: portfolio.balance + originalCost + profitLoss, // Add back original investment plus profit/loss
      holdings: {
        ...portfolio.holdings,
        [cryptoId]: portfolio.holdings[cryptoId] - amount,
      },
      transactions: [
        ...portfolio.transactions,
        {
          type: "sell",
          cryptoId,
          symbol: crypto.symbol,
          amount,
          price,
          totalValue,
          originalCost,
          profitLoss,
          profitLossPercentage,
          timestamp,
        },
      ],
    };

    setPortfolio(newPortfolio);
    setTradeFeedback({
      type: profitLoss >= 0 ? "success" : "warning",
      message: `Sold ${amount} ${crypto.symbol.toUpperCase()} at $${price.toFixed(
        2
      )} (${profitLoss >= 0 ? "Profit" : "Loss"}: $${Math.abs(
        profitLoss
      ).toFixed(2)} | ${profitLossPercentage.toFixed(2)}%)`,
    });
    setTimeout(() => setTradeFeedback(null), 5000);
  };

  // Execute trade at current price
  const executeTrade = () => {
    if (
      !isAuthenticated ||
      !selectedCrypto ||
      !tradeAmount ||
      isNaN(tradeAmount)
    )
      return;

    const amount = parseFloat(tradeAmount);
    const price = selectedCrypto.current_price;
    const totalCost = amount * price;
    const timestamp = new Date().toISOString();

    if (tradeType === "buy") {
      if (totalCost > portfolio.balance) {
        setTradeFeedback({
          type: "error",
          message: "Insufficient balance for this trade",
        });
        setTimeout(() => setTradeFeedback(null), 3000);
        return;
      }

      const newPortfolio = {
        balance: portfolio.balance - totalCost,
        holdings: {
          ...portfolio.holdings,
          [selectedCrypto.id]:
            (portfolio.holdings[selectedCrypto.id] || 0) + amount,
        },
        transactions: [
          ...portfolio.transactions,
          {
            type: "buy",
            cryptoId: selectedCrypto.id,
            symbol: selectedCrypto.symbol,
            amount,
            price,
            totalCost,
            timestamp,
          },
        ],
      };

      setPortfolio(newPortfolio);
      setTradeFeedback({
        type: "success",
        message: `Successfully bought ${amount} ${selectedCrypto.symbol.toUpperCase()} at $${price.toFixed(
          2
        )} each`,
      });
    } else {
      if (
        !portfolio.holdings[selectedCrypto.id] ||
        portfolio.holdings[selectedCrypto.id] < amount
      ) {
        setTradeFeedback({
          type: "error",
          message: "Insufficient holdings for this sale",
        });
        setTimeout(() => setTradeFeedback(null), 3000);
        return;
      }

      sellCrypto(selectedCrypto.id, amount);
    }

    setTradeAmount("");
  };

  // Calculate portfolio value
  const calculatePortfolioValue = () => {
    return Object.entries(portfolio.holdings).reduce(
      (total, [cryptoId, amount]) => {
        const crypto = cryptos.find((c) => c.id === cryptoId);
        return total + (crypto ? amount * crypto.current_price : 0);
      },
      0
    );
  };

  // Calculate profit/loss for a holding
  const calculateProfitLoss = (cryptoId, amount) => {
    const crypto = cryptos.find((c) => c.id === cryptoId);
    if (!crypto) return 0;

    const avgBuyPrice = calculateAverageBuyPrice(cryptoId);
    return (crypto.current_price - avgBuyPrice) * amount;
  };

  // Calculate total profit/loss from all sales
  const calculateTotalRealizedProfitLoss = () => {
    return portfolio.transactions
      .filter((tx) => tx.type === "sell")
      .reduce((total, tx) => total + (tx.profitLoss || 0), 0);
  };

  // Reset portfolio
  const resetPortfolio = () => {
    if (!isAuthenticated) return;

    if (
      confirm(
        "Are you sure you want to reset your portfolio? This cannot be undone."
      )
    ) {
      setPortfolio({
        balance: 10000,
        holdings: {},
        transactions: [],
      });
      setTradeFeedback({
        type: "info",
        message: "Portfolio has been reset to initial state",
      });
      setTimeout(() => setTradeFeedback(null), 3000);
    }
  };

  // Format currency with proper decimals
  const formatCurrency = (value, minDecimals = 2, maxDecimals = 2) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative">
      {/* Authentication overlay */}
      {!isAuthenticated && (
        <div className="absolute inset-0 z-2 bg-opacity-90 flex flex-col items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to Crypto Trader
              </h2>
              <p className="text-gray-300">
                Please sign in to access your trading dashboard
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>

              <p className="text-center text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={`container mx-auto px-4 py-8 transition-opacity duration-300 ${
          !isAuthenticated ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          Crypto Trading Platform
        </h1>

        {/* Trade Feedback Notification */}
        {tradeFeedback && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
              tradeFeedback.type === "success"
                ? "bg-green-600"
                : tradeFeedback.type === "error"
                ? "bg-red-600"
                : tradeFeedback.type === "warning"
                ? "bg-yellow-600"
                : "bg-blue-600"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {tradeFeedback.type === "success"
                  ? "✓"
                  : tradeFeedback.type === "error"
                  ? "✗"
                  : tradeFeedback.type === "warning"
                  ? "⚠"
                  : "ℹ"}
              </span>
              <span>{tradeFeedback.message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Left sidebar - Crypto list */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 transition-all duration-200">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search 200+ cryptocurrencies..."
                className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Coin</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">24h</th>
                      <th className="text-right py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCryptos.map((crypto) => (
                      <tr
                        key={crypto.id}
                        className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                          selectedCrypto?.id === crypto.id ? "bg-gray-700" : ""
                        } ${
                          watchlist.includes(crypto.id)
                            ? "border-l-4 border-l-yellow-400"
                            : ""
                        }`}
                        onClick={() => setSelectedCrypto(crypto)}
                      >
                        <td className="py-3 flex items-center">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-6 h-6 mr-2"
                          />
                          <span className="truncate max-w-[120px]">
                            {crypto.name}
                          </span>
                          <span className="text-gray-400 ml-1">
                            ({crypto.symbol.toUpperCase()})
                          </span>
                        </td>
                        <td className="text-right py-3">
                          ${formatCurrency(crypto.current_price, 2, 8)}
                        </td>
                        <td
                          className={`text-right py-3 ${
                            crypto.price_change_percentage_24h >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {crypto.price_change_percentage_24h?.toFixed(2)}%
                        </td>
                        <td className="text-right py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(crypto.id);
                            }}
                            className={`p-1 rounded-full hover:bg-gray-600 transition-colors ${
                              watchlist.includes(crypto.id)
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                            title={
                              watchlist.includes(crypto.id)
                                ? "Remove from watchlist"
                                : "Add to watchlist"
                            }
                          >
                            {watchlist.includes(crypto.id) ? "★" : "☆"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Main content - Trading view and trade execution */}
          <div className="lg:col-span-2 space-y-6">
            {/* TradingView Chart */}
            <div className="bg-gray-800 rounded-lg p-4 h-96 transition-all duration-200">
              {selectedCrypto ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold flex items-center">
                      <img
                        src={selectedCrypto.image}
                        alt={selectedCrypto.name}
                        className="w-6 h-6 mr-2"
                      />
                      {selectedCrypto.name} (
                      {selectedCrypto.symbol.toUpperCase()})
                    </h2>
                    <div
                      className={`text-lg ${
                        selectedCrypto.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ${formatCurrency(selectedCrypto.current_price, 2, 8)}
                      <span className="ml-2">
                        (
                        {selectedCrypto.price_change_percentage_24h?.toFixed(2)}
                        %)
                      </span>
                    </div>
                  </div>
                  <div
                    id="tradingview-widget"
                    className="h-[calc(100%-40px)] w-full"
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Select a cryptocurrency to view chart
                </div>
              )}
            </div>

            {/* Trade execution panel */}
            <div className="bg-gray-800 rounded-lg p-4 transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4">
                {selectedCrypto
                  ? `Trade ${selectedCrypto.name}`
                  : "Select a cryptocurrency to trade"}
              </h2>

              {selectedCrypto && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2">Trade Type</label>
                    <select
                      className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      value={tradeType}
                      onChange={(e) => setTradeType(e.target.value)}
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full p-2 rounded bg-gray-700 text-white pr-16 focus:ring-2 focus:ring-blue-500 transition-all"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        placeholder="0.00"
                        step="any"
                        min="0"
                      />
                      <div className="absolute right-3 top-2 text-gray-400">
                        {selectedCrypto.symbol.toUpperCase()}
                      </div>
                    </div>
                    {tradeAmount && !isNaN(tradeAmount) && (
                      <div className="text-sm text-gray-400 mt-1">
                        ≈ $
                        {formatCurrency(
                          parseFloat(tradeAmount) * selectedCrypto.current_price
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-end">
                    <button
                      className={`w-full py-2 px-4 rounded transition-all ${
                        tradeType === "buy"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      } disabled:opacity-50`}
                      onClick={executeTrade}
                      disabled={!tradeAmount}
                    >
                      {tradeType === "buy" ? "Buy" : "Sell"}{" "}
                      {selectedCrypto.symbol.toUpperCase()}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio summary */}
            <div className="bg-gray-800 rounded-lg p-4 transition-all duration-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Portfolio Summary</h2>
                <button
                  onClick={resetPortfolio}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  title="Reset portfolio"
                >
                  Reset Portfolio
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400">Cash Balance</div>
                  <div className="text-2xl font-bold">
                    ${formatCurrency(portfolio.balance)}
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400">Invested Value</div>
                  <div className="text-2xl font-bold">
                    ${formatCurrency(calculatePortfolioValue())}
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400">Total Value</div>
                  <div className="text-2xl font-bold">
                    $
                    {formatCurrency(
                      portfolio.balance + calculatePortfolioValue()
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded ${
                    calculateTotalRealizedProfitLoss() >= 0
                      ? "bg-green-900"
                      : "bg-red-900"
                  }`}
                >
                  <div className="text-gray-300">Realized P/L</div>
                  <div
                    className={`text-2xl font-bold ${
                      calculateTotalRealizedProfitLoss() >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    $
                    {formatCurrency(
                      Math.abs(calculateTotalRealizedProfitLoss())
                    )}
                    <span className="text-sm ml-2">
                      (
                      {calculateTotalRealizedProfitLoss() >= 0
                        ? "Profit"
                        : "Loss"}
                      )
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">Your Holdings</h3>
              {Object.keys(portfolio.holdings).filter(
                (id) => portfolio.holdings[id] > 0
              ).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Coin</th>
                        <th className="text-right py-2">Amount</th>
                        <th className="text-right py-2">Avg Buy Price</th>
                        <th className="text-right py-2">Current Value</th>
                        <th className="text-right py-2">Unrealized P/L</th>
                        <th className="text-right py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(portfolio.holdings)
                        .filter(([_, amount]) => amount > 0)
                        .map(([cryptoId, amount]) => {
                          const crypto = cryptos.find((c) => c.id === cryptoId);
                          if (!crypto) return null;
                          const value = amount * crypto.current_price;
                          const profitLoss = calculateProfitLoss(
                            cryptoId,
                            amount
                          );
                          const profitLossPercentage =
                            (profitLoss / (value - profitLoss)) * 100;
                          const avgBuyPrice =
                            calculateAverageBuyPrice(cryptoId);

                          return (
                            <tr
                              key={cryptoId}
                              className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                            >
                              <td className="py-2 flex items-center">
                                <img
                                  src={crypto.image}
                                  alt={crypto.name}
                                  className="w-5 h-5 mr-2"
                                />
                                <span
                                  className="cursor-pointer hover:text-blue-400"
                                  onClick={() => setSelectedCrypto(crypto)}
                                >
                                  {crypto.name} ({crypto.symbol.toUpperCase()})
                                </span>
                              </td>
                              <td className="text-right py-2">
                                {formatCurrency(amount, 0, 8)}
                              </td>
                              <td className="text-right py-2">
                                ${formatCurrency(avgBuyPrice)}
                              </td>
                              <td className="text-right py-2">
                                ${formatCurrency(value)}
                              </td>
                              <td
                                className={`text-right py-2 ${
                                  profitLoss >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                ${formatCurrency(Math.abs(profitLoss))}
                                <br />
                                <span className="text-xs">
                                  ({profitLossPercentage.toFixed(2)}%)
                                </span>
                              </td>
                              <td className="text-right py-2">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => sellCrypto(cryptoId, amount)}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                                    title="Sell all"
                                  >
                                    Sell All
                                  </button>
                                  <button
                                    onClick={() =>
                                      sellCrypto(cryptoId, amount / 2)
                                    }
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                                    title="Sell half"
                                  >
                                    Sell Half
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">
                  You don't have any holdings yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
