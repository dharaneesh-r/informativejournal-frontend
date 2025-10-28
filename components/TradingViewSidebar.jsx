"use client";
import { memo } from "react";
import TradingViewWidget from "./TradingViewWidget";

const TradingViewSidebar = memo(function TradingViewSidebar() {
  return (
    <>
      {/* Technology Stocks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
          Technology
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Apple (AAPL)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:AAPL" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Microsoft (MSFT)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:MSFT" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Google (GOOGL)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:GOOGL" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Amazon (AMZN)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:AMZN" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Meta (META)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:META" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Nvidia (NVDA)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:NVDA" />
            </div>
          </div>
        </div>
      </div>

      {/* Entertainment & Streaming */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
          Entertainment
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Netflix (NFLX)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:NFLX" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Disney (DIS)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:DIS" />
            </div>
          </div>
        </div>
      </div>

      {/* Automotive */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
          Automotive
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Tesla (TSLA)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NASDAQ:TSLA" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Ford (F)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:F" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              General Motors (GM)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:GM" />
            </div>
          </div>
        </div>
      </div>

      {/* Finance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
          Finance
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              JPMorgan Chase (JPM)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:JPM" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Bank of America (BAC)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:BAC" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Visa (V)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:V" />
            </div>
          </div>
        </div>
      </div>

      {/* Healthcare */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
          Healthcare
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Johnson & Johnson (JNJ)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:JNJ" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Pfizer (PFE)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:PFE" />
            </div>
          </div>
        </div>
      </div>

      {/* Retail */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
          Retail
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Walmart (WMT)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:WMT" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Home Depot (HD)
            </p>
            <div className="h-auto min-h-[450px] relative overflow-hidden rounded bg-white dark:bg-[#1e222d]">
              <TradingViewWidget symbol="NYSE:HD" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default TradingViewSidebar;
