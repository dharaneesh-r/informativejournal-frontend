"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import {
  Heart,
  ThumbsDown,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle, // Replacing WhatsApp with MessageCircle
  Clock,
  User,
  Bookmark,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import NotFound from "@/app/NotFound";
import Loading from "@/app/loading";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { category, slug } = params;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [readingTime, setReadingTime] = useState("5 min read");
  const [viewCount, setViewCount] = useState(0);

  // Handle likes and dislikes with localStorage
  useEffect(() => {
    if (!article) return;

    // Load preferences from localStorage
    const storedLiked = localStorage.getItem(`liked-${article._id}`);
    const storedDisliked = localStorage.getItem(`disliked-${article._id}`);
    const storedBookmarked = localStorage.getItem(`bookmarked-${article._id}`);

    if (storedLiked) setLiked(JSON.parse(storedLiked));
    if (storedDisliked) setDisliked(JSON.parse(storedDisliked));
    if (storedBookmarked) setBookmarked(JSON.parse(storedBookmarked));

    // Increment view count
    const articleViews = JSON.parse(
      localStorage.getItem("articleViews") || "{}"
    );
    const currentViews = articleViews[article._id] || 0;

    if (!currentViews) {
      articleViews[article._id] = 1;
      localStorage.setItem("articleViews", JSON.stringify(articleViews));
    }

    setViewCount(currentViews + 1);

    // Calculate reading time based on content length
    const words = article.content.reduce(
      (acc, section) => acc + (section.description || "").split(/\s+/).length,
      0
    );
    const time = Math.ceil(words / 200); // Average reading speed
    setReadingTime(`${time} min read`);
  }, [article]);

  useEffect(() => {
    if (!category || !slug) return;

    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `https://informativejournal-backend.vercel.app/keyword-articles/${category}/${slug}`
        );
        setArticle(response.data.data);

        // Fetch related articles
        try {
          const relatedRes = await axios.get(
            `https://informativejournal-backend.vercel.app/keyword-articles/${category}?limit=4`
          );

          // Filter out current article
          const filtered = relatedRes.data.data.filter(
            (a) => a._id !== response.data.data._id
          );
          setRelatedArticles(filtered.slice(0, 3));
        } catch (err) {
          console.error("Failed to fetch related articles:", err);
        }
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

  const handleLike = () => {
    if (disliked) {
      setDisliked(false);
      localStorage.setItem(`disliked-${article._id}`, JSON.stringify(false));
    }

    const newLiked = !liked;
    setLiked(newLiked);
    localStorage.setItem(`liked-${article._id}`, JSON.stringify(newLiked));

    if (newLiked) {
      toast.success("Thanks for liking this article!");
    }
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
      localStorage.setItem(`liked-${article._id}`, JSON.stringify(false));
    }

    const newDisliked = !disliked;
    setDisliked(newDisliked);
    localStorage.setItem(
      `disliked-${article._id}`,
      JSON.stringify(newDisliked)
    );

    if (newDisliked) {
      toast.error("We'll improve our content based on your feedback.");
    }
  };

  const handleBookmark = () => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    localStorage.setItem(
      `bookmarked-${article._id}`,
      JSON.stringify(newBookmarked)
    );

    // Store bookmarked articles list
    const bookmarkedArticles = JSON.parse(
      localStorage.getItem("bookmarkedArticles") || "[]"
    );

    if (newBookmarked) {
      bookmarkedArticles.push({
        id: article._id,
        title: article.title,
        category,
        slug,
        image: article.image,
        date: new Date().toISOString(),
      });
      toast.success("Article saved to bookmarks!");
    } else {
      const index = bookmarkedArticles.findIndex((a) => a.id === article._id);
      if (index > -1) bookmarkedArticles.splice(index, 1);
      toast.success("Article removed from bookmarks");
    }

    localStorage.setItem(
      "bookmarkedArticles",
      JSON.stringify(bookmarkedArticles)
    );
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article.title;

    let shareUrl;

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          title + ": " + url
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        setShareOpen(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      setShareOpen(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NotFound />
      </div>
    );
  }

  if (!article) {
    return (
      <div>
        <NotFound />
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

      <Toaster position="bottom-center" />

      <div className="min-h-screen bg-gray-50">
        {/* Navigation Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Link
                    href={`/category/${category}`}
                    className="ml-2 text-gray-500 hover:text-gray-700 capitalize"
                  >
                    {category}
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="ml-2 text-gray-900 font-medium truncate max-w-xs">
                    {article.title}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-8">
              {/* Article Header */}
              <header className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                    {category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {readingTime}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Eye className="h-4 w-4 mr-1" />
                    {viewCount} {viewCount === 1 ? "view" : "views"}
                  </div>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {article.title}
                </h1>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Newwss Team
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLike}
                      className={`rounded-full p-2 ${
                        liked
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } transition duration-200`}
                      title="Like this article"
                    >
                      <Heart
                        className={`h-5 w-5 ${liked ? "fill-current" : ""}`}
                      />
                    </button>

                    <button
                      onClick={handleDislike}
                      className={`rounded-full p-2 ${
                        disliked
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } transition duration-200`}
                      title="Dislike this article"
                    >
                      <ThumbsDown className="h-5 w-5" />
                    </button>

                    <button
                      onClick={handleBookmark}
                      className={`rounded-full p-2 ${
                        bookmarked
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } transition duration-200`}
                      title={
                        bookmarked ? "Remove bookmark" : "Bookmark this article"
                      }
                    >
                      <Bookmark
                        className={`h-5 w-5 ${
                          bookmarked ? "fill-current" : ""
                        }`}
                      />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShareOpen(!shareOpen)}
                        className="rounded-full p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 transition duration-200"
                        title="Share this article"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>

                      {shareOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                          >
                            <button
                              onClick={() => handleShare("facebook")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Facebook className="h-5 w-5 mr-3 text-blue-600" />
                              Facebook
                            </button>
                            <button
                              onClick={() => handleShare("twitter")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Twitter className="h-5 w-5 mr-3 text-blue-400" />
                              Twitter
                            </button>
                            <button
                              onClick={() => handleShare("linkedin")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Linkedin className="h-5 w-5 mr-3 text-blue-800" />
                              LinkedIn
                            </button>
                            <button
                              onClick={() => handleShare("whatsapp")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <WhatsApp className="h-5 w-5 mr-3 text-green-500" />
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleShare("copy")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Copy className="h-5 w-5 mr-3 text-gray-500" />
                              Copy Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              {article.image && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-lg relative aspect-video">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30"></div>
                </div>
              )}

              {/* Article Description */}
              <div className="prose prose-lg max-w-none mb-12 bg-white p-8 rounded-xl shadow-sm">
                <p className="text-gray-700 leading-relaxed text-xl">
                  {article.description}
                </p>
              </div>

              {/* Key Points */}
              {/* Key Points */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-12 border-l-4 border-blue-500 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-800 mb-6">
                  Key Takeaways
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 mt-1 mr-3 bg-blue-100 rounded-full p-1">
                      <svg
                        className="h-5 w-5 text-blue-600"
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
                    <span className="text-gray-700 font-medium">
                      Acquisition accounting is a set of formal guidelines
                      describing how assets, liabilities, non-controlling
                      interest and goodwill of an acquired company must be
                      reported by the purchaser.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 mt-1 mr-3 bg-blue-100 rounded-full p-1">
                      <svg
                        className="h-5 w-5 text-blue-600"
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
                    <span className="text-gray-700 font-medium">
                      The fair market value of the acquired company is allocated
                      between the net tangible and intangible assets portion of
                      the balance sheet of the buyer. Any resulting difference
                      is regarded as goodwill.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 mt-1 mr-3 bg-blue-100 rounded-full p-1">
                      <svg
                        className="h-5 w-5 text-blue-600"
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
                    <span className="text-gray-700 font-medium">
                      All business combinations must be treated as acquisitions
                      for accounting purposes.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Table of Contents */}
              <div className="bg-white rounded-xl p-6 mb-10 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Table of Contents
                </h2>
                <nav>
                  <ol className="space-y-2">
                    {article.content.map((section, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-3 flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                          {index + 1}
                        </span>
                        <a
                          href={`#section-${index}`}
                          className="text-blue-600 hover:text-blue-800 transition duration-200"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              {/* Article Content Sections */}
              <div className="space-y-12">
                {article.content.map((section, index) => (
                  <section
                    key={section._id}
                    id={`section-${index}`}
                    className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                      {section.title}
                    </h2>

                    <div className="prose max-w-none text-gray-700">
                      {section.image && (
                        <div className="float-right ml-6 mb-4 w-full sm:w-2/5 md:w-1/3">
                          <img
                            src={section.image}
                            alt={section.title}
                            className="rounded-lg shadow-md"
                          />
                        </div>
                      )}

                      <div className="text-lg leading-relaxed">
                        {section.description.split("\n").map((paragraph, i) => (
                          <p key={i} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              {/* Fixed Bottom Bar (Mobile) */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    className={`flex flex-col items-center ${
                      liked ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    <Heart
                      className={`h-6 w-6 ${liked ? "fill-current" : ""}`}
                    />
                    <span className="text-xs mt-1">Like</span>
                  </button>

                  <button
                    onClick={handleDislike}
                    className={`flex flex-col items-center ${
                      disliked ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    <ThumbsDown className="h-6 w-6" />
                    <span className="text-xs mt-1">Dislike</span>
                  </button>
                </div>

                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleBookmark}
                    className={`flex flex-col items-center ${
                      bookmarked ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    <Bookmark
                      className={`h-6 w-6 ${bookmarked ? "fill-current" : ""}`}
                    />
                    <span className="text-xs mt-1">Save</span>
                  </button>

                  <button
                    onClick={() => setShareOpen(!shareOpen)}
                    className="flex flex-col items-center text-gray-500"
                  >
                    <Share2 className="h-6 w-6" />
                    <span className="text-xs mt-1">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              {/* Related Articles */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                  Related Articles
                </h3>

                {relatedArticles.length > 0 ? (
                  <div className="space-y-6">
                    {relatedArticles.map((relArticle) => (
                      <Link
                        href={`/article/${category}/${relArticle.slug}`}
                        key={relArticle._id}
                        className="flex items-start group"
                      >
                        {relArticle.image ? (
                          <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
                            <img
                              src={relArticle.image}
                              alt={relArticle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-20 h-20 bg-blue-100 rounded-md flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {relArticle.title.charAt(0)}
                            </span>
                          </div>
                        )}

                        <div className="ml-4">
                          <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition duration-200 line-clamp-2">
                            {relArticle.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(relArticle.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No related articles found
                  </p>
                )}
              </div>

              {/* Tags/Keywords */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.seokeywords.map((keyword, index) => (
                    <Link
                      href={`/search?q=${encodeURIComponent(keyword)}`}
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition duration-200"
                    >
                      {keyword}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
                <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
                <p className="text-blue-100 mb-4">
                  Get the latest articles delivered straight to your inbox.
                </p>

                <form className="space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 placeholder-blue-100 text-white border border-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition duration-200"
                  >
                    Subscribe
                  </button>
                </form>

                <p className="text-xs text-blue-100 mt-3">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
