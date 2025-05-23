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
} from "react-icons/fa";
import Loading from "@/app/loading";
import AnimatedPoll from "@/components/AnimatedPoll";
import NotFound from "@/app/NotFound";
import Link from "next/link";
import GTag from "@/components/Gtag";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const ArticlePage = () => {
  const { category, slug } = useParams();
  const [article, setArticle] = useState(null);
  const [moreArticles, setMoreArticles] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch article data
  useEffect(() => {
    const getArticle = async () => {
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
  }, [category, slug]);

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

      const contentToRead = [
        article.title,
        article.description,
        article.content?.[activeSection]?.title || "",
        article.content?.[activeSection]?.content || "",
      ].join(". ");

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
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
      <div className="min-h-screen place-content-center flex items-center justify-center">
        <Loading />
      </div>
    );
  }

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
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:title" content={article?.title || "Article"} />
        <meta name="twitter:description" content={article?.description || ""} />
        <meta name="twitter:image" content={article?.image || ""} />
      </Head>

      <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
        {/* Floating Action Buttons */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
          <button
            onClick={toggleBookmark}
            className={`p-3 rounded-full shadow-lg transition-all ${
              isBookmarked
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
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
              className="p-3 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-lg transition-all"
              aria-label="Share article"
            >
              <FaShare size={18} />
            </button>

            {showShareOptions && (
              <div className="absolute right-full top-0 mr-2 bg-white rounded-lg shadow-xl p-2 w-48 share-container">
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center gap-2 text-blue-500"
                >
                  <span className="text-blue-500">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center gap-2 text-blue-600"
                >
                  <span className="text-blue-600">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center gap-2 text-blue-700"
                >
                  <span className="text-blue-700">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center gap-2 text-green-500"
                >
                  <span className="text-green-500">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center gap-2 text-gray-700"
                >
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {article && (
            <>
              {/* Article Header */}
              <div ref={headerRef} className="mb-12">
                <div className="flex justify-between items-start mb-6">
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                    {article.category}
                  </span>

                  <div className="flex gap-2 lg:hidden">
                    <button
                      onClick={toggleBookmark}
                      className={`p-2 rounded-full ${
                        isBookmarked
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-100 text-gray-700"
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
                      className="p-2 rounded-full bg-gray-100 text-gray-700"
                    >
                      <FaShare size={16} />
                    </button>
                  </div>
                </div>

                {showShareOptions && (
                  <div className="mb-4 bg-white p-3 rounded-lg shadow-md lg:hidden share-container">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleShare("twitter")}
                        className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare("facebook")}
                        className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="px-3 py-1 bg-blue-700 text-white rounded-full text-sm"
                      >
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare("whatsapp")}
                        className="px-3 py-1 bg-green-500 text-white rounded-full text-sm"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                  {article.title}
                </h1>

                <p className="text-xl sm:text-2xl text-gray-600 mb-8">
                  {article.description}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold">
                        {article.author?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {article.author || "Unknown Author"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <time dateTime={article.createdAt}>
                          {new Date(article.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </time>
                        <span>•</span>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReaction("like")}
                      className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${
                        userReaction === "like"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {userReaction === "like" ? (
                        <FaThumbsUp className="text-green-600" />
                      ) : (
                        <FaRegThumbsUp />
                      )}
                      <span>Like</span>
                    </button>
                    <button
                      onClick={() => handleReaction("dislike")}
                      className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${
                        userReaction === "dislike"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {userReaction === "dislike" ? (
                        <FaThumbsDown className="text-red-600" />
                      ) : (
                        <FaRegThumbsDown />
                      )}
                      <span>Dislike</span>
                    </button>
                  </div>
                </div>

                {article.image && (
                  <div
                    ref={(el) => (imageRefs.current[0] = el)}
                    className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg"
                  >
                    <Image
                      src={article.image}
                      alt={article.title || "Article image"}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                )}
              </div>

              {/* Article Content Sections */}
              <div ref={contentRef} className="mb-16">
                {article.content?.length > 1 && (
                  <div className="mb-8 overflow-x-auto">
                    <div className="flex gap-2 pb-4 w-max min-w-full">
                      {article.content.map((section, index) => (
                        <button
                          key={section._id || index}
                          onClick={() => handleSectionChange(index)}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                            activeSection === index
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                          } rounded-full`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <article
                  ref={(el) => (sectionRefs.current[activeSection] = el)}
                  className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none"
                >
                  {article.content?.[activeSection]?.image && (
                    <div
                      ref={(el) => (imageRefs.current[1] = el)}
                      className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-8 shadow-lg"
                    >
                      <Image
                        src={article.content[activeSection].image}
                        alt={
                          article.content[activeSection].title ||
                          "Section image"
                        }
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                      />
                    </div>
                  )}

                  {article.content?.[activeSection]?.title && (
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-800">
                      {article.content[activeSection].title}
                    </h2>
                  )}

                  {article.content?.[activeSection]?.keypoints &&
                    article.content[activeSection].keypoints[0]?.points
                      ?.length > 0 && (
                      <div
                        ref={keypointsRef}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm"
                      >
                        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                        <ul className="space-y-3">
                          {article.content[
                            activeSection
                          ].keypoints[0].points.map((point, index) => (
                            <li
                              key={index}
                              className="flex items-start text-base text-gray-700"
                            >
                              <span className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2 mt-0.5">
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
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <div className="space-y-6 text-gray-700">
                    {article.content?.[activeSection]?.content &&
                      article.content[activeSection].content
                        .split("\n")
                        .map((paragraph, i) => (
                          <p
                            key={i}
                            className="leading-relaxed text-base sm:text-lg"
                          >
                            {paragraph}
                          </p>
                        ))}
                  </div>
                </article>
              </div>

              {/* Poll Section */}
              <div
                ref={pollRef}
                className="my-16 bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200 shadow-sm"
              >
                <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800 text-center">
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
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      Comments
                    </h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all">
                      <FaComment />
                      <span>Add Comment</span>
                    </button>
                  </div>
                  <div className="space-y-6">
                    {article.comments.map((comment) => (
                      <div
                        key={comment._id || comment.text}
                        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold">
                              {comment.author?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                                {comment.author || "Anonymous"}
                              </h4>
                              <span className="text-xs text-gray-500">
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
                            <p className="mt-2 text-sm sm:text-base text-gray-700">
                              {comment.text}
                            </p>
                            <div className="mt-3 flex items-center gap-4">
                              <button className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                                <FaThumbsUp size={12} />
                                <span>12</span>
                              </button>
                              <button className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                                <FaThumbsDown size={12} />
                                <span>2</span>
                              </button>
                              <button className="text-xs sm:text-sm text-gray-500 hover:text-blue-600">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800 text-center">
            Read More newwss.com
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreArticles.map((item) => (
              <Link href={`/${item.category}/${item.slug}`} key={item._id}>
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-48 sm:h-56 w-full">
                    <Image
                      src={item?.image}
                      alt="Related article"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                      {item?.category}
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 line-clamp-2">
                      {item?.title}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
                      {item?.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">3 min read</span>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Read More
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
            <div className="bg-white shadow-xl rounded-lg px-4 py-3 w-64 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {languages.find((l) => l.code === language)?.name ||
                    "English"}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(speechProgress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${speechProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {speechRef.current.words
                  .slice(
                    Math.max(0, currentWordIndex - 2),
                    currentWordIndex + 3
                  )
                  .join(" ")}
              </div>
            </div>
          )}

          <div className="flex gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-xl border border-gray-100">
            <button
              onClick={toggleSpeech}
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${
                speechState === "playing"
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg"
                  : speechState === "paused"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md"
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
                <FaPause size={16} />
              ) : speechState === "paused" ? (
                <FaPlay size={16} />
              ) : (
                <FaPlay size={16} />
              )}
            </button>

            <button
              onClick={() => {
                if (speechState !== "idle") {
                  stopSpeech();
                }
                setShowLanguageModal(true);
              }}
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${
                speechState === "playing" || speechState === "paused"
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm"
              }`}
              aria-label="Select language"
            >
              <FaVolumeUp size={16} />
            </button>
          </div>
        </div>

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
              ref={modalRef}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-fade-in-up"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Language
                </h3>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh]">
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
                          <span className="text-xl">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                        {language === lang.code && (
                          <FaCheck className="text-blue-500" size={14} />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArticlePage;
