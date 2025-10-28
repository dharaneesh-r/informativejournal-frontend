"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import Loading from "./loading";
import NotFound from "./NotFound";
import Head from "next/head";
import GTag from "@/components/Gtag";
import ArticleCard from "@/components/ArticleCard";
import HeroArticle from "@/components/HeroArticle";
import SearchBar from "@/components/SearchBar";
import SpeechControls from "@/components/SpeechControls";
import TrendingSidebar from "@/components/TrendingSidebar";
import SavedArticlesPanel from "@/components/SavedArticlesPanel";
import AdsterraAd from "@/components/AdsterraAds";
import AdBanner from "@/components/BannerAds";
import TradingViewSidebar from "@/components/TradingViewSidebar";
import TradingViewTicker from "@/components/TradingViewTicker";
import DarkModeToggle from "@/components/DarkModeToggle";
import SavedArticlesButton from "@/components/SavedArticlesButton";
import { FaNewspaper, FaChartLine, FaGlobeAmericas } from "react-icons/fa";

export default function FeaturedPosts({ userId }) {
  const baseURL = "https://informativejournal-backend.vercel.app/articles";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [heroArticle, setHeroArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [showSavedArticles, setShowSavedArticles] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [hasMore, setHasMore] = useState(true);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [speechTriggerArticle, setSpeechTriggerArticle] = useState(null);

  const articleRefs = useRef([]);
  const containerRef = useRef(null);
  const observer = useRef();
  const lastArticleIdRef = useRef(null);
  const fetchedIdsRef = useRef(new Set());
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const lastFetchedTimeRef = useRef(null);

  const categories = [
    { id: "all", name: "All News", icon: <FaNewspaper className="mr-2" /> },
    {
      id: "business",
      name: "Business",
      icon: <FaChartLine className="mr-2" />,
    },
    {
      id: "finance",
      name: "Finance",
      icon: <FaGlobeAmericas className="mr-2" />,
    },
  ];

  // Fetch articles with smart reload detection
  const fetchArticles = useCallback(
    async (loadMore = false) => {
      if (isFetchingMore && loadMore) return;

      try {
        if (loadMore) {
          setIsFetchingMore(true);
          setLoadingMore(true);
        } else {
          setLoading(true);
          fetchedIdsRef.current.clear();
          lastArticleIdRef.current = null;
        }

        let url = `${baseURL}?limit=25`;
        if (loadMore && lastArticleIdRef.current) {
          url += `&lastId=${encodeURIComponent(lastArticleIdRef.current)}`;
        }

        const response = await axios.get(url);

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data)
        ) {
          const newArticles = response.data.data;

          // Check if there are truly new articles
          const newIds = new Set(newArticles.map((a) => a._id));
          const hasNewData =
            !loadMore ||
            Array.from(newIds).some((id) => !fetchedIdsRef.current.has(id));

          // Filter duplicates
          const uniqueNewArticles = newArticles.filter((article) => {
            if (!article._id) return false;
            if (fetchedIdsRef.current.has(article._id)) return false;
            fetchedIdsRef.current.add(article._id);
            return true;
          });

          if (loadMore && uniqueNewArticles.length === 0) {
            setHasMore(false);
            return;
          }

          if (loadMore) {
            setArticles((prev) => {
              const existingIds = new Set(prev.map((a) => a._id));
              const finalUnique = uniqueNewArticles.filter(
                (a) => !existingIds.has(a._id)
              );
              return [...prev, ...finalUnique];
            });
          } else {
            setArticles(uniqueNewArticles);
            if (uniqueNewArticles.length > 0) {
              setHeroArticle(uniqueNewArticles[0]);
            }
            // Only update if there's actually new data
            if (hasNewData) {
              lastFetchedTimeRef.current = Date.now();
            }
          }

          setHasMore(uniqueNewArticles.length === 25);
          if (uniqueNewArticles.length > 0) {
            lastArticleIdRef.current =
              uniqueNewArticles[uniqueNewArticles.length - 1]._id;
          }
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(<NotFound />);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setIsFetchingMore(false);
      }
    },
    [isFetchingMore]
  );

  // Intersection observer for infinite scroll - Fixed pagination
  const lastArticleRef = useCallback(
    (node) => {
      if (loading || isFetchingMore) {
        if (observer.current) observer.current.disconnect();
        return;
      }

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isFetchingMore && !loadingMore) {
            fetchArticles(true);
          }
        },
        { threshold: 0.1, rootMargin: "200px" }
      );

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, isFetchingMore, fetchArticles]
  );

  // Initialize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (typeof window !== "undefined") {
      setIsSpeechSupported(
        "webkitSpeechRecognition" in window && "speechSynthesis" in window
      );
    }

    fetchArticles();

    // Only fetch new data every 60 seconds if there's actually new content (optimized)
    const interval = setInterval(() => {
      if (
        lastFetchedTimeRef.current &&
        Date.now() - lastFetchedTimeRef.current < 60000
      ) {
        return; // Skip if we just fetched
      }
      fetchArticles(false);
    }, 60000);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearInterval(interval);
      if (observer.current) observer.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Load saved articles
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("savedArticles")) || [];
      setSavedArticles(saved);
    }
  }, []);

  // Voice search
  useEffect(() => {
    if (isListening && isSpeechSupported) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        setSearchQuery(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.start();
      return () => recognition.stop();
    }
  }, [isListening, isSpeechSupported]);

  // Save/remove article
  const toggleSaveArticle = (article) => {
    const isSaved = savedArticles.some((a) => a._id === article._id);
    let updated;
    if (isSaved) {
      updated = savedArticles.filter((a) => a._id !== article._id);
    } else {
      updated = [...savedArticles, article];
    }
    setSavedArticles(updated);
    localStorage.setItem("savedArticles", JSON.stringify(updated));
    if (!isSaved) setShowSavedArticles(true);
  };

  // Share article
  const shareArticle = (article) => {
    const url = `${window.location.origin}/${article.category}/${article.slug}`;
    if (navigator.share) {
      navigator
        .share({ title: article.title, text: article.description, url })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(`${article.title}\n\n${url}`)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => {});
    }
  };

  // Start speech for article
  const startSpeechForArticle = (article) => {
    const index = filteredArticles.findIndex((a) => a._id === article._id);
    if (index !== -1) {
      setCurrentArticleIndex(index);
      setSpeechTriggerArticle(article);
      // Reset trigger after a moment to allow re-triggering
      setTimeout(() => setSpeechTriggerArticle(null), 500);
    }
  };

  // Filter articles - useMemo to prevent unnecessary recalculations
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeTab === "all" ||
        article.category.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, activeTab]);

  const regularArticles = useMemo(() => {
    return filteredArticles.filter(
      (article) => !heroArticle || article._id !== heroArticle._id
    );
  }, [filteredArticles, heroArticle]);

  const isLatestArticle = (article) => {
    if (articles.length < 3) return true;
    return articles.slice(0, 3).some((a) => a._id === article._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <Head>
        <title>{heroArticle?.title || "News"}</title>
        <meta name="robots" content="index, follow" />
        <meta name="google-adsense-account" content="ca-pub-7599014130116297" />
        <meta
          name="description"
          content={heroArticle?.description || "Latest news and articles"}
        />
        <GTag />
      </Head>

      <main className="max-w-7xl mx-auto px-2 sm:px-3 py-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isListening={isListening}
          setIsListening={setIsListening}
          isSpeechSupported={isSpeechSupported}
          isMobile={isMobile}
        />

        {/* Category Tabs */}
        {/* <div className="flex gap-2 mb-3 bg-white p-2 rounded-lg border border-gray-200">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-md transition-all ${
                activeTab === category.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div> */}

        {/* TradingView Ticker - Memoized, won't reload on search */}
        <TradingViewTicker />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Hero Article */}
            {heroArticle &&
              filteredArticles.some((a) => a._id === heroArticle._id) && (
                <div className="mb-4">
                  <HeroArticle
                    article={heroArticle}
                    isSaved={savedArticles.some(
                      (a) => a._id === heroArticle._id
                    )}
                    isLatest={isLatestArticle(heroArticle)}
                    onSave={toggleSaveArticle}
                    onShare={shareArticle}
                    onListen={startSpeechForArticle}
                  />
                  <div className="mt-3">
                    <AdsterraAd />
                    <AdBanner />
                  </div>
                </div>
              )}

            {/* Secondary Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {regularArticles.slice(0, 2).map((article, index) => {
                const globalIndex = filteredArticles.findIndex(
                  (a) => a._id === article._id
                );
                return (
                  <div
                    key={article._id}
                    ref={(el) => (articleRefs.current[globalIndex] = el)}
                  >
                    <ArticleCard
                      article={article}
                      isSaved={savedArticles.some((a) => a._id === article._id)}
                      isCurrentArticle={false}
                      isLatest={isLatestArticle(article)}
                      onSave={toggleSaveArticle}
                      onShare={shareArticle}
                      onListen={startSpeechForArticle}
                      size="medium"
                    />
                  </div>
                );
              })}
            </div>

            {/* More Articles Grid - 2 columns only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regularArticles.slice(2).map((article, index) => {
                const globalIndex = filteredArticles.findIndex(
                  (a) => a._id === article._id
                );
                const isLast = index === regularArticles.slice(2).length - 1;
                return (
                  <div
                    key={article._id}
                    ref={
                      isLast
                        ? lastArticleRef
                        : (el) => (articleRefs.current[globalIndex] = el)
                    }
                    className="h-full"
                  >
                    <ArticleCard
                      article={article}
                      isSaved={savedArticles.some((a) => a._id === article._id)}
                      isCurrentArticle={globalIndex === currentArticleIndex}
                      isLatest={isLatestArticle(article)}
                      onSave={toggleSaveArticle}
                      onShare={shareArticle}
                      onListen={startSpeechForArticle}
                      size="medium"
                    />
                  </div>
                );
              })}
            </div>

            {/* Loading More */}
            {loadingMore && (
              <div className="flex justify-center my-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}

            {/* End of Articles */}
            {!loading && !hasMore && articles.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>You've reached the end of the articles.</p>
              </div>
            )}

            {/* No Articles */}
            {filteredArticles.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No articles found matching your search.</p>
              </div>
            )}
          </div>

          {/* Sidebar - Memoized TradingView widgets won't reload on search */}
          <div className="lg:col-span-4" id="trending-sidebar">
            <div className="space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sticky top-4">
              <TrendingSidebar articles={articles} />

              {/* TradingView Widgets - Memoized, won't reload */}
              <TradingViewSidebar />

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <AdsterraAd />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Speech Controls */}
      <SpeechControls
        articles={filteredArticles}
        currentArticleIndex={currentArticleIndex}
        setCurrentArticleIndex={setCurrentArticleIndex}
        articleRefs={articleRefs}
        isMobile={isMobile}
        triggerStart={speechTriggerArticle}
      />

      {/* Saved Articles Panel */}
      <SavedArticlesPanel
        savedArticles={savedArticles}
        show={showSavedArticles}
        onClose={() => setShowSavedArticles(false)}
        onRemove={toggleSaveArticle}
      />

      {/* Dark Mode Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <DarkModeToggle />
      </div>

      {/* Saved Articles Button */}
      <SavedArticlesButton
        count={savedArticles.length}
        onClick={() => setShowSavedArticles(true)}
      />
    </div>
  );
}
