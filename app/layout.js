import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"

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
  title: "Newwss ",
  viewport: "width=device-width, initial-scale=1",
  logo: `${baseUrl}/logo.png`,
  description:
    "A News Website with AI-Driven Platform with Gamification and Rewards",
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
    title: "Newwss",
    description:
      "A News Website with AI-Driven Platform with Gamification and Rewards",
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
    title: "Newwss",
    description:
      "Stay updated with AI-curated news and earn rewards while reading.",
    images: [`${baseUrl}/logo.png`],
    site: "@newwss",
  },
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="monetag" content="8c5ff2a76e2ab74d7db479e998e307a5" />
        <script src="https://kulroakonsu.net/88/tag.min.js" data-zone="143597" async data-cfasync="false"></script>
        <meta name="google-adsense-account" content="ca-pub-7599014130116297"></meta>
      </head>
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
