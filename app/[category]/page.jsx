"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger, ScrollToPlugin } from "gsap/all";
import axios from "axios";
import { useParams } from "next/navigation";
import Loading from "../loading";
import Link from "next/link";
import Image from "next/image";
import {
  FaPlay,
  FaStop,
  FaPause,
  FaVolumeUp,
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaMicrophone,
  FaShareAlt,
  FaTimes,
  FaBook,
  FaTrophy,
  FaCheck,
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function CategoryPage() {
  // State management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroArticle, setHeroArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [showSavedArticles, setShowSavedArticles] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          `https://informativejournal-backend.vercel.app/articles/${category}`
        );
        if (response.data.status === "success") {
          setArticles(response.data.data);
          // Set first article as hero article
          if (response.data.data.length > 0) {
            setHeroArticle(response.data.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(<Loading />);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

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

  // GSAP animations
  useEffect(() => {
    if (articles.length === 0) return;

    // Article animations
    gsap.utils.toArray(".fade-in").forEach((element, i) => {
      gsap.from(element, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        delay: i * 0.1,
      });
    });

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
        {/* Hero Article */}
        {heroArticle &&
          filteredArticles.some((a) => a._id === heroArticle._id) && (
            <div
              key={`hero-${heroArticle._id}`}
              className="col-span-1 md:col-span-2 lg:col-span-3 fade-in relative hero-article"
            >
              <Link href={`/${heroArticle.category}/${heroArticle.slug}`}>
                <div className="relative h-80 sm:h-96 rounded-lg overflow-hidden">
                  <Image
                    src={heroArticle.image || "/news-image.jpg"}
                    alt={heroArticle.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {heroArticle.title}
                    </h2>
                    <p className="text-gray-200 mt-2 line-clamp-2">
                      {heroArticle.description}
                    </p>
                    <div className="flex items-center mt-4 text-gray-300">
                      <span className="text-sm">
                        By {heroArticle.author || "Unknown"}
                      </span>
                      <span className="mx-2">|</span>
                      <span className="text-sm">
                        {new Date(heroArticle.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSaveArticle(heroArticle);
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  {savedArticles.some((a) => a._id === heroArticle._id) ? (
                    <FaBookmark className="text-blue-600" />
                  ) : (
                    <FaRegBookmark className="text-gray-500" />
                  )}
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
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <FaVolumeUp className="text-blue-500" />
                </button>
              </div>
            </div>
          )}

        {/* Regular Articles in groups of 3 */}
        {Array.from({ length: Math.ceil(regularArticles.length / 3) }).map(
          (_, groupIndex) => {
            const chunk = regularArticles.slice(
              groupIndex * 3,
              groupIndex * 3 + 3
            );
            return (
              <div key={`group-${groupIndex}`} className="contents">
                {chunk.map((article, index) => {
                  const globalIndex = filteredArticles.findIndex(
                    (a) => a._id === article._id
                  );
                  const isSaved = savedArticles.some(
                    (a) => a._id === article._id
                  );
                  const isCurrentArticle =
                    globalIndex === currentArticleIndex &&
                    (speechState === "playing" || speechState === "paused");

                  return (
                    <div
                      key={article._id}
                      ref={(el) => (articleRefs.current[globalIndex] = el)}
                      className={`bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-[1.02] fade-in relative ${
                        isCurrentArticle ? "ring-4 ring-blue-500" : ""
                      }`}
                    >
                      <Link href={`/${article.category}/${article.slug}`}>
                        <div className="w-full h-48 sm:h-56 relative">
                          <Image
                            src={article.image || "/news-image.jpg"}
                            alt={article.title}
                            className="object-cover"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="text-lg sm:text-xl font-semibold hover:text-blue-600 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 mt-2 line-clamp-3">
                            {article.description}
                          </p>
                          <div className="flex items-center mt-4 text-gray-500">
                            <span className="text-xs sm:text-sm">
                              By {article.author || "Unknown"}
                            </span>
                            <span className="mx-2">|</span>
                            <span className="text-xs sm:text-sm">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSaveArticle(article);
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          {isSaved ? (
                            <FaBookmark className="text-blue-600 cursor-pointer" />
                          ) : (
                            <FaRegBookmark className="text-gray-500 cursor-pointer" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.share({
                              title: article.title,
                              text: article.description,
                              url: `https://informativejournal.vercel.app/${article.category}/${article.slug}`,
                            });
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          <FaShareAlt className="text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentArticleIndex(globalIndex);
                            startSpeech(article);
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          <FaVolumeUp className="text-blue-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
        )}
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-10 fade-in">
        </h2>

        {/* Search Bar - Mobile */}
        <div className="mb-6 sm:hidden">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {renderArticles()}
        </div>
      </section>

      {/* Saved Articles Panel */}
      <div
        ref={savedPanelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-xl z-50 p-4 overflow-y-auto transition-transform duration-300 ${
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
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-xl z-50 p-4 overflow-y-auto transition-transform duration-300 ${
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
        <div className="text-center py-8">
          <p className="text-gray-500">Gamification dashboard coming soon!</p>
        </div>
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
          {savedArticles.length > 0 && (
            <button
              onClick={() => {
                setIsFabExpanded(false);
                setShowSavedArticles(!showSavedArticles);
              }}
              className="flex items-center justify-center w-12 h-12 bg-yellow-600 text-white rounded-full shadow-lg hover:bg-yellow-700 transition-colors"
            >
              <FaBookmark className="text-lg" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {savedArticles.length}
              </span>
            </button>
          )}
          <button
            onClick={() => {
              setIsFabExpanded(false);
              setShowGamification(!showGamification);
            }}
            className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          >
            <FaTrophy className="text-lg" />
          </button>
          <div
            ref={fabMenuRef}
            className={`flex flex-col gap-2 bg-white shadow-lg rounded-lg overflow-hidden ${
              isFabExpanded ? "w-64 p-4 opacity-100" : "w-0 h-0 opacity-0"
            } transition-all duration-300`}
          >
            {/* Search Bar - Desktop */}
            <div className="hidden sm:flex items-center bg-white border rounded-full px-4 py-2 w-full">
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
                    className={`text-gray-500 ${
                      isListening ? "text-white" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Speech Controls */}
            <button
              onClick={toggleSpeech}
              className={`flex items-center justify-between px-4 py-2 rounded-full shadow-lg transition-colors ${
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
              className="flex items-center justify-between bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <FaVolumeUp className="mr-2" />
              <span>Change Language</span>
            </button>

            <button
              onClick={() => {
                setIsFabExpanded(false);
                stopSpeech();
              }}
              className="flex items-center justify-between bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
            >
              <FaStop className="mr-2" />
              <span>Stop Reading</span>
            </button>
          </div>

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
