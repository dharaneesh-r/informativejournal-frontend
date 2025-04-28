import FinancialCalculators from '@/components/FinancialCalculators';
import React from 'react';

// 1. SEO metadata function
export async function generateMetadata() {
  return {
    title: 'Financial Calculators | Newwss',
    description: 'Use our free financial calculators to plan your investments, savings, loans, and more. Accurate and easy-to-use tools to manage your finances better.',
    keywords: ['financial calculators', 'investment calculator', 'loan calculator', 'savings calculator', 'retirement planning', 'Newwss'],
    openGraph: {
      title: 'Financial Calculators | Newwss',
      description: 'Smart tools to calculate investments, savings, loans, and financial planning easily.',
      url: 'https://newwss.com/financial-calculators', 
      siteName: 'Newwss',
      images: [
        {
          url: 'https://newwss.com/logo.png', 
          width: 1200,
          height: 630,
          alt: 'Financial Calculators - Newwss',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Financial Calculators | Newwss',
      description: 'Plan your finances smartly using our free calculators for investments, savings, and loans.',
      images: ['https://newwss.com/logo.png'],
    },
  };
}

// 2. Page component
export default function FinancialCalculatorsPage() {
  return (
    <div>
      <FinancialCalculators />
    </div>
  );
}
