import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://www.newwss.com/";

export const metadata = {
  title: "Newwss – Breaking News, Finance, Politics, Sports & World Headlines ",
  viewport: "width=device-width, initial-scale=1",
  logo: `${baseUrl}/logo.png`,
  description:
    "Stay updated with Newwss – your trusted source for breaking news, finance updates, political headlines, sports scores, world affairs, and trending stories. Fresh content, daily.",
  keywords: [
    "AI News",
    "Gamification",
    "News Website",
    "Rewards",
    "Newwss",
    "breaking news",
    "top news",
    "US",
    "worldwide",
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: `${baseUrl}/logo.png`,
    shortcut: `${baseUrl}/logo.png`,
    apple: `${baseUrl}/logo.png`,
  },
  openGraph: {
    title:
      "Newwss – Breaking News, Finance, Politics, Sports & World Headlines",
    description:
      "Stay updated with Newwss – your trusted source for breaking news, finance updates, political headlines, sports scores, world affairs, and trending stories. Fresh content, daily.",
    url: baseUrl,
    siteName: "Newwss",
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 800,
        height: 600,
        alt: "Newwss Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Newwss – Breaking News, Finance, Politics, Sports & World Headlines",
    description:
      "Stay updated with Newwss – your trusted source for breaking news, finance updates, political headlines, sports scores, world affairs, and trending stories. Fresh content, daily.",
    images: [`${baseUrl}/logo.png`],
    site: "@newwss",
  },
  other: {
    "google-site-verification": "9375940519845683",
    "google-adsense-account": "ca-pub-9375940519845683",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header>
          <Navbar />
        </header>
        <main className="my-15">
          {children}
          <SpeedInsights />
          <Analytics />
        </main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
