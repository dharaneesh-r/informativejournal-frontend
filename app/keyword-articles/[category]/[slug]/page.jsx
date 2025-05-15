"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";

export default function ArticlePage() {
  const params = useParams();
  const { category, slug } = params;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category || !slug) return;

    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `https://informativejournal-backend.vercel.app/keyword-articles/${category}/${slug}`
        );
        setArticle(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch article"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [category, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Article not found
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} | Newwss</title>
        <meta name="description" content={article.description} />
        <meta name="keywords" content={article.seokeywords.join(", ")} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {article.title}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Published on {new Date(article.createdAt).toLocaleDateString()}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Image */}
          {article.image && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Article Description */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700 leading-relaxed">
              {article.description}
            </p>
          </div>

          {/* Key Points */}
          {article.keypoints && article.keypoints[0].points.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-6 mb-12 border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                Key Takeaways
              </h2>
              <ul className="space-y-3">
                {article.keypoints[0].points.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mt-1 mr-2">
                      <svg
                        className="h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Content Sections */}
          <div className="space-y-12">
            {article.content.map((section, index) => (
              <section key={section._id} className="group">
                <div className="flex items-start">
                  <div className="hidden md:flex items-center justify-center mr-6 -ml-10 mt-1 w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold group-hover:bg-blue-200 transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    {section.image && (
                      <div className="float-right ml-6 mb-4 w-full sm:w-1/2 md:w-1/3">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    <div className="prose max-w-none text-gray-700">
                      <p>{section.description}</p>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* SEO Keywords */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Tags:</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {article.seokeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
