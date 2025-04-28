"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger, ScrollToPlugin } from "gsap/all";
import axios from "axios";
import { useParams } from "next/navigation";
import Loading from "../loading";
import Link from "next/link";
import Image from "next/image";
import GamificationDashboard from "../../components/GamificationDashboard";
import AdBanner from "@/components/BannerAds";
import AdsterraAd from "@/components/AdsterraAds";
import {
  FaPlay,
  FaStop,
  FaPause,
  FaVolumeUp,
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaMicrophone,
  FaBell,
  FaShareAlt,
  FaTimes,
  FaBook,
  FaTrophy,
  FaCheck,
  FaChevronDown,
  FaCircle,
} from "react-icons/fa";
import Head from "next/head";
import NotFound from "../NotFound";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function CategoryPage() {
  // State management
  const baseURL = "https://informativejournal-backend.vercel.app/articles";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroArticle, setHeroArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSavedArticles, setShowSavedArticles] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [latestArticles, setLatestArticles] = useState([]);

  // Speech state
  const [speechState, setSpeechState] = useState("idle");
  const [language, setLanguage] = useState("en-US");
  const [speechProgress, setSpeechProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);

  const params = useParams();
  const category = params.category;

  // Refs
  const searchBarRef = useRef(null);
  const voiceButtonRef = useRef(null);
  const fabMenuRef = useRef(null);
  const fabButtonRef = useRef(null);
  const savedPanelRef = useRef(null);
  const gamificationPanelRef = useRef(null);
  const modalRef = useRef(null);
  const articleRefs = useRef([]);
  const containerRef = useRef(null);
  const speechRef = useRef({
    utterance: null,
    startTime: 0,
    pauseTime: 0,
    words: [],
    currentArticle: null,
  });
  const progressIntervalRef = useRef(null);
  const marqueeRef = useRef(null);

  // Supported languages
  const languages = [
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", name: "German", flag: "🇩🇪" },
    { code: "it-IT", name: "Italian", flag: "🇮🇹" },
    { code: "pt-PT", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
    { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
    { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
    { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  ];

  // Check for mobile view and setup smooth scrolling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Setup smooth scrolling
    gsap.config({
      nullTargetWarn: false,
    });

    return () => {
      window.removeEventListener("resize", checkMobile);
      ScrollTrigger.getAll().forEach((instance) => instance.kill());
    };
  }, []);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("webkitSpeechRecognition" in window) {
        setIsSpeechSupported(true);
      }
      if (!("speechSynthesis" in window)) {
        console.warn("Text-to-speech not supported");
      }
    }
  }, []);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLanguageModal(false);
      }
      if (
        savedPanelRef.current &&
        !savedPanelRef.current.contains(event.target) &&
        showSavedArticles
      ) {
        setShowSavedArticles(false);
      }
      if (
        gamificationPanelRef.current &&
        !gamificationPanelRef.current.contains(event.target) &&
        showGamification
      ) {
        setShowGamification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSavedArticles, showGamification]);

  // Fetch articles and sort by date (newest first)
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`${baseURL}/${category}`);
        if (response.data.status === "success") {
          // Sort articles by date in descending order (newest first)
          const sortedArticles = response.data.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setArticles(sortedArticles);
          // Set first article as hero article
          if (sortedArticles.length > 0) {
            setHeroArticle(sortedArticles[0]);
          }
          // Set latest 10 articles for marquee
          setLatestArticles(sortedArticles.slice(0, 10));
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(<NotFound />);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
    // Poll for new articles every 30 seconds
    const interval = setInterval(fetchArticles, 30000);
    return () => clearInterval(interval);
  }, [category]);

  // Animate marquee
  useEffect(() => {
    if (marqueeRef.current && latestArticles.length > 0) {
      const marqueeContent = marqueeRef.current;
      const contentWidth = marqueeContent.scrollWidth;
      const duration = contentWidth / 50; // Adjust speed as needed

      gsap.fromTo(
        marqueeContent,
        { x: 0 },
        {
          x: -contentWidth,
          duration: duration,
          ease: "none",
          repeat: -1,
        }
      );
    }
  }, [latestArticles]);

  // Load saved articles
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("savedArticles")) || [];
      setSavedArticles(saved);
    }
  }, []);

  // Save/remove article
  const toggleSaveArticle = (article) => {
    const isSaved = savedArticles.some((a) => a._id === article._id);
    let updatedSavedArticles;

    if (isSaved) {
      updatedSavedArticles = savedArticles.filter((a) => a._id !== article._id);
    } else {
      updatedSavedArticles = [...savedArticles, article];
    }

    setSavedArticles(updatedSavedArticles);
    localStorage.setItem("savedArticles", JSON.stringify(updatedSavedArticles));

    if (!isSaved) {
      setShowSavedArticles(true);
    }
  };

  // Share article
  const shareArticle = (article) => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.description,
          url: `${window.location.origin}/${article.category}/${article.slug}`,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareUrl = `${window.location.origin}/${article.category}/${article.slug}`;
      navigator.clipboard
        .writeText(`${article.title}\n\n${shareUrl}`)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err));
    }
  };

  // GSAP animations
  useEffect(() => {
    if (articles.length === 0) return;

    // Smooth scroll setup
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scrollTo: { y: 0, autoKill: false },
        duration: 0.1,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((instance) => instance.kill());
    };
  }, [articles]);

  // Check if article is among the last 3 posted
  const isLatestArticle = (article) => {
    if (articles.length < 3) return true;
    const latestThree = articles.slice(0, 3);
    return latestThree.some((a) => a._id === article._id);
  };

  // Speech controls
  const toggleSpeech = () => {
    if (speechState === "idle") {
      startSpeech();
    } else if (speechState === "playing") {
      pauseSpeech();
    } else if (speechState === "paused") {
      resumeSpeech();
    }
  };

  const startSpeech = (article = null) => {
    if (articles.length === 0) return;

    const targetArticle = article || articles[currentArticleIndex];
    if (!targetArticle) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const contentToRead = `${targetArticle.title}. ${
        targetArticle.description
      }. ${targetArticle.content?.map((c) => c.content).join(" ")}`;
      const words = contentToRead.split(/\s+/);
      speechRef.current.words = words;
      speechRef.current.currentArticle = targetArticle;
      setCurrentWordIndex(0);

      const speech = new SpeechSynthesisUtterance(contentToRead);
      speech.lang = language;
      speech.rate = 1;
      speech.pitch = 1;
      speechRef.current.utterance = speech;
      speechRef.current.startTime = Date.now();

      setSpeechProgress(0);
      progressIntervalRef.current = setInterval(() => {
        if (speechState === "playing") {
          const elapsed = Date.now() - speechRef.current.startTime;
          const estimatedTotal = (contentToRead.length / 15) * 1000;
          const progress = Math.min((elapsed / estimatedTotal) * 100, 100);
          setSpeechProgress(progress);

          const wordsPerMs = words.length / estimatedTotal;
          const currentWord = Math.floor(elapsed * wordsPerMs);
          setCurrentWordIndex(Math.min(currentWord, words.length - 1));
        }
      }, 100);

      speech.onboundary = (event) => {
        if (event.name === "word") {
          const wordIndex = speechRef.current.words.findIndex(
            (_, i) => i >= event.charIndex
          );
          setCurrentWordIndex(wordIndex);
        }
      };

      speech.onend = () => {
        setSpeechState("idle");
        clearInterval(progressIntervalRef.current);
        setSpeechProgress(100);
        setTimeout(() => setSpeechProgress(0), 1000);

        if (!article && currentArticleIndex < articles.length - 1) {
          setCurrentArticleIndex((prev) => prev + 1);
          if (articleRefs.current[currentArticleIndex + 1]) {
            gsap.to(window, {
              scrollTo: {
                y: articleRefs.current[currentArticleIndex + 1],
                offsetY: isMobile ? 20 : 100,
                autoKill: true,
              },
              duration: 1,
              ease: "power3.inOut",
            });
          }
          setTimeout(() => startSpeech(), 1000);
        }
      };

      speech.onerror = () => {
        setSpeechState("idle");
        clearInterval(progressIntervalRef.current);
        setSpeechProgress(0);
      };

      window.speechSynthesis.speak(speech);
      setSpeechState("playing");

      if (articleRefs.current[currentArticleIndex]) {
        gsap.to(window, {
          scrollTo: {
            y: articleRefs.current[currentArticleIndex],
            offsetY: isMobile ? 20 : 100,
            autoKill: true,
          },
          duration: 1,
          ease: "power3.inOut",
        });
      }
    } else {
      alert("Text-to-speech not supported");
    }
  };

  const pauseSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
      speechRef.current.pauseTime = Date.now();
      setSpeechState("paused");
    }
  };

  const resumeSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      speechRef.current.startTime += Date.now() - speechRef.current.pauseTime;
      setSpeechState("playing");
    }
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeechState("idle");
    clearInterval(progressIntervalRef.current);
    setSpeechProgress(0);
  };

  const selectLanguage = (langCode) => {
    const wasPlaying = speechState === "playing";
    const wasPaused = speechState === "paused";

    setLanguage(langCode);
    setShowLanguageModal(false);

    if (wasPlaying || wasPaused) {
      stopSpeech();
      startSpeech();
    }
  };

  // Voice search
  useEffect(() => {
    if (isListening && isSpeechSupported) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = language;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognition.start();
      return () => recognition.stop();
    }
  }, [isListening, language, isSpeechSupported]);

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Render articles with hero placement
  const renderArticles = () => {
    if (filteredArticles.length === 0) {
      return (
        <div className="col-span-3 text-center py-12">
          <p className="text-gray-500">
            No articles found matching your search.
          </p>
        </div>
      );
    }

    // Exclude hero article from regular articles
    const regularArticles = filteredArticles.filter(
      (article) => !heroArticle || article._id !== heroArticle._id
    );

    return (
      <>
        <Head>
          <title>{heroArticle?.title | "Newwss"}</title>
          <meta
            name="description"
            content={
              heroArticle?.description ||
              "Get the latest news, articles, and updates from around the world."
            }
          />
          <meta
            name="keywords"
            content={`${
              (heroArticle?.category &&
                heroArticle?.title &&
                heroArticle?.description) ||
              "news"
            }, latest news, breaking news`}
          />
          <meta name="author" content={heroArticle?.author || "Newwss"} />

          {/* Open Graph tags for social media */}
          <meta property="og:title" content={heroArticle?.title} />
          <meta property="og:description" content={heroArticle?.description} />
          <meta
            property="og:image"
            content={heroArticle?.image || "/news-image.jpg"}
          />
          <meta
            property="og:url"
            content={`https://www.newwss.com/${heroArticle?.category}/${heroArticle?.slug}`}
          />
          <meta property="og:type" content="article" />

          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={heroArticle?.title} />
          <meta name="twitter:description" content={heroArticle?.description} />
          <meta
            name="twitter:image"
            content={heroArticle?.image || "/news-image.jpg"}
          />
          <meta name="robots" content="index, follow" />
          <meta name="google-adsense-account" content="ca-pub-7599014130116297" />
        </Head>
        
        {/* Top Ad Banner */}
        <div className="col-span-1 md:col-span-3 mb-6">
          <AdBanner />
        </div>

        {/* Latest Articles Marquee */}
        <div className="col-span-1 md:col-span-3 bg-gray-100 p-2 mb-6 rounded overflow-hidden">
          <div className="flex items-center">
            <div className="bg-red-600 text-white px-3 py-1 rounded font-bold flex items-center mr-3 whitespace-nowrap">
              <FaCircle className="text-xs mr-2 animate-pulse" /> LATEST NEWS
            </div>
            <div className="overflow-hidden">
              <div ref={marqueeRef} className="whitespace-nowrap inline-block">
                {latestArticles.map((article, index) => (
                  <span key={article._id} className="mx-4 inline-block">
                    {article.title}
                    {index < latestArticles.length - 1 && " • "}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Article */}
        {heroArticle &&
          filteredArticles.some((a) => a._id === heroArticle._id) && (
            <div
              key={`hero-${heroArticle._id}`}
              className="col-span-1 md:col-span-3 fade-in relative hero-article mb-8"
            >
              <div className="bg-white p-4 shadow-md">
                <Link href={`/${heroArticle.category}/${heroArticle.slug}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-2/3 h-96 relative rounded-lg overflow-hidden">
                      {isLatestArticle(heroArticle) && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center z-10">
                          <FaCircle className="text-xs mr-1 animate-pulse" />{" "}
                          LIVE
                        </div>
                      )}
                      <Image
                        src={heroArticle.image || "/news-image.jpg"}
                        alt={heroArticle.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="md:w-1/3 flex flex-col justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-4 leading-tight">
                          {heroArticle.title}
                        </h2>
                        <p className="text-lg text-gray-700 mb-4">
                          {heroArticle.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600">
                            By {heroArticle.author || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(
                              heroArticle.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSaveArticle(heroArticle);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            {savedArticles.some(
                              (a) => a._id === heroArticle._id
                            ) ? (
                              <FaBookmark className="text-blue-600" />
                            ) : (
                              <FaRegBookmark className="text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              shareArticle(heroArticle);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FaShareAlt className="text-green-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCurrentArticleIndex(
                                filteredArticles.findIndex(
                                  (a) => a._id === heroArticle._id
                                )
                              );
                              startSpeech(heroArticle);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FaVolumeUp className="text-blue-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

        {/* Ad after hero article */}
        <div className="col-span-1 md:col-span-3 mb-8">
          <AdsterraAd />
        </div>

        {/* Secondary Featured Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {regularArticles.slice(0, 3).map((article, index) => {
            const globalIndex = filteredArticles.findIndex(
              (a) => a._id === article._id
            );
            const isSaved = savedArticles.some((a) => a._id === article._id);
            const isCurrentArticle =
              globalIndex === currentArticleIndex &&
              (speechState === "playing" || speechState === "paused");
            const isLatest = isLatestArticle(article);

            return (
              <div
                key={article._id}
                ref={(el) => (articleRefs.current[globalIndex] = el)}
                className={`bg-white shadow-md rounded-lg overflow-hidden fade-in relative ${
                  isCurrentArticle ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <Link href={`/${article.category}/${article.slug}`}>
                  <div className="h-48 relative">
                    {isLatest && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center z-10">
                        <FaCircle className="text-xs mr-1 animate-pulse" /> LIVE
                      </div>
                    )}
                    <Image
                      src={article.image || "/news-image.jpg"}
                      alt={article.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSaveArticle(article);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          {isSaved ? (
                            <FaBookmark className="text-blue-600" />
                          ) : (
                            <FaRegBookmark className="text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            shareArticle(article);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FaShareAlt className="text-green-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentArticleIndex(globalIndex);
                            startSpeech(article);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FaVolumeUp className="text-blue-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Mid-content Ad */}
        <div className="col-span-1 md:col-span-3 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdBanner />
            <AdsterraAd />
          </div>
        </div>

        {/* More News Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularArticles.slice(3).map((article, index) => {
            const globalIndex = filteredArticles.findIndex(
              (a) => a._id === article._id
            );
            const isSaved = savedArticles.some((a) => a._id === article._id);
            const isCurrentArticle =
              globalIndex === currentArticleIndex &&
              (speechState === "playing" || speechState === "paused");
            const isLatest = isLatestArticle(article);

            return (
              <div
                key={article._id}
                ref={(el) => (articleRefs.current[globalIndex] = el)}
                className={`bg-white shadow-sm rounded-lg overflow-hidden fade-in relative ${
                  isCurrentArticle ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <Link href={`/${article.category}/${article.slug}`}>
                  <div className="h-40 relative">
                    {isLatest && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center z-10">
                        <FaCircle className="text-xs mr-1 animate-pulse" /> LIVE
                      </div>
                    )}
                    <Image
                      src={article.image || "/news-image.jpg"}
                      alt={article.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSaveArticle(article);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          {isSaved ? (
                            <FaBookmark className="text-blue-600" />
                          ) : (
                            <FaRegBookmark className="text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            shareArticle(article);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FaShareAlt className="text-green-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentArticleIndex(globalIndex);
                            startSpeech(article);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FaVolumeUp className="text-blue-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom Ad */}
        <div className="col-span-1 md:col-span-3 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdsterraAd />
            <AdBanner />
            <AdsterraAd />
          </div>
        </div>
      </>
    );
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
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mobile Search Bar */}
        <div className="mb-6 md:hidden">
          <div className="flex items-center bg-white border rounded-full px-4 py-2 w-full">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-2 outline-none flex-1"
            />
            {isSpeechSupported && (
              <button
                onClick={() => setIsListening(!isListening)}
                className={`ml-2 p-2 rounded-full transition-all duration-300 ${
                  isListening ? "bg-red-500" : "bg-gray-100"
                } hover:bg-gray-200`}
              >
                <FaMicrophone
                  className={`text-gray-500 ${isListening ? "text-white" : ""}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-6">{renderArticles()}</div>
      </main>

      {/* Saved Articles Panel */}
      <div
        ref={savedPanelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 p-4 overflow-y-auto transition-transform duration-300 ${
          showSavedArticles ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <FaBook className="mr-2" /> Saved Articles ({savedArticles.length})
          </h3>
          <button
            onClick={() => setShowSavedArticles(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        {savedArticles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No saved articles yet. Click the bookmark icon to save articles.
          </div>
        ) : (
          <div className="space-y-4">
            {savedArticles.map((article) => (
              <div
                key={article._id}
                className="border rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <Link href={`/${article.category}/${article.slug}`}>
                  <div className="flex items-start">
                    <div className="w-16 h-16 relative flex-shrink-0 mr-3">
                      <Image
                        src={article.image || "/news-image.jpg"}
                        alt={article.title}
                        className="object-cover rounded"
                        fill
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {article.author || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => toggleSaveArticle(article)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gamification Dashboard Panel */}
      <div
        ref={gamificationPanelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 p-4 overflow-y-auto transition-transform duration-300 ${
          showGamification ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <FaTrophy className="mr-2" /> Your Progress
          </h3>
          <button
            onClick={() => setShowGamification(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>
        <GamificationDashboard userId={params.userId} />
      </div>

      {/* Speech Progress Indicator */}
      {(speechState === "playing" || speechState === "paused") && (
        <div
          className={`fixed ${
            isMobile ? "bottom-20 right-4 w-48" : "bottom-6 left-6 w-64"
          } z-50 bg-white shadow-lg rounded-lg px-3 py-2 animate-fade-in`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">
              {languages.find((l) => l.code === language)?.name || "English"}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(speechProgress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${speechProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 line-clamp-1">
            {speechRef.current.words
              .slice(Math.max(0, currentWordIndex - 2), currentWordIndex + 3)
              .join(" ")}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end gap-2">
          {isFabExpanded && (
            <div className="bg-white shadow-lg rounded-lg p-4 mb-2 w-64">
              <div className="flex flex-col gap-3">
                <button
                  onClick={toggleSpeech}
                  className={`flex items-center justify-between px-4 py-2 rounded-full transition-colors ${
                    speechState === "playing"
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : speechState === "paused"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {speechState === "playing" ? (
                    <>
                      <FaPause className="mr-2" />
                      <span>Pause Reading</span>
                    </>
                  ) : speechState === "paused" ? (
                    <>
                      <FaPlay className="mr-2" />
                      <span>Resume Reading</span>
                    </>
                  ) : (
                    <>
                      <FaPlay className="mr-2" />
                      <span>Start Reading</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowLanguageModal(true)}
                  className="flex items-center justify-between bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                  <FaVolumeUp className="mr-2" />
                  <span>Change Language</span>
                </button>

                <button
                  onClick={() => {
                    setIsFabExpanded(false);
                    stopSpeech();
                  }}
                  className="flex items-center justify-between bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  <FaStop className="mr-2" />
                  <span>Stop Reading</span>
                </button>
              </div>
            </div>
          )}

          {/* Main FAB Button */}
          <button
            ref={fabButtonRef}
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            {isFabExpanded ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaVolumeUp className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className={`bg-white rounded-xl shadow-2xl w-full ${
              isMobile ? "max-w-xs" : "max-w-md"
            } max-h-[80vh] overflow-hidden animate-fade-in-up`}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Language
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <ul>
                {languages.map((lang) => (
                  <li
                    key={lang.code}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <button
                      onClick={() => selectLanguage(lang.code)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center ${
                        language === lang.code
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {language === lang.code && (
                        <FaCheck className="text-blue-500" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}