import CategoryPage from "@/components/CategoryPage";
import axios from "axios";

// This function generates dynamic metadata using axios
export async function generateMetadata({ params }) {
  const { category } = await params;

  try {
    const response = await axios.get(
      `https://informativejournal-backend.vercel.app/articles/${category}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        timeout: 10000,
      }
    );

    const data = response.data;

    // Extract category name for better formatting
    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1);

    return {
      title: `${formattedCategory} | newwss.com`,
      description:
        data.description ||
        `Latest ${category} news and updates from newwss.com.`,
      keywords: [category, "news", "updates", "newwss.com"],
      openGraph: {
        title: data.title || `${formattedCategory} News`,
        description: data.description || `Latest ${category} news and updates.`,
        url: `https://www.newwss.com/${category}`,
        siteName: "newwss.com",
        type: "website",
        logo: "https://newwss.com/logo.png",
        images: [
          {
            url: "https://newwss.com/logo.png",
            width: 1200,
            height: 630,
            alt: `${formattedCategory} category image`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${formattedCategory} News`,
        description: `Latest ${category} news and updates.`,
        images: ["https://newwss.com/logo.png"],
        site: "@newwss", 
      },
      alternates: {
        canonical: `https://www.newwss.com/${category}`,
      },
    };
  } catch (err) {
    console.error("Metadata error:", err.message);

    // Enhanced fallback with formatted category name
    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1);

    return {
      title: `${formattedCategory} | newwss.com`,
      description: `Explore the latest ${category} news and updates from newwss.com.`,
      openGraph: {
        title: `${formattedCategory} News`,
        description: `Explore the latest ${category} news and updates.`,
        url: `https://www.newwss.com/${category}`,
        images: [
          {
            url: "https://newwss.com/logo.png",
            width: 1200,
            height: 630,
            alt: `${formattedCategory} news`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${formattedCategory} News`,
        description: `Explore the latest ${category} news and updates.`,
        images: ["https://newwss.com/logo.png"],
      },
    };
  }
}

// The actual page rendering the component
export default async function Page({ params }) {
  const { category } = await params;
  let categoryData = null;

  try {
    const response = await axios.get(
      `https://informativejournal-backend.vercel.app/articles/${category}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        timeout: 10000,
      }
    );
    categoryData = response.data;
  } catch (error) {
    console.error("Error fetching category data:", error.message);
  }

  return (
    <div>
      <CategoryPage category={category} data={categoryData} />
    </div>
  );
}
