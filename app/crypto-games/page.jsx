import CryptoTradingPlatform from "@/components/CryptoGames";
import React from "react";

export const metadata = {
  title: "Crypto Trading Platform | Trade Bitcoin, Ethereum & More | Newwss",
  description:
    "Join our crypto trading platform to trade Bitcoin, Ethereum, and other cryptocurrencies in real-time. Access live charts, market insights, and instant trades. Get started today on Newwss.",
  keywords:
    "crypto trading platform, trade bitcoin, trade ethereum, cryptocurrency market, crypto trading, bitcoin prices, real-time crypto trading, buy and sell crypto, crypto charts, Newwss, Cryptocurrency Paper Trading",
  author: "Newwss",
  openGraph: {
    title: "Crypto Trading Platform | Trade Bitcoin, Ethereum & More | Newwss",
    description:
      "Join our crypto trading platform to trade Bitcoin, Ethereum, and other cryptocurrencies in real-time. Access live charts, market insights, and instant trades.",
    url: "https://newwss.com/crypto-games",
    site_name: "Newwss",
    type: "website",
    images: [
      {
        url: "https://newwss.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Crypto Trading on Newwss",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@newwss",
    title: "Crypto Trading Platform | Trade Bitcoin, Ethereum & More | Newwss",
    description:
      "Join our crypto trading platform to trade Bitcoin, Ethereum, and other cryptocurrencies in real-time. Access live charts, market insights, and instant trades.",
    image: "https://newwss.com/logo.png",
  },
};

export default function Page() {
  return (
    <>
      <CryptoTradingPlatform />
    </>
  );
}
