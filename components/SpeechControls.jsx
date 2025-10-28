"use client";
import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaTimes, FaCheck } from "react-icons/fa";

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

export default function SpeechControls({ 
  articles,
  currentArticleIndex,
  setCurrentArticleIndex,
  articleRefs,
  isMobile = false,
  triggerStart = null // Article to start speech for
}) {
  const [speechState, setSpeechState] = useState("idle"); // idle, playing, paused
  const [language, setLanguage] = useState("en-US");
  const [speechProgress, setSpeechProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  
  const speechRef = useRef({
    utterance: null,
    startTime: 0,
    pauseTime: 0,
    words: [],
    currentArticle: null,
  });
  const progressIntervalRef = useRef(null);
  const modalRef = useRef(null);
  const fabButtonRef = useRef(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLanguageModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startSpeech = (article = null) => {
    if (!articles || articles.length === 0) {
      alert("No articles available to read");
      return;
    }

    const targetArticle = article || articles[currentArticleIndex];
    if (!targetArticle) {
      alert("Article not found");
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech not supported in your browser");
      return;
    }

    window.speechSynthesis.cancel();

    const contentToRead = `${targetArticle.title}. ${targetArticle.description}. ${targetArticle.content?.map((c) => c.content).join(" ") || ""}`;
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
    clearInterval(progressIntervalRef.current);
    
    progressIntervalRef.current = setInterval(() => {
      setSpeechState((currentState) => {
        if (currentState === "playing") {
          const elapsed = Date.now() - speechRef.current.startTime;
          const estimatedTotal = (contentToRead.length / 15) * 1000;
          const progress = Math.min((elapsed / estimatedTotal) * 100, 100);
          setSpeechProgress(progress);

          const wordsPerMs = words.length / estimatedTotal;
          const currentWord = Math.floor(elapsed * wordsPerMs);
          setCurrentWordIndex(Math.min(currentWord, words.length - 1));
        }
        return currentState;
      });
    }, 100);

    speech.onboundary = (event) => {
      if (event.name === "word") {
        const wordIndex = speechRef.current.words.findIndex(
          (_, i) => i >= event.charIndex
        );
        if (wordIndex !== -1) setCurrentWordIndex(wordIndex);
      }
    };

    speech.onend = () => {
      setSpeechState("idle");
      clearInterval(progressIntervalRef.current);
      setSpeechProgress(0);

      // Auto-advance to next article
      if (!article && currentArticleIndex < articles.length - 1) {
        const nextIndex = currentArticleIndex + 1;
        setCurrentArticleIndex(nextIndex);
        setTimeout(() => {
          if (articleRefs && articleRefs.current && articleRefs.current[nextIndex]) {
            articleRefs.current[nextIndex].scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
          }
          setTimeout(() => startSpeech(), 1000);
        }, 1000);
      }
    };

    speech.onerror = (error) => {
      console.error("Speech error:", error);
      setSpeechState("idle");
      clearInterval(progressIntervalRef.current);
      setSpeechProgress(0);
    };

    window.speechSynthesis.speak(speech);
    setSpeechState("playing");
    
    // Scroll to article if refs are available
    if (articleRefs && articleRefs.current && articleRefs.current[currentArticleIndex]) {
      setTimeout(() => {
        articleRefs.current[currentArticleIndex]?.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }, 300);
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
    setIsFabExpanded(false);
  };

  const toggleSpeech = () => {
    if (speechState === "idle") {
      startSpeech();
    } else if (speechState === "playing") {
      pauseSpeech();
    } else if (speechState === "paused") {
      resumeSpeech();
    }
  };

  const selectLanguage = (langCode) => {
    const wasPlaying = speechState === "playing";
    const wasPaused = speechState === "paused";

    setLanguage(langCode);
    setShowLanguageModal(false);

    if (wasPlaying || wasPaused) {
      stopSpeech();
      setTimeout(() => startSpeech(), 300);
    }
  };

  // Auto-start speech when triggerStart changes (article clicked)
  useEffect(() => {
    if (triggerStart && articles && articles.length > 0) {
      // Find article index
      const index = articles.findIndex((a) => a._id === triggerStart._id);
      if (index !== -1) {
        setCurrentArticleIndex(index);
        // Start speech immediately
        setTimeout(() => {
          startSpeech(triggerStart);
        }, 100);
      }
    }
  }, [triggerStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  return (
    <>
      {/* Speech Progress Indicator */}
      {(speechState === "playing" || speechState === "paused") && (
        <div
          className={`fixed ${
            isMobile ? "bottom-20 right-4 w-48" : "bottom-6 left-6 w-64"
          } z-40 bg-white shadow-lg rounded-lg px-4 py-3 border border-gray-200`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700">
              {languages.find((l) => l.code === language)?.name || "English"}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(speechProgress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
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

      {/* FAB Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end gap-3">
          {isFabExpanded && (
            <div className="bg-white shadow-xl rounded-lg p-4 mb-2 w-64 border border-gray-200">
              <div className="flex flex-col gap-2">
                <button
                  onClick={toggleSpeech}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
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
                      <span>Pause</span>
                    </>
                  ) : speechState === "paused" ? (
                    <>
                      <FaPlay className="mr-2" />
                      <span>Resume</span>
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
                  className="flex items-center justify-between bg-gray-700 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
                >
                  <FaVolumeUp className="mr-2" />
                  <span>Change Language</span>
                </button>

                <button
                  onClick={stopSpeech}
                  className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
                >
                  <FaStop className="mr-2" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          )}

          <button
            ref={fabButtonRef}
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className="flex items-center justify-center w-14 h-14 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Speech controls"
          >
            {isFabExpanded ? (
              <FaTimes className="text-lg" />
            ) : (
              <FaVolumeUp className="text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className={`bg-white rounded-lg shadow-xl w-full ${
              isMobile ? "max-w-xs" : "max-w-md"
            } max-h-[80vh] overflow-hidden`}
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

            <div className="overflow-y-auto max-h-[60vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                        <FaCheck className="text-blue-600" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

