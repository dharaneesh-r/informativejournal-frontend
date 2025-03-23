"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import Loading from "../loading";
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
} from "react-icons/fa"; // Import icons

gsap.registerPlugin(ScrollTrigger);

export default function CategoryPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroArticles, setHeroArticles] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);

  const params = useParams();
  const category = params.category;

  // Refs for GSAP animations
  const fabMenuRef = useRef(null);
  const fabButtonRef = useRef(null);
  const searchBarRef = useRef(null);
  const voiceButtonRef = useRef(null);

  // Supported languages
  const languages = [
    { code: "en-US", name: "English" },
    { code: "es-ES", name: "Spanish" },
    { code: "hi-IN", name: "Hindi" },
    { code: "ta-IN", name: "Tamil" },
  ];

  // Check if Web Speech API is supported
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      setIsSpeechSupported(true);
    }
  }, []);

  // GSAP animations for FAB expansion and collapse
  useEffect(() => {
    if (fabMenuRef.current && fabButtonRef.current) {
      if (isFabExpanded) {
        // Expand the FAB menu
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
        // Collapse the FAB menu
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

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          `https://informativejournal-backend.vercel.app/articles/${category}`
        );
        console.log("API Response:", response.data);
        if (response.data.status === "success") {
          setArticles(response.data.data);
          setHeroArticles(response.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

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

  // Shuffle hero articles every 10 seconds
  useEffect(() => {
    if (articles.length > 0) {
      const interval = setInterval(() => {
        const shuffledArticles = [...articles].sort(() => Math.random() - 0.5);
        setHeroArticles(shuffledArticles.slice(0, 4));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [articles]);

  // Auto-read news feature with language support
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

      // Start speaking
      if (isSpeaking) {
        window.speechSynthesis.speak(speech);
      }

      // Cleanup function to stop speech when the component unmounts or isSpeaking changes
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

  // Filter articles based on search query
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Render articles with hero section
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
            className="bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105 fade-in"
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
              onClick={() => toggleSaveArticle(article)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              {isSaved ? (
                <FaBookmark className="text-blue-600" />
              ) : (
                <FaRegBookmark className="text-gray-500" />
              )}
            </button>
            <button
              onClick={() => {
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
            className="col-span-1 md:col-span-2 lg:col-span-3 fade-in"
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
          </div>
        );
        heroCount++;
      }
    }

    return result;
  };

  // Function to cycle through languages
  const nextLanguage = () => {
    const currentIndex = languages.findIndex((lang) => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
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
    <section className="max-w-7xl mx-auto p-6 mt-10">
      <h2 className="text-4xl font-bold text-center mb-12 fade-in">
      </h2>

      {/* Main Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.length > 0 ? (
          renderArticlesWithHero()
        ) : (
          <p className="text-center col-span-3">
            <Loading />
          </p>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end gap-2">
          {/* FAB Menu */}
          <div
            ref={fabMenuRef}
            className="flex flex-col gap-2 bg-white shadow-lg rounded-lg overflow-hidden w-0 h-0 opacity-0"
          >
            {/* Search Bar */}
            <div
              ref={searchBarRef}
              className="flex items-center bg-white shadow-lg rounded-full px-4 py-2 w-full"
            >
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
                  ref={voiceButtonRef}
                  onClick={() => setIsListening(!isListening)}
                  className="ml-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FaMicrophone className="text-gray-500" />
                </button>
              )}
            </div>

            {/* Notification Button */}
            <button
              onClick={() => alert("Notifications enabled!")}
              className="flex items-center justify-between bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <FaBell className="mr-2" />
              <span>Notifications</span>
            </button>

            {/* Auto-Read Button */}
            <button
              onClick={() => setIsSpeaking(!isSpeaking)}
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

            {/* Language Selection Button */}
            <button
              onClick={nextLanguage}
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
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            {isFabExpanded ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaPlay className="text-xl" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
