"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Head from "next/head";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  FaPlay,
  FaStop,
  FaVolumeUp,
  FaChevronDown,
  FaTimes,
  FaCheck,
  FaPause,
  FaThumbsUp,
  FaThumbsDown,
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaComment,
  FaClock,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa";
import Loading from "@/app/loading";
import AnimatedPoll from "@/components/AnimatedPoll";
import NotFound from "@/app/NotFound";
import Link from "next/link";
import GTag from "@/components/Gtag";
import DarkModeToggle from "@/components/DarkModeToggle";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SlugPage = ({ articleData: initialArticleData = null, category: propCategory = null, slug: propSlug = null }) => {
  const params = useParams();
  const category = propCategory || params?.category;
  const slug = propSlug || params?.slug;
  
  const [article, setArticle] = useState(initialArticleData?.data || null);
  const [moreArticles, setMoreArticles] = useState([]);
  const [loading, setLoading] = useState(!initialArticleData?.data);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [speechState, setSpeechState] = useState("idle");
  const [language, setLanguage] = useState("en-US");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const imageRefs = useRef([]);
  const sectionRefs = useRef([]);
  const speechRef = useRef({
    utterance: null,
    startTime: 0,
    pauseTime: 0,
    words: [],
  });
  const modalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const keypointsRef = useRef(null);
  const pollRef = useRef(null);

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

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load user reaction and bookmark from localStorage
  useEffect(() => {
    if (article) {
      const storedReaction = localStorage.getItem(
        `article_${article._id}_reaction`
      );
      if (storedReaction) {
        setUserReaction(storedReaction);
      }

      const storedBookmark = localStorage.getItem(
        `article_${article._id}_bookmark`
      );
      if (storedBookmark) {
        setIsBookmarked(true);
      }
    }
  }, [article]);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLanguageModal(false);
      }
      if (showShareOptions && !event.target.closest(".share-container")) {
        setShowShareOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareOptions]);

  // Fetch article data only if not provided
  useEffect(() => {
    const getArticle = async () => {
      if (initialArticleData?.data) {
        setArticle(initialArticleData.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `https://informativejournal-backend.vercel.app/articles/${category}/${slug}`
        );

        if (response.data?.status === "success") {
          setArticle(response.data.data);
        } else {
          setError(<Loading />);
        }
      } catch (err) {
        setError(<NotFound />);
      } finally {
        setLoading(false);
      }
    };

    if (category && slug) {
      getArticle();
    }
  }, [category, slug, initialArticleData]);

  // Initialize animations when article is loaded
  useEffect(() => {
    if (!article) return;

    const animateElements = () => {
      // Header animation
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power3.out",
        });
      }

      // Content sections animation
      if (contentRef.current) {
        gsap.from(contentRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
        });
      }

      // Image animations
      imageRefs.current.forEach((img, i) => {
        if (img) {
          gsap.from(img, {
            opacity: 0,
            scale: 0.9,
            duration: 1,
            delay: 0.5 + i * 0.1,
            scrollTrigger: {
              trigger: img,
              start: "top 80%",
            },
            ease: "back.out(1.7)",
          });
        }
      });

      // Section animations
      sectionRefs.current.forEach((section, i) => {
        if (section) {
          gsap.from(section, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
            },
            ease: "power2.out",
          });
        }
      });

      // Keypoints animation
      if (keypointsRef.current) {
        gsap.from(keypointsRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.4,
          scrollTrigger: {
            trigger: keypointsRef.current,
            start: "top 85%",
          },
          ease: "power2.out",
        });
      }

      // Poll animation
      if (pollRef.current) {
        gsap.from(pollRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          scrollTrigger: {
            trigger: pollRef.current,
            start: "top 75%",
          },
          ease: "power2.out",
        });
      }
    };

    const scrollToContent = () => {
      if (contentRef.current) {
        gsap.to(window, {
          scrollTo: {
            y: contentRef.current,
            offsetY: isMobile ? 20 : 80,
            autoKill: true,
          },
          duration: 1,
          ease: "power3.inOut",
        });
      }
    };

    animateElements();
    scrollToContent();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [article, isMobile]);

  useEffect(() => {
    const fetchRandomArticles = async () => {
      try {
        const response = await axios.get(
          "https://informativejournal-backend.vercel.app/articles"
        );
        const allArticles = response.data.data;
        console.log(allArticles);
        // Shuffle array
        const shuffled = allArticles.sort(() => 0.5 - Math.random());

        // Get a random number between 6 and 9
        const count = Math.floor(Math.random() * 4) + 6;

        // Pick `count` articles from the shuffled array
        const selected = shuffled.slice(0, count);

        setMoreArticles(selected);
        setLoading(false);
      } catch (error) {
        setLoading(<Loading />);
      }
    };

    fetchRandomArticles();
  }, []);

  // Handle like/dislike reactions
  const handleReaction = (reactionType) => {
    if (!article) return;

    const newReaction = userReaction === reactionType ? null : reactionType;
    setUserReaction(newReaction);

    // Store in localStorage
    if (newReaction) {
      localStorage.setItem(`article_${article._id}_reaction`, newReaction);
    } else {
      localStorage.removeItem(`article_${article._id}_reaction`);
    }
  };

  // Handle bookmark toggle
  const toggleBookmark = () => {
    if (!article) return;

    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);

    if (newBookmarkState) {
      localStorage.setItem(`article_${article._id}_bookmark`, "true");
    } else {
      localStorage.removeItem(`article_${article._id}_bookmark`);
    }
  };

  // Handle share options
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || "Check out this article";
    const image = article?.image || "";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            url
          )}&title=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        break;
      default:
        break;
    }

    setShowShareOptions(false);
  };

  // Speech control functions
  const toggleSpeech = () => {
    if (speechState === "idle") {
      startSpeech();
    } else if (speechState === "playing") {
      pauseSpeech();
    } else if (speechState === "paused") {
      resumeSpeech();
    }
  };

  const startSpeech = () => {
    if (!article) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      // Read all sections, not just the active one
      const allContentParts = [
        article.title,
        article.description,
        ...(article.content || []).flatMap((section) => [
          section.title || "",
          section.content || "",
        ]),
      ].filter(Boolean);

      const contentToRead = allContentParts.join(". ");

      const words = contentToRead.split(/\s+/);
      speechRef.current.words = words;
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
      };

      speech.onerror = () => {
        setSpeechState("idle");
        clearInterval(progressIntervalRef.current);
        setSpeechProgress(0);
      };

      window.speechSynthesis.speak(speech);
      setSpeechState("playing");
    } else {
      alert("Text-to-speech is not supported in your browser");
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

  const handleSectionChange = (index) => {
    setActiveSection(index);
    if (speechState !== "idle") {
      stopSpeech();
    }

    if (sectionRefs.current[index]) {
      gsap.to(window, {
        scrollTo: {
          y: sectionRefs.current[index],
          offsetY: isMobile ? 20 : 100,
          autoKill: true,
        },
        duration: 1,
        ease: "power3.inOut",
      });
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      clearInterval(progressIntervalRef.current);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <NotFound />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen place-content-center flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loading />
      </div>
    );
  }

  const calculateReadTime = (content) => {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  // Calculate read time from all sections
  const readTime = article.content
    ? article.content.reduce((total, section) => {
        const sectionContent = section.content || "";
        return total + calculateReadTime(sectionContent);
      }, 0) || 5
    : 5;

  return (
    <>
      <Head>
        <title>{article?.title || "Article"} | Newwss</title>
        <GTag />
        <meta name="description" content={article?.description || ""} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={article?.title || "Article"} />
        <meta property="og:description" content={article?.description || ""} />
        <meta property="og:image" content={article?.image || ""} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ""} />
        <meta name="twitter:title" content={article?.title || "Article"} />
        <meta name="twitter:description" content={article?.description || ""} />
        <meta name="twitter:image" content={article?.image || ""} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        {/* Back Button */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group mb-2"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Floating Action Buttons - Desktop */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
          <button
            onClick={toggleBookmark}
            className={`p-3.5 rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              isBookmarked
                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 dark:from-yellow-500 dark:to-yellow-600"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
          >
            {isBookmarked ? (
              <FaBookmark size={18} />
            ) : (
              <FaRegBookmark size={18} />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="p-3.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
              aria-label="Share article"
            >
              <FaShare size={18} />
            </button>

            {showShareOptions && (
              <div className="absolute right-full top-0 mr-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 w-52 share-container border border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-3 text-blue-600 dark:text-blue-400 transition-colors font-medium"
                  >
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-3 text-blue-600 dark:text-blue-400 transition-colors font-medium"
                  >
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-3 text-blue-700 dark:text-blue-300 transition-colors font-medium"
                  >
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="w-full text-left px-4 py-2.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg flex items-center gap-3 text-green-600 dark:text-green-400 transition-colors font-medium"
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors font-medium"
                  >
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {article && (
            <>
              {/* Article Header */}
              <div ref={headerRef} className="mb-12 lg:mb-16">
                {/* Category and Mobile Actions */}
                <div className="flex justify-between items-start mb-6">
                  <span className="inline-block px-4 py-1.5 text-sm font-bold text-blue-700 dark:text-blue-300 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-full border border-blue-200 dark:border-blue-700/50 shadow-sm">
                    {article.category?.charAt(0).toUpperCase() + article.category?.slice(1) || "News"}
                  </span>

                  <div className="flex gap-2 lg:hidden">
                    <button
                      onClick={toggleBookmark}
                      className={`p-2.5 rounded-full transition-all ${
                        isBookmarked
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isBookmarked ? (
                        <FaBookmark size={16} />
                      ) : (
                        <FaRegBookmark size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => setShowShareOptions(!showShareOptions)}
                      className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <FaShare size={16} />
                    </button>
                  </div>
                </div>

                {/* Mobile Share Options */}
                {showShareOptions && (
                  <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 lg:hidden share-container">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleShare("twitter")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare("facebook")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="px-4 py-2 bg-blue-700 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition-colors"
                      >
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare("whatsapp")}
                        className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                  {article.title}
                </h1>

                {/* Description */}
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-light">
                  {article.description}
                </p>

                {/* Author and Meta Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6 pb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {article.author?.charAt(0)?.toUpperCase() || "D"}
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {article.author || "Dharaneesh"}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <time dateTime={article.createdAt} className="flex items-center gap-1.5">
                          <FaClock className="text-xs" />
                          {new Date(article.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </time>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-xs" />
                          {readTime} min read
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReaction("like")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium ${
                        userReaction === "like"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {userReaction === "like" ? (
                        <FaThumbsUp className="text-green-600 dark:text-green-400" />
                      ) : (
                        <FaRegThumbsUp />
                      )}
                      <span>Like</span>
                    </button>
                    <button
                      onClick={() => handleReaction("dislike")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium ${
                        userReaction === "dislike"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-700"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {userReaction === "dislike" ? (
                        <FaThumbsDown className="text-red-600 dark:text-red-400" />
                      ) : (
                        <FaRegThumbsDown />
                      )}
                      <span>Dislike</span>
                    </button>
                  </div>
                </div>

                {/* Featured Image */}
                {article.image && (
                  <div
                    ref={(el) => (imageRefs.current[0] = el)}
                    className="relative w-full h-80 sm:h-96 lg:h-[500px] rounded-3xl overflow-hidden mb-10 shadow-2xl border-4 border-white dark:border-gray-800"
                  >
                    <Image
                      src={article.image}
                      alt={article.title || "Article image"}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 900px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                )}
              </div>

              {/* Article Content Sections */}
              <div ref={contentRef} className="mb-16">
                {/* Article Content - Show all sections */}
                <article className="prose prose-lg sm:prose-xl dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
                  {article.content?.map((section, sectionIndex) => (
                    <div
                      key={section._id || sectionIndex}
                      ref={(el) => (sectionRefs.current[sectionIndex] = el)}
                      className="mb-16 last:mb-0"
                    >
                      {/* Section Image */}
                      {section?.image && (
                        <div
                          ref={(el) => (imageRefs.current[sectionIndex + 1] = el)}
                          className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden mb-10 shadow-xl border-2 border-gray-200 dark:border-gray-700"
                        >
                          <Image
                            src={section.image}
                            alt={section.title || "Section image"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                          />
                        </div>
                      )}

                      {/* Section Title */}
                      {section?.title && (
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 text-gray-900 dark:text-white leading-tight">
                          {section.title}
                        </h2>
                      )}

                      {/* Key Points */}
                      {section?.keypoints &&
                        section.keypoints[0]?.points?.length > 0 && (
                          <div
                            ref={sectionIndex === 0 ? keypointsRef : null}
                            className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-8 mb-10 shadow-lg"
                          >
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-6 flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Key Points
                            </h3>
                            <ul className="space-y-4">
                              {section.keypoints[0].points.map((point, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-base sm:text-lg text-gray-800 dark:text-gray-200"
                                >
                                  <span className="flex-shrink-0 h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-0.5">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                  <span className="leading-relaxed">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Article Text Content */}
                      {section?.content && (
                        <div className="space-y-6 text-gray-700 dark:text-gray-300">
                          {section.content
                            .split("\n")
                            .filter((p) => p.trim())
                            .map((paragraph, i) => (
                              <p
                                key={i}
                                className="leading-relaxed text-base sm:text-lg lg:text-xl font-light"
                              >
                                {paragraph}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </article>
              </div>

              {/* Poll Section */}
              <div
                ref={pollRef}
                className="my-16 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-900/50 p-8 sm:p-12 rounded-3xl border-2 border-blue-200 dark:border-blue-800 shadow-xl"
              >
                <h3 className="text-3xl sm:text-4xl font-bold mb-10 text-gray-900 dark:text-white text-center">
                  What do you think about this article?
                </h3>
                <AnimatedPoll />
              </div>

              {/* Comments Section */}
              {article.comments && article.comments.length > 0 && (
                <div
                  ref={(el) =>
                    (sectionRefs.current[article.content?.length || 0] = el)
                  }
                  className="mb-12"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                      Comments
                    </h3>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg">
                      <FaComment />
                      <span>Add Comment</span>
                    </button>
                  </div>
                  <div className="space-y-6">
                    {article.comments.map((comment) => (
                      <div
                        key={comment._id || comment.text}
                        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                              {comment.author?.charAt(0)?.toUpperCase() || "D"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-2">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                {comment.author || "Anonymous"}
                              </h4>
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {comment.text}
                            </p>
                            <div className="mt-4 flex items-center gap-6">
                              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors">
                                <FaThumbsUp size={14} />
                                <span>12</span>
                              </button>
                              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2 transition-colors">
                                <FaThumbsDown size={14} />
                                <span>2</span>
                              </button>
                              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Related Articles Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-12 text-gray-900 dark:text-white text-center">
            Read More on newwss.com
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {moreArticles.map((item) => (
              <Link href={`/${item.category}/${item.slug}`} key={item._id}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 group">
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                    <Image
                      src={item?.image}
                      alt="Related article"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-3">
                      {item?.category}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item?.title}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {item?.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
                        <FaClock className="text-xs" />
                        {calculateReadTime(item?.description || "")} min read
                      </span>
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                        Read More →
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Speech Controls */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {(speechState === "playing" || speechState === "paused") && (
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl px-5 py-4 w-72 animate-fade-in border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {languages.find((l) => l.code === language)?.name ||
                    "English"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(speechProgress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${speechProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {speechRef.current.words
                  .slice(
                    Math.max(0, currentWordIndex - 2),
                    currentWordIndex + 3
                  )
                  .join(" ")}
              </div>
            </div>
          )}

          <div className="flex gap-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-2 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleSpeech}
              className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ${
                speechState === "playing"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg scale-105"
                  : speechState === "paused"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg scale-105"
                  : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:scale-110"
              }`}
              aria-label={
                speechState === "playing"
                  ? "Pause reading"
                  : speechState === "paused"
                  ? "Resume reading"
                  : "Start reading"
              }
            >
              {speechState === "playing" ? (
                <FaPause size={18} />
              ) : speechState === "paused" ? (
                <FaPlay size={18} />
              ) : (
                <FaPlay size={18} />
              )}
            </button>

            <button
              onClick={() => {
                if (speechState !== "idle") {
                  stopSpeech();
                }
                setShowLanguageModal(true);
              }}
              className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ${
                speechState === "playing" || speechState === "paused"
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 shadow-sm hover:scale-110"
              }`}
              aria-label="Select language"
            >
              <FaVolumeUp size={18} />
            </button>
          </div>
        </div>

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              ref={modalRef}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-fade-in-up border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Language
                </h3>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh]">
                <ul>
                  {languages.map((lang) => (
                    <li
                      key={lang.code}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <button
                        onClick={() => selectLanguage(lang.code)}
                        className={`w-full text-left px-6 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex justify-between items-center ${
                          language === lang.code
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                        {language === lang.code && (
                          <FaCheck className="text-blue-500 dark:text-blue-400" size={16} />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dark Mode Toggle - Positioned at top right */}
        <div className="fixed top-6 right-6 z-50">
          <DarkModeToggle />
        </div>
      </div>
    </>
  );
};

export default SlugPage;
