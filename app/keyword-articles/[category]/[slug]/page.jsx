"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  MessageCircle,
  Clock,
  User,
  Bookmark,
  ChevronRight,
  Eye,
  Menu,
  X,
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
  const [activeSection, setActiveSection] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const sectionRefs = useRef([]);

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

  // Track active section for TOC highlighting
  useEffect(() => {
    if (!article || article.content.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header
      let currentSection = 0;
      let minDistance = Infinity;

      sectionRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          
          // Check if section is in viewport
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            const distance = Math.abs(scrollPosition - elementTop);
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = index;
            }
          }
        }
      });

      // Fallback: find closest section to scroll position
      if (minDistance === Infinity) {
        sectionRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const distance = Math.abs(scrollPosition - elementTop);
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = index;
            }
          }
        });
      }

      setActiveSection(currentSection);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [article]);

  const scrollToSection = (index) => {
    if (sectionRefs.current[index]) {
      // Temporarily disable scroll tracking to avoid conflicts
      const element = sectionRefs.current[index];
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 120; // Account for sticky header

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Update active section immediately
      setActiveSection(index);
      setTocOpen(false);
    }
  };

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

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
        {/* Navigation Breadcrumbs */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center justify-between" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-500 mx-2" />
                  <Link
                    href={`/category/${category}`}
                    className="text-gray-300 hover:text-white capitalize transition-colors"
                  >
                    {category}
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-500 mx-2" />
                  <span className="text-white font-medium truncate max-w-xs">
                    {article.title}
                  </span>
                </li>
              </ol>
              
              {/* Mobile TOC Toggle */}
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Toggle table of contents"
              >
                {tocOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Fixed Left Sidebar - Table of Contents */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-gray-700">
                  Table of Contents
                </h2>
                <nav className="space-y-2">
                  {article.content.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToSection(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium border-l-4 ${
                        activeSection === index
                          ? "bg-blue-600 text-white shadow-xl border-l-blue-300 scale-[1.02]"
                          : "text-gray-300 hover:text-white hover:bg-gray-700/50 border-l-transparent hover:border-l-gray-600"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            activeSection === index
                              ? "bg-white text-blue-600 shadow-md"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className={`line-clamp-2 ${activeSection === index ? "font-semibold" : ""}`}>
                          {section.title}
                        </span>
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Mobile TOC Overlay */}
            {tocOpen && (
              <div
                className="fixed inset-0 bg-black/60 z-50 lg:hidden"
                onClick={() => setTocOpen(false)}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-80 bg-gray-900 p-6 overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Table of Contents</h2>
                    <button
                      onClick={() => setTocOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <nav className="space-y-2">
                    {article.content.map((section, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToSection(index)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium border-l-4 ${
                          activeSection === index
                            ? "bg-blue-600 text-white shadow-xl border-l-blue-300 scale-[1.02]"
                            : "text-gray-300 hover:text-white hover:bg-gray-800 border-l-transparent hover:border-l-gray-600"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              activeSection === index
                                ? "bg-white text-blue-600 shadow-md"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className={`line-clamp-2 ${activeSection === index ? "font-semibold" : ""}`}>
                            {section.title}
                          </span>
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content Column */}
            <div className="flex-1 min-w-0 lg:max-w-4xl pb-20 lg:pb-8">
              {/* Article Header */}
              <header className="mb-12">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-blue-600 text-white uppercase tracking-wider">
                    {category}
                  </span>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {readingTime}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Eye className="h-4 w-4 mr-2" />
                    {viewCount} {viewCount === 1 ? "view" : "views"}
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                  {article.title}
                </h1>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-800">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-semibold text-white">
                        Newwss Team
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        {new Date(article.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleLike}
                      className={`rounded-full p-3 transition-all duration-200 ${
                        liked
                          ? "bg-red-500 text-white shadow-lg scale-105"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                      title="Like this article"
                    >
                      <Heart
                        className={`h-5 w-5 ${liked ? "fill-current" : ""}`}
                      />
                    </button>

                    <button
                      onClick={handleDislike}
                      className={`rounded-full p-3 transition-all duration-200 ${
                        disliked
                          ? "bg-gray-600 text-white shadow-lg scale-105"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                      title="Dislike this article"
                    >
                      <ThumbsDown className="h-5 w-5" />
                    </button>

                    <button
                      onClick={handleBookmark}
                      className={`rounded-full p-3 transition-all duration-200 ${
                        bookmarked
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
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
                        className="rounded-full p-3 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-200"
                        title="Share this article"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>

                      {shareOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-gray-800 border border-gray-700 z-10 overflow-hidden">
                          <div
                            className="py-2"
                            role="menu"
                            aria-orientation="vertical"
                          >
                            <button
                              onClick={() => handleShare("facebook")}
                              className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                            >
                              <Facebook className="h-5 w-5 mr-3 text-blue-400" />
                              Facebook
                            </button>
                            <button
                              onClick={() => handleShare("twitter")}
                              className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                            >
                              <Twitter className="h-5 w-5 mr-3 text-blue-400" />
                              Twitter
                            </button>
                            <button
                              onClick={() => handleShare("linkedin")}
                              className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                            >
                              <Linkedin className="h-5 w-5 mr-3 text-blue-400" />
                              LinkedIn
                            </button>
                            <button
                              onClick={() => handleShare("whatsapp")}
                              className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                            >
                              <MessageCircle className="h-5 w-5 mr-3 text-green-400" />
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleShare("copy")}
                              className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                            >
                              <Copy className="h-5 w-5 mr-3 text-gray-400" />
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
                <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl relative aspect-video border border-gray-800">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              )}

              {/* Article Description */}
              <div className="mb-12 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-xl">
                <p className="text-white leading-relaxed text-xl sm:text-2xl font-light">
                  {article.description}
                </p>
              </div>

              {/* Key Points - Show all key points dynamically if available */}
              {article.content?.[0]?.keypoints?.[0]?.points?.length > 0 && (
                <div className="bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl p-8 mb-12 border border-blue-700/50 shadow-2xl backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <svg
                      className="h-7 w-7 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    Key Takeaways
                  </h2>
                  <ul className="space-y-5">
                    {article.content[0].keypoints[0].points.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 mt-1 mr-4 bg-blue-600 rounded-full p-2">
                          <svg
                            className="h-5 w-5 text-white"
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
                        <span className="text-white font-medium text-lg leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
              </div>
              )}

              {/* Article Content Sections - Show All */}
              <div className="space-y-16">
                {article.content.map((section, index) => (
                  <section
                    key={section._id || index}
                    ref={(el) => (sectionRefs.current[index] = el)}
                    id={`section-${index}`}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-2xl border border-gray-700 scroll-mt-32"
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 pb-4 border-b border-gray-700">
                      {section.title}
                    </h2>

                    <div className="prose prose-invert max-w-none">
                      {section.image && (
                        <div className="mb-8 rounded-xl overflow-hidden shadow-xl border border-gray-700">
                          <img
                            src={section.image}
                            alt={section.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      <div className="text-lg sm:text-xl leading-relaxed text-gray-200 space-y-6">
                        {section.description.split("\n").map((paragraph, i) => (
                          paragraph.trim() && (
                            <p key={i} className="text-white/90 leading-relaxed">
                            {paragraph}
                          </p>
                          )
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              {/* Fixed Bottom Bar (Mobile) */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-4 py-3 flex justify-between items-center z-30">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    className={`flex flex-col items-center transition-colors ${
                      liked ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    <Heart
                      className={`h-6 w-6 ${liked ? "fill-current" : ""}`}
                    />
                    <span className="text-xs mt-1">Like</span>
                  </button>

                  <button
                    onClick={handleDislike}
                    className={`flex flex-col items-center transition-colors ${
                      disliked ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    <ThumbsDown className="h-6 w-6" />
                    <span className="text-xs mt-1">Dislike</span>
                  </button>
                </div>

                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleBookmark}
                    className={`flex flex-col items-center transition-colors ${
                      bookmarked ? "text-blue-400" : "text-gray-400"
                    }`}
                  >
                    <Bookmark
                      className={`h-6 w-6 ${bookmarked ? "fill-current" : ""}`}
                    />
                    <span className="text-xs mt-1">Save</span>
                  </button>

                  <button
                    onClick={() => setShareOpen(!shareOpen)}
                    className="flex flex-col items-center text-gray-400 transition-colors hover:text-white"
                  >
                    <Share2 className="h-6 w-6" />
                    <span className="text-xs mt-1">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="hidden xl:block w-80 flex-shrink-0">
              {/* Related Articles */}
              <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-8 sticky top-24 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
                  Related Articles
                </h3>

                {relatedArticles.length > 0 ? (
                  <div className="space-y-6">
                    {relatedArticles.map((relArticle) => (
                      <Link
                        href={`/keyword-articles/${category}/${relArticle.slug}`}
                        key={relArticle._id}
                        className="flex items-start group"
                      >
                        {relArticle.image ? (
                          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                            <img
                              src={relArticle.image}
                              alt={relArticle.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center border border-gray-700">
                            <span className="text-white font-bold text-lg">
                              {relArticle.title.charAt(0)}
                            </span>
                          </div>
                        )}

                        <div className="ml-4 flex-1">
                          <h4 className="text-base font-semibold text-white group-hover:text-blue-400 transition duration-200 line-clamp-2">
                            {relArticle.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-2">
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
                  <p className="text-gray-400 italic">
                    No related articles found
                  </p>
                )}
              </div>

              {/* Tags/Keywords */}
              <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-8 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.seokeywords.map((keyword, index) => (
                    <Link
                      href={`/search?q=${encodeURIComponent(keyword)}`}
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white transition duration-200"
                    >
                      {keyword}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl text-white border border-blue-500/50">
                <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Get the latest articles delivered straight to your inbox.
                </p>

                <form className="space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm placeholder-blue-100 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition duration-200 shadow-lg"
                  >
                    Subscribe
                  </button>
                </form>

                <p className="text-xs text-blue-100 mt-3">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
