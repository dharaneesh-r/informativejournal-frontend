"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import Loading from "./loading";
import Link from "next/link";
import Image from "next/image";
import {
  FaPlay,
  FaStop,
  FaLanguage,
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaMicrophone,
  FaBell,
  FaShareAlt,
  FaTimes,
  FaBook,
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedPosts() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroArticles, setHeroArticles] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSavedArticles, setShowSavedArticles] = useState(false);

  // Refs for GSAP animations
  const searchBarRef = useRef(null);
  const voiceButtonRef = useRef(null);
  const fabMenuRef = useRef(null);
  const fabButtonRef = useRef(null);
  const savedPanelRef = useRef(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      setIsSpeechSupported(true);
    }
  }, []);

  // GSAP animations
  useEffect(() => {
    if (searchBarRef.current) {
      if (isSearchFocused) {
        gsap.to(searchBarRef.current, {
          scale: 1.02,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          duration: 0.3,
        });
      } else {
        gsap.to(searchBarRef.current, {
          scale: 1,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          duration: 0.3,
        });
      }
    }
  }, [isSearchFocused]);

  useEffect(() => {
    if (isListening && voiceButtonRef.current) {
      gsap.to(voiceButtonRef.current, {
        x: [-2, 2, -2, 2, 0],
        duration: 0.5,
        repeat: 1,
        ease: "power1.inOut",
      });
    }
  }, [isListening]);

  useEffect(() => {
    if (fabMenuRef.current && fabButtonRef.current) {
      if (isFabExpanded) {
        gsap.to(fabMenuRef.current, {
          opacity: 1,
          height: "auto",
          width: "18rem",
          padding: "1rem",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(fabButtonRef.current, {
          rotate: 180,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(fabMenuRef.current, {
          opacity: 0,
          height: 0,
          width: 0,
          padding: 0,
          duration: 0.3,
          ease: "power2.in",
        });
        gsap.to(fabButtonRef.current, {
          rotate: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }
  }, [isFabExpanded]);

  useEffect(() => {
    if (savedPanelRef.current) {
      if (showSavedArticles) {
        gsap.fromTo(
          savedPanelRef.current,
          { x: 300, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      } else {
        gsap.to(savedPanelRef.current, {
          x: 300,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    }
  }, [showSavedArticles]);

  // Supported languages
  const languages = [
    { code: "en-US", name: "English" },
    { code: "es-ES", name: "Spanish" },
    { code: "hi-IN", name: "Hindi" },
    { code: "ta-IN", name: "Tamil" },
  ];

  const nextLanguage = () => {
    const currentIndex = languages.findIndex((lang) => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          "https://informativejournal-backend.vercel.app/articles"
        );
        if (response.data.status === "success") {
          setArticles(response.data.data);
          setHeroArticles(response.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(<Loading />);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Load saved articles from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("savedArticles")) || [];
      setSavedArticles(saved);
    }
  }, []);

  // Save or remove an article
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

    // Show the saved articles panel when saving
    if (!isSaved) {
      setShowSavedArticles(true);
    }
  };

  // GSAP animations for article cards
  useEffect(() => {
    gsap.from(".fade-in", {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: ".fade-in",
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  }, [articles]);

  // Shuffle hero articles
  useEffect(() => {
    if (articles.length > 0) {
      const interval = setInterval(() => {
        const shuffledArticles = [...articles].sort(() => Math.random() - 0.5);
        setHeroArticles(shuffledArticles.slice(0, 4));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [articles]);

  // Auto-read news feature
  useEffect(() => {
    if (
      articles.length > 0 &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      const speech = new SpeechSynthesisUtterance();
      speech.lang = language;
      speech.rate = 1;
      speech.pitch = 1;
      const newsText = articles
        .map((article) => `${article.title}. ${article.description}`)
        .join(". ");
      speech.text = newsText;

      if (isSpeaking) {
        window.speechSynthesis.speak(speech);
      }

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, [articles, isSpeaking, language]);

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

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      preferredCategories.length === 0 ||
      preferredCategories.includes(article.category);
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderArticlesWithHero = () => {
    const result = [];
    let heroCount = 0;

    for (let i = 0; i < filteredArticles.length; i += 3) {
      const chunk = filteredArticles.slice(i, i + 3);
      chunk.forEach((article) => {
        const isSaved = savedArticles.some((a) => a._id === article._id);
        result.push(
          <div
            key={article._id}
            className="bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105 fade-in relative"
          >
            <Link href={`/${article.category}/${article.slug}`}>
              <div className="w-full h-48 relative">
                <Image
                  src={article.image || "/news-image.jpg"}
                  alt={article.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold hover:text-blue-600">
                  {article.title}
                </h3>
                <p className="text-gray-600 mt-2">{article.description}</p>
                <div className="flex items-center mt-4 text-gray-500">
                  <span className="text-sm">
                    By {article.author || "Unknown"}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="text-sm">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveArticle(article);
              }}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
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
                navigator.share({
                  title: article.title,
                  text: article.description,
                  url: `https://informativejournal.vercel.app/${article.category}/${article.slug}`,
                });
              }}
              className="absolute top-4 right-16 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <FaShareAlt className="text-gray-500" />
            </button>
          </div>
        );
      });
      if (heroCount < heroArticles.length) {
        const heroArticle = heroArticles[heroCount];
        result.push(
          <div
            key={`hero-${heroCount}`}
            className="col-span-1 md:col-span-2 lg:col-span-3 fade-in relative"
          >
            <Link href={`/${heroArticle.category}/${heroArticle.slug}`}>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={heroArticle.image || "/news-image.jpg"}
                  alt={heroArticle.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-bold text-white">
                    {heroArticle.title}
                  </h2>
                  <p className="text-gray-200 mt-2">
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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveArticle(heroArticle);
              }}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              {savedArticles.some((a) => a._id === heroArticle._id) ? (
                <FaBookmark className="text-blue-600" />
              ) : (
                <FaRegBookmark className="text-gray-500" />
              )}
            </button>
          </div>
        );
        heroCount++;
      }
    }

    return result;
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
    <div className="relative">
      <section className="max-w-7xl mx-auto p-6 mt-10">
        <h2 className="text-4xl font-bold text-center mb-12 fade-in"></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.length > 0 ? (
            renderArticlesWithHero()
          ) : (
            <p className="text-center col-span-3">
              <Loading />
            </p>
          )}
        </div>
      </section>

      {/* Saved Articles Panel */}
      <div
        ref={savedPanelRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 p-4 overflow-y-auto ${
          showSavedArticles ? "block" : "hidden"
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
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <div
            ref={fabMenuRef}
            className="flex flex-col gap-2 bg-white shadow-lg rounded-lg overflow-hidden w-0 h-0 opacity-0"
          >
            {/* Search Bar */}
            <div
              ref={searchBarRef}
              className={`flex items-center bg-white shadow-lg rounded-full px-4 py-2 w-full transition-all duration-300 ${
                isSearchFocused ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="ml-2 outline-none flex-1"
              />
              {isSpeechSupported && (
                <button
                  ref={voiceButtonRef}
                  onClick={() => {
                    setIsListening(!isListening);
                    setIsFabExpanded(false);
                  }}
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

            {/* Other FAB Buttons */}
            <button
              onClick={() => {
                setIsFabExpanded(false);
                alert("Notifications enabled!");
              }}
              className="flex items-center justify-between bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <FaBell className="mr-2" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => {
                setIsFabExpanded(false);
                setIsSpeaking(!isSpeaking);
              }}
              className="flex items-center justify-between bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              {isSpeaking ? (
                <>
                  <FaStop className="mr-2" />
                  <span>Stop Reading</span>
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  <span>Start Reading</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsFabExpanded(false);
                nextLanguage();
              }}
              className="flex items-center justify-between bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors"
            >
              <FaLanguage className="mr-2" />
              <span>
                {languages.find((lang) => lang.code === language)?.name ||
                  "Unknown"}
              </span>
            </button>
          </div>

          {/* Main FAB Button */}
          <button
            ref={fabButtonRef}
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors animate-fade-in"
          >
            {isFabExpanded ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaPlay className="text-xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
