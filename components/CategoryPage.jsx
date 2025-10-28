"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Loading from "@/app/loading";
import NotFound from "@/app/NotFound";
import Head from "next/head";
import GTag from "@/components/Gtag";
import ArticleCard from "@/components/ArticleCard";
import HeroArticle from "@/components/HeroArticle";
import SearchBar from "@/components/SearchBar";
import SpeechControls from "@/components/SpeechControls";
import SavedArticlesPanel from "@/components/SavedArticlesPanel";
import AdBanner from "@/components/BannerAds";
import AdsterraAd from "@/components/AdsterraAds";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function CategoryPage() {
  const baseURL = "https://informativejournal-backend.vercel.app/articles";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroArticle, setHeroArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [showSavedArticles, setShowSavedArticles] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [speechTriggerArticle, setSpeechTriggerArticle] = useState(null);

  const params = useParams();
  const category = params.category;
  const articleRefs = useRef([]);
  const containerRef = useRef(null);
  const lastFetchedTimeRef = useRef(null);

  // Check for mobile and speech support
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (typeof window !== "undefined") {
      setIsSpeechSupported("webkitSpeechRecognition" in window && "speechSynthesis" in window);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch articles with smart reload detection
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/${category}`);
        
        if (response.data.status === "success") {
          const sortedArticles = response.data.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          // Check if there are new articles
          const newIds = new Set(sortedArticles.map(a => a._id));
          const existingIds = new Set(articles.map(a => a._id));
          const hasNewData = Array.from(newIds).some(id => !existingIds.has(id));
          
          setArticles(sortedArticles);
          
          if (sortedArticles.length > 0) {
            setHeroArticle(sortedArticles[0]);
          }
          
          // Only update timestamp if there's new data
          if (hasNewData || articles.length === 0) {
            lastFetchedTimeRef.current = Date.now();
          }
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(<NotFound />);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
    
    // Only poll if we haven't fetched recently
    const interval = setInterval(() => {
      if (lastFetchedTimeRef.current && Date.now() - lastFetchedTimeRef.current < 30000) {
        return;
      }
      fetchArticles();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [category]);

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
      navigator.share({ title: article.title, text: article.description, url })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title}\n\n${url}`)
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

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const regularArticles = filteredArticles.filter(
    (article) => !heroArticle || article._id !== heroArticle._id
  );

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
    return <div className="flex justify-center items-center min-h-screen">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <Head>
        <title>{heroArticle?.title || "Category News"}</title>
        <meta name="robots" content="index, follow" />
        <meta name="google-adsense-account" content="ca-pub-7599014130116297" />
        <meta name="description" content={heroArticle?.description || "Latest news and articles"} />
        <GTag />
      </Head>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isListening={isListening}
          setIsListening={setIsListening}
          isSpeechSupported={isSpeechSupported}
          isMobile={isMobile}
        />

        {/* Hero Article */}
        {heroArticle && filteredArticles.some((a) => a._id === heroArticle._id) && (
          <div className="mb-6">
            <HeroArticle
              article={heroArticle}
              isSaved={savedArticles.some((a) => a._id === heroArticle._id)}
              isLatest={isLatestArticle(heroArticle)}
              onSave={toggleSaveArticle}
              onShare={shareArticle}
              onListen={startSpeechForArticle}
            />
            <div className="mt-4">
              <AdsterraAd />
            </div>
          </div>
        )}

        {/* Secondary Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {regularArticles.slice(0, 3).map((article, index) => {
            const globalIndex = filteredArticles.findIndex((a) => a._id === article._id);
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

        {/* Mid-content Ad */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdBanner />
            <AdsterraAd />
          </div>
        </div>

        {/* More Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {regularArticles.slice(3).map((article, index) => {
            const globalIndex = filteredArticles.findIndex((a) => a._id === article._id);
            return (
              <div
                key={article._id}
                ref={(el) => (articleRefs.current[globalIndex] = el)}
              >
                <ArticleCard
                  article={article}
                  isSaved={savedArticles.some((a) => a._id === article._id)}
                  isCurrentArticle={globalIndex === currentArticleIndex}
                  isLatest={isLatestArticle(article)}
                  onSave={toggleSaveArticle}
                  onShare={shareArticle}
                  onListen={startSpeechForArticle}
                  size="small"
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Ad */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdsterraAd />
            <AdBanner />
            <AdsterraAd />
          </div>
        </div>

        {/* No Articles */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No articles found matching your search.</p>
          </div>
        )}
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
      <DarkModeToggle />
    </div>
  );
}
