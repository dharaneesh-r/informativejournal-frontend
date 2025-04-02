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
} from "react-icons/fa";
import Loading from "@/app/loading";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const ArticlePage = () => {
  const { category, slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [speechState, setSpeechState] = useState("idle");
  const [language, setLanguage] = useState("en-US");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLanguageModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          setError("Article not found");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">
            Article not found
          </h1>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article?.title || "Article"} | Informative Journal</title>
        <meta name="description" content={article?.description || ""} />
        <meta property="og:title" content={article?.title || "Article"} />
        <meta property="og:description" content={article?.description || ""} />
        <meta property="og:image" content={article?.image || ""} />
      </Head>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative bg-white min-h-screen">
        {article && (
          <>
            {/* Article Header */}
            <div ref={headerRef} className="mb-8">
              <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                {article.category}
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-900">
                {article.title}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                {article.description}
              </p>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {article.author || "Unknown Author"}
                  </p>
                  <div className="flex space-x-2 text-sm text-gray-500">
                    <time dateTime={article.createdAt}>
                      {new Date(article.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </div>

              {article.image && (
                <div
                  ref={(el) => (imageRefs.current[0] = el)}
                  className="relative w-full h-48 sm:h-64 md:h-96 rounded-xl overflow-hidden mb-8"
                >
                  <Image
                    src={article.image}
                    alt={article.title || "Article image"}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 800px"
                  />
                </div>
              )}
            </div>

            {/* Article Content Sections */}
            <div ref={contentRef} className="mb-12">
              {article.content?.length > 1 && (
                <div className="mb-6 sm:mb-8 overflow-x-auto">
                  <div className="flex space-x-2 pb-2">
                    {article.content.map((section, index) => (
                      <button
                        key={section._id || index}
                        onClick={() => handleSectionChange(index)}
                        className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                          activeSection === index
                            ? "bg-blue-600 text-white shadow-md"
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
                className="prose prose-sm sm:prose-lg max-w-none"
              >
                {article.content?.[activeSection]?.image && (
                  <div
                    ref={(el) => (imageRefs.current[1] = el)}
                    className="relative w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden mb-6 sm:mb-8"
                  >
                    <Image
                      src={article.content[activeSection].image}
                      alt={
                        article.content[activeSection].title || "Section image"
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 800px"
                    />
                  </div>
                )}

                {article.content?.[activeSection]?.title && (
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
                    {article.content[activeSection].title}
                  </h2>
                )}

                <div className="space-y-4 sm:space-y-6 text-gray-700">
                  {article.content?.[activeSection]?.content &&
                    article.content[activeSection].content
                      .split("\n")
                      .map((paragraph, i) => (
                        <p key={i} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                </div>
              </article>
            </div>

            {/* Comments Section */}
            {article.comments && article.comments.length > 0 && (
              <div
                ref={(el) =>
                  (sectionRefs.current[article.content?.length || 0] = el)
                }
                className="mb-12"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
                  Comments
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  {article.comments.map((comment) => (
                    <div
                      key={comment._id || comment.text}
                      className="border-b border-gray-200 pb-4 sm:pb-6"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 sm:h-6 w-5 sm:w-6 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                              {comment.author || "Anonymous"}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm sm:text-base text-gray-700">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Speech Controls - Mobile */}
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            {(speechState === "playing" || speechState === "paused") && (
              <div className="bg-white shadow-lg rounded-lg px-3 py-2 w-48 animate-fade-in">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {languages.find((l) => l.code === language)?.name ||
                      "English"}
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
                    .slice(
                      Math.max(0, currentWordIndex - 1),
                      currentWordIndex + 2
                    )
                    .join(" ")}
                </div>
              </div>
            )}

            <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-xl border border-gray-100">
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
        )}

        {/* Speech Controls - Desktop */}
        {!isMobile && (
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
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
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
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  speechState === "playing" || speechState === "paused"
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm"
                }`}
                aria-label="Select language"
              >
                <FaVolumeUp size={18} />
              </button>
            </div>
          </div>
        )}

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
                  aria-label="Close modal"
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
                          <span className="text-sm sm:text-base">
                            {lang.name}
                          </span>
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
      </main>
    </>
  );
};

export default ArticlePage;