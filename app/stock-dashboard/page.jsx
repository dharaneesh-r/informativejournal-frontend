import StockDashboard from '@/components/StockDashboard';
import React from 'react';

export async function generateMetadata() {
  return {
    title: 'Stock Market Dashboard | Newwss',
    description: 'Stay updated with real-time stock market trends, analysis, and insights through our Stock Dashboard at Newwss.',
    keywords: ['stock market', 'live stocks', 'market analysis', 'Newwss', 'stock dashboard'],
    openGraph: {
      title: 'Stock Market Dashboard | Newwss',
      description: 'Live updates and expert analysis of stock market movements.',
      url: 'https://newwss.com/stock-dashboard',
      siteName: 'Newwss',
      images: [
        {
          url: 'https://www.newwss.com/logo.png',
          width: 1200,
          height: 630,
          alt: 'Stock Dashboard - Newwss',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Stock Market Dashboard | Newwss',
      description: 'Stay informed with our stock dashboard — real-time updates and trends.',
      images: ['https://www.newwss.com/logo.png'], 
    },
  };
}

// 2. Page component
export default function StockPage() {
  return (
    <div>
      <StockDashboard />
    </div>
  );
}
