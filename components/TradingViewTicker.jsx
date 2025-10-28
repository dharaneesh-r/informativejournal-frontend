"use client";
import { memo } from "react";
import { TradingViewTickerWidget } from "./TradingViewWidget";

const TradingViewTicker = memo(function TradingViewTicker() {
  return (
    <div className="mb-4 bg-white rounded-lg p-2 border border-gray-200 overflow-hidden">
      <TradingViewTickerWidget 
        symbols={[
          "INDEX:SPX",
          "INDEX:DJI",
          "NASDAQ:IXIC",
          "NASDAQ:AAPL",
          "NASDAQ:MSFT",
          "NASDAQ:GOOGL",
          "NYSE:AMZN",
          "NASDAQ:META",
          "NASDAQ:NVDA",
          "NASDAQ:NFLX",
          "NASDAQ:TSLA",
          "NYSE:JPM",
          "NYSE:BAC",
          "NYSE:V",
          "NYSE:JNJ",
          "NYSE:WMT",
          "NYSE:DIS",
          "NYSE:HD"
        ]}
      />
    </div>
  );
});

export default TradingViewTicker;

