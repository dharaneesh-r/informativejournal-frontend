// "use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import {
  FaTrophy,
  FaStar,
  FaFire,
  FaBook,
  FaShareAlt,
  FaBookOpen,
  FaCommentAlt,
  FaUser,
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = "https://informativejournal-backend.vercel.app";

export default function GamificationDashboard() {
  const [gamificationData, setGamificationData] = useState({
    xp: 0,
    level: 1,
    activity: {
      reads: 0,
      completes: 0,
      shares: 0,
      comments: 0,
    },
    badges: [],
    settings: {
      xpRates: {
        read: 10,
        complete: 20,
        share: 15,
        comment: 5,
      },
    },
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // Animation refs
  const containerRef = useRef(null);
  const xpBarRef = useRef(null);
  const profileRef = useRef(null);
  const statsRef = useRef(null);
  const badgesRef = useRef(null);
  const leaderboardRef = useRef(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "Guest";
    const id = localStorage.getItem("userId") || "";
    setUserEmail(email);
    setUserId(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [userResponse, leaderboardResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/gamification/${userId}`),
          axios.get(`${API_BASE_URL}/leaderboard`),
        ]);

        // Transform the API response to match our expected structure
        const apiData = userResponse.data.data[0];
        const transformedData = {
          xp: apiData.xp || 0,
          level: apiData.level || 1,
          activity: {
            reads: apiData.activity?.reads || 0,
            completes: apiData.activity?.completes || 0,
            shares: apiData.activity?.shares || 0,
            comments: apiData.activity?.comments || 0,
          },
          badges: apiData.badges || [],
          settings: {
            xpRates: apiData.settings?.xpRates || {
              read: 10,
              complete: 20,
              share: 15,
              comment: 5,
            },
          },
        };

        setGamificationData(transformedData);
        setLeaderboard(leaderboardResponse.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const checkLevelUp = (newXp, currentLevel) => {
    const newLevel = Math.floor(newXp / 1000) + 1;
    if (newLevel > currentLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  };

  const awardXp = async (action) => {
    try {
      // Optimistic UI update
      const currentXp = gamificationData.xp;
      const currentLevel = gamificationData.level;
      const xpGain = gamificationData.settings.xpRates[action];
      const newXp = currentXp + xpGain;

      setGamificationData((prev) => ({
        ...prev,
        xp: newXp,
        activity: {
          ...prev.activity,
          [action]: (prev.activity[action] || 0) + 1,
        },
      }));

      checkLevelUp(newXp, currentLevel);

      // Button click animation
      const button = document.querySelector(`[data-action="${action}"]`);
      if (button) {
        gsap.fromTo(
          button,
          { scale: 0.9, y: 5 },
          {
            scale: 1.1,
            y: 0,
            duration: 0.3,
            ease: "elastic.out(1, 0.5)",
            onComplete: () => {
              gsap.to(button, { scale: 1, duration: 0.2 });
            },
          }
        );
      }

      // XP bar animation
      if (xpBarRef.current) {
        gsap.to(xpBarRef.current, {
          width: `${(newXp % 1000) / 10}%`,
          duration: 0.8,
          ease: "power2.out",
        });
      }

      // Actual API call
      await axios.post(`${API_BASE_URL}/xp`, {
        userId,
        action,
      });
    } catch (err) {
      console.error("Failed to award XP:", err);
      // Revert optimistic update if API call fails
      setGamificationData((prev) => ({
        ...prev,
        xp: currentXp,
        activity: {
          ...prev.activity,
          [action]: (prev.activity[action] || 0) - 1,
        },
      }));
    }
  };

  // Setup animations when data loads
  useEffect(() => {
    if (!loading) {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Desktop animations
        gsap.from(containerRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
        });

        gsap.from(profileRef.current, {
          x: -50,
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "back.out(1.2)",
        });

        if (xpBarRef.current) {
          gsap.from(xpBarRef.current, {
            width: 0,
            duration: 1.2,
            delay: 0.4,
            ease: "power3.out",
          });
        }

        gsap.from(".stat-item", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.6,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        });

        gsap.from(".badge-item", {
          scale: 0,
          rotation: -15,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: badgesRef.current,
            start: "top 80%",
          },
        });

        gsap.from(".leaderboard-item", {
          y: 50,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 1.0,
          ease: "back.out(1)",
          scrollTrigger: {
            trigger: leaderboardRef.current,
            start: "top 80%",
          },
        });

        gsap.from(".action-button", {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 1.2,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: actionsRef.current,
            start: "top 80%",
          },
        });
      });

      mm.add("(max-width: 767px)", () => {
        // Mobile animations
        gsap.from(containerRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.4,
          ease: "power2.out",
        });

        gsap.from(profileRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.6,
          delay: 0.1,
          ease: "back.out(1.2)",
        });

        if (xpBarRef.current) {
          gsap.from(xpBarRef.current, {
            width: 0,
            duration: 0.8,
            delay: 0.3,
            ease: "power2.out",
          });
        }

        gsap.from(".stat-item", {
          y: 15,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.4,
          ease: "back.out(1)",
        });

        gsap.from(".badge-item", {
          scale: 0,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.5,
          ease: "back.out(1.5)",
        });

        gsap.from(".leaderboard-item", {
          y: 20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.6,
          ease: "back.out(1)",
        });

        gsap.from(".action-button", {
          y: 15,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.7,
          ease: "back.out(1.2)",
        });
      });

      return () => mm.revert();
    }
  }, [loading]);

  // Level up animation
  useEffect(() => {
    if (showLevelUp) {
      const tl = gsap.timeline();
      tl.fromTo(
        ".level-up-container",
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
      tl.from(
        ".level-up-emoji",
        { y: -30, rotation: -15, opacity: 0, duration: 0.4 },
        "-=0.3"
      );
      tl.to(
        ".level-up-container",
        { y: -10, repeat: 3, yoyo: true, duration: 0.2 },
        "-=0.2"
      );
    }
  }, [showLevelUp]);

  const getBadgeIcon = (badgeId) => {
    switch (badgeId) {
      case "first_read":
        return <FaBookOpen className="text-blue-500" />;
      case "share_master":
        return <FaShareAlt className="text-green-500" />;
      case "fast_learner":
        return <FaFire className="text-orange-500" />;
      case "bookworm":
        return <FaBook className="text-indigo-500" />;
      default:
        return <FaStar className="text-yellow-400" />;
    }
  };

  const getBadgeName = (badgeId) => {
    switch (badgeId) {
      case "first_read":
        return "First Read";
      case "share_master":
        return "Share Master";
      case "fast_learner":
        return "Fast Learner";
      case "bookworm":
        return "Bookworm";
      default:
        return "Achiever";
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-400 text-white";
      case 1:
        return "bg-gray-300 text-white";
      case 2:
        return "bg-amber-600 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg max-w-md mx-auto mt-8">
        <div className="flex items-center">
          <div>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl overflow-hidden p-4 md:p-6 max-w-4xl mx-auto my-4 md:my-8 shadow-sm"
    >
      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="level-up-container bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 md:p-8 rounded-lg max-w-xs md:max-w-md text-center shadow-xl">
            <div className="level-up-emoji text-5xl md:text-6xl mb-4">🎉</div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Level Up!</h3>
            <p className="text-base md:text-lg">
              You've reached level {gamificationData.level}!
            </p>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div
        ref={profileRef}
        className="flex items-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm"
      >
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden shadow-md">
          {userEmail ? (
            <span className="text-xl md:text-2xl text-white font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          ) : (
            <FaUser className="text-white text-xl md:text-2xl" />
          )}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">
            {userEmail || "Guest User"}
          </h2>
          <div className="flex items-center">
            <span className="text-sm md:text-base text-gray-600 mr-2">
              Level {gamificationData.level}
            </span>
            <div className="flex-1 max-w-[180px] md:max-w-xs">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  ref={xpBarRef}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full shadow-inner"
                  style={{ width: `${(gamificationData.xp % 1000) / 10}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {gamificationData.xp % 1000}/1000
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8"
      >
        {[
          {
            icon: <FaBookOpen />,
            key: "reads",
            label: "Reads",
            color: "blue",
            points: gamificationData.settings.xpRates.read,
          },
          {
            icon: <FaBook />,
            key: "completes",
            label: "Completes",
            color: "green",
            points: gamificationData.settings.xpRates.complete,
          },
          {
            icon: <FaShareAlt />,
            key: "shares",
            label: "Shares",
            color: "purple",
            points: gamificationData.settings.xpRates.share,
          },
          {
            icon: <FaCommentAlt />,
            key: "comments",
            label: "Comments",
            color: "indigo",
            points: gamificationData.settings.xpRates.comment,
          },
        ].map(({ icon, key, label, color, points }) => (
          <div
            key={key}
            className={`stat-item bg-${color}-50 rounded-lg p-3 md:p-4 flex items-center shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div
              className={`bg-${color}-100 p-2 md:p-3 rounded-full mr-3 text-${color}-600 shadow-inner`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-500 truncate">
                {label}
              </p>
              <div className="flex items-center">
                <p className="text-sm md:text-base font-bold text-gray-800 mr-2 truncate">
                  {gamificationData.activity[key] || 0}
                </p>
                <span
                  className={`text-xs text-${color}-700 font-medium truncate`}
                >
                  +{points}XP
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badges Section */}
      <div ref={badgesRef} className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
          Your Achievements
        </h2>
        {gamificationData.badges?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {gamificationData.badges.map((badge) => (
              <div
                key={badge.id}
                className="badge-item flex flex-col items-center p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center mb-2 shadow-inner">
                  {getBadgeIcon(badge.id)}
                </div>
                <span className="text-xs md:text-sm font-medium text-center text-gray-700 truncate w-full">
                  {getBadgeName(badge.id)}
                </span>
                <span className="text-2xs md:text-xs text-gray-500 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 text-center shadow-inner">
            <p className="text-sm md:text-base text-gray-500">
              Complete activities to earn badges!
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard Section */}
      <div ref={leaderboardRef} className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
          Community Leaders
        </h2>
        {leaderboard?.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {leaderboard.map((user, index) => (
              <div
                key={user._id || index}
                className={`leaderboard-item flex items-center p-3 md:p-4 rounded-lg ${
                  index < 3
                    ? "bg-gradient-to-r from-gray-50 to-white"
                    : "bg-white"
                } shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100`}
              >
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full mr-3 md:mr-4 text-xs md:text-sm font-bold ${getRankColor(
                    index
                  )}`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-medium text-gray-800 truncate">
                    {user.user?.email || "Anonymous"}
                  </h3>
                  <div className="flex justify-between text-xs md:text-sm text-gray-500">
                    <span>Level {user.level}</span>
                    <span>{user.xp} XP</span>
                  </div>
                </div>
                {index < 3 && (
                  <div className="ml-2 md:ml-4">
                    <FaTrophy
                      className={
                        index === 0
                          ? "text-yellow-400"
                          : index === 1
                          ? "text-gray-400"
                          : "text-amber-600"
                      }
                      size={14}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 text-center shadow-inner">
            <p className="text-sm md:text-base text-gray-500">
              No leaderboard data available yet
            </p>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div ref={actionsRef} className="mt-6 md:mt-8">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {[
            {
              icon: <FaBookOpen />,
              action: "read",
              label: "Read",
              fullLabel: "Read Article",
              color: "blue",
            },
            {
              icon: <FaBook />,
              action: "complete",
              label: "Complete",
              color: "green",
            },
            {
              icon: <FaShareAlt />,
              action: "share",
              label: "Share",
              color: "purple",
            },
            {
              icon: <FaCommentAlt />,
              action: "comment",
              label: "Comment",
              color: "indigo",
            },
          ].map(({ icon, action, label, fullLabel, color }) => (
            <button
              key={action}
              data-action={action}
              onClick={() => awardXp(action)}
              className={`action-button bg-${color}-50 hover:bg-${color}-100 text-${color}-600 py-2 px-2 md:px-4 rounded-lg flex items-center justify-center transition-all duration-200 text-xs md:text-sm shadow-sm hover:shadow-md`}
            >
              <span className={`text-${color}-600 mr-1 md:mr-2`}>{icon}</span>
              <span className="hidden sm:inline">{fullLabel || label}</span>
              <span className="sm:hidden">{label}</span>
              <span className={`ml-1 text-${color}-700 font-bold`}>
                +{gamificationData.settings.xpRates[action]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}