"use client";
import { useEffect, useRef, useState } from "react";

export default function TradingViewWidget({
  symbol,
  interval = "D",
  theme,
  style = "1",
}) {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(theme || "light");

  // Detect dark mode from document or listen to theme changes
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setCurrentTheme(isDark ? "dark" : "light");

      // Update overlay background color based on theme
      if (overlayRef.current) {
        overlayRef.current.style.backgroundColor = isDark
          ? "#1e222d"
          : "#ffffff";
      }
    };

    // Initial theme check
    updateTheme();

    // Listen to theme change events
    window.addEventListener("themechange", updateTheme);

    // Also watch for class changes on html element
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("themechange", updateTheme);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !symbol) return;

    // Clear any existing content
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;

    const widgetTheme = theme || currentTheme;

    script.innerHTML = JSON.stringify({
      symbols: [[symbol]],
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale: "en",
      colorTheme: widgetTheme,
      autosize: true,
      showVolume: false,
      hideDateRanges: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      lineColor: "rgba(41, 98, 255, 1)",
      bottomColor: "rgba(41, 98, 255, 0.3)",
      topColor: "rgba(41, 98, 255, 0.05)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      fontColor: "#787B86",
    });

    containerRef.current.appendChild(script);

    // Wait for iframe to load and position overlay correctly
    const checkIframe = setInterval(() => {
      const iframe = containerRef.current?.querySelector("iframe");
      if (iframe && overlayRef.current) {
        // Ensure overlay is positioned correctly over the iframe
        overlayRef.current.style.display = "block";
        clearInterval(checkIframe);
      }
    }, 100);

    // Cleanup after 5 seconds if iframe doesn't load
    setTimeout(() => clearInterval(checkIframe), 5000);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      clearInterval(checkIframe);
    };
  }, [symbol, currentTheme, theme]);

  if (!symbol) return null;

  const overlayBg = currentTheme === "dark" ? "#1e222d" : "#ffffff";

  return (
    <div
      className="tradingview-widget-container w-full relative"
      style={{ minHeight: "450px", height: "auto" }}
      ref={containerRef}
    >
      <div className="tradingview-widget-container__widget relative"></div>
      {/* Solid overlay to cover TradingView branding watermark at bottom-left that overlaps timeframe buttons */}
      <div
        ref={overlayRef}
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: "90px",
          height: "75px",
          backgroundColor: overlayBg,
          zIndex: 9999,
          borderTopRightRadius: "8px",
        }}
      ></div>
    </div>
  );
}

export function TradingViewTickerWidget({ symbols = [], theme }) {
  const containerRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(theme || "light");

  // Detect dark mode from document or listen to theme changes
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setCurrentTheme(isDark ? "dark" : "light");
    };

    // Initial theme check
    updateTheme();

    // Listen to theme change events
    window.addEventListener("themechange", updateTheme);

    // Also watch for class changes on html element
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("themechange", updateTheme);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || symbols.length === 0) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;

    const widgetTheme = theme || currentTheme;

    script.innerHTML = JSON.stringify({
      symbols: symbols.map((s) => ({
        proName: s,
        title: s.split(":")[1] || s,
      })),
      showSymbolLogo: true,
      colorTheme: widgetTheme,
      isTransparent: false,
      displayMode: "adaptive",
      locale: "en",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbols, currentTheme, theme]);

  if (symbols.length === 0) return null;

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
