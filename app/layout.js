import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Informative Journal",
  description:
    "A News Website with AI Driven Platform with Gamfication and Rewards",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  // Open Graph metadata
  openGraph: {
    title: "Informative Journal",
    description:
      "A News Website with AI Driven Platform with Gamfication and Rewards",
    url: "informativejournal.vercel.app",
    siteName: "Informative Journal",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
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
        </main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
