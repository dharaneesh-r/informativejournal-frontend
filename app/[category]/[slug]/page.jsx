import SlugPage from "@/components/SlugPage";
import React from "react";
import axios from "axios";
import { notFound } from "next/navigation";

// Generate dynamic SEO metadata for individual articles
export async function generateMetadata({ params }) {
  const { category, slug } = await params;

  try {
    const response = await axios.get(
      `https://informativejournal-backend.vercel.app/articles/${category}/${slug}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        timeout: 10000,
      }
    );

    const article = response.data.data;

    // Format category for better display
    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1);

    // Create SEO-optimized title
    const seoTitle = `${article.title} | ${formattedCategory} News`;

    // Create meta description (limit to 155-160 characters for SEO)
    const metaDescription =
      article.description ||
      `Read the latest ${category} news article on newwss.com. Stay updated with comprehensive coverage and analysis.`;

    const truncatedDescription =
      metaDescription.length > 160
        ? metaDescription.substring(0, 157) + "..."
        : metaDescription;

    // Extract keywords from title and content
    const keywords = [
      category,
      formattedCategory.toLowerCase(),
      "news",
      "latest news",
      "breaking news",
      "newwss.com",
      "news",
      ...(article.tags || []),
      ...(article.keywords || []),
    ];

    // Canonical URL
    const canonicalUrl = `https://www.newwss.com/${category}/${slug}`;

    return {
      title: seoTitle,
      description: truncatedDescription,
      keywords: keywords.join(", "),
      authors: article.author
        ? [{ name: "Dharaneesh R" }]
        : [{ name: "newwss.com" }],
      creator: article.author || "Dharaneesh R",
      publisher: "newwss.com",

      // Open Graph metadata for social sharing
      openGraph: {
        title: seoTitle,
        description: truncatedDescription,
        url: canonicalUrl,
        siteName: "newwss.com",
        type: "article",
        locale: "en_US",
        images: [
          {
            url: article.image || "https://newwss.com/logo.png",
            width: 1200,
            height: 630,
            alt: article.title,
            type: "image/jpeg",
          },
        ],
        // Article-specific Open Graph data
        article: {
          publishedTime:
            article.publishedAt || article.created_at || article.date,
          modifiedTime: article.updatedAt || article.updated_at,
          author: article.author || "Dharaneesh R",
          section: formattedCategory,
          tags: article.tags || [category],
        },
      },

      // Twitter Card metadata
      twitter: {
        card: "summary_large_image",
        site: "@newwss", // Your Twitter handle
        creator: article.author_twitter || "@newwss",
        title: article.title || seoTitle,
        description: truncatedDescription,
        images: [
          article.image ||
            article.featured_image ||
            "https://newwss.com/default-article.jpg",
        ],
      },

      // Additional SEO metadata
      alternates: {
        canonical: canonicalUrl,
      },

      // Robots meta
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // Additional metadata for news articles
      other: {
        "article:published_time": article.createdAt,
        "article:author": article.author || "newwss.com",
        "article:section": formattedCategory,
        news_keywords: keywords.slice(0, 10).join(", "),
      },
    };
  } catch (error) {
    console.error("Article metadata error:", error.message);

    // Enhanced fallback metadata
    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1);
    const fallbackTitle = `${formattedCategory} Article | newwss.com`;
    const fallbackDescription = `Read the latest ${category} news and updates on newwss.com. Stay informed with our comprehensive coverage.`;

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      keywords: [category, "news", "newwss.com"].join(", "),
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: `https://www.newwss.com/${category}/${slug}`,
        siteName: "newwss.com",
        type: "article",
        images: [
          {
            url: "https://newwss.com/default-article.jpg",
            width: 1200,
            height: 630,
            alt: fallbackTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
        images: ["https://www.newwss.com/logo.png"],
      },
      alternates: {
        canonical: `https://www.newwss.com/${category}/${slug}`,
      },
    };
  }
}

// Main page component
const page = async ({ params }) => {
  const { category, slug } = await params;

  // Fetch article data for the component
  let articleData = null;

  try {
    const response = await axios.get(
      `https://informativejournal-backend.vercel.app/articles/${category}/${slug}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        timeout: 10000,
      }
    );
    articleData = response.data;
  } catch (error) {
    console.error("Error fetching article data:", error.message);
    // Return 404 if article not found
    notFound();
  }

  // If no article data, return 404
  if (!articleData) {
    notFound();
  }

  return (
    <div>
      <SlugPage articleData={articleData} category={category} slug={slug} />
    </div>
  );
};

export default page;
