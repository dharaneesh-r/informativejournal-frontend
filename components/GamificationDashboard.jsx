"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

export default function GamificationSystem() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // Refs for animations
  const systemRef = useRef();
  const sectionRefs = useRef([]);
  const tabRefs = useRef([]);

  // State
  const [activeTab, setActiveTab] = useState("profile");
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [badges, setBadges] = useState([]);
  const [userActions, setUserActions] = useState({
    articlesRead: 0,
    articlesShared: 0,
    commentsMade: 0,
    articlesBookmarked: 0,
  });

  // Check authentication on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");

    if (authToken && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    } else {
      setIsAuthenticated(false);
      // Redirect to login if not authenticated
      router.push("/login");
    }
    setLoading(false);
  }, [router]);

  // Initialize user data
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      // Load user data from localStorage
      const savedData = localStorage.getItem(`gamification-${userEmail}`);
      if (savedData) {
        const { points, streak, badges, challenges, actions } =
          JSON.parse(savedData);
        setPoints(points || 0);
        setStreak(streak || 0);
        setBadges(badges || []);
        setCompletedChallenges(challenges?.completed || 0);
        setUserActions(
          actions || {
            articlesRead: 0,
            articlesShared: 0,
            commentsMade: 0,
            articlesBookmarked: 0,
          }
        );
      } else {
        // Initialize new user
        setBadges([
          { id: 1, name: "Fast Reader", icon: "🏃‍♂️", unlocked: false },
          { id: 2, name: "News Junkie", icon: "📰", unlocked: false },
          { id: 3, name: "Night Owl", icon: "🌙", unlocked: false },
          { id: 4, name: "Debater", icon: "💬", unlocked: false },
          { id: 5, name: "Early Bird", icon: "🌅", unlocked: false },
          { id: 6, name: "Global Citizen", icon: "🌍", unlocked: false },
        ]);
      }
    }
  }, [isAuthenticated, userEmail]);

  // Save user data on changes
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      const userData = {
        points,
        streak,
        badges,
        challenges: { completed: completedChallenges },
        actions: userActions,
      };
      localStorage.setItem(
        `gamification-${userEmail}`,
        JSON.stringify(userData)
      );
    }
  }, [
    points,
    streak,
    badges,
    completedChallenges,
    userActions,
    isAuthenticated,
    userEmail,
  ]);

  // Challenges data
  const challenges = [
    {
      id: 1,
      text: "Read 3 articles",
      completed: userActions.articlesRead >= 3,
    },
    { id: 2, text: "Read a politics article", completed: false },
    {
      id: 3,
      text: "Share an article",
      completed: userActions.articlesShared > 0,
    },
    {
      id: 4,
      text: "Comment on a story",
      completed: userActions.commentsMade > 0,
    },
  ];

  // Update challenges completion status
  useEffect(() => {
    const completed = challenges.filter((c) => c.completed).length;
    setCompletedChallenges(completed);
  }, [userActions]);

  // Sample leaderboard data
  const leaderboard = [
    { id: 1, name: "NewsMaster", xp: 2450, avatar: "👑", isYou: false },
    { id: 2, name: "InfoHunter", xp: 1980, avatar: "🦅", isYou: false },
    {
      id: 3,
      name: localStorage.getItem("userName") || "You",
      xp: points,
      avatar: "😊",
      isYou: true,
    },
    { id: 4, name: "FactFinder", xp: 1320, avatar: "🔍", isYou: false },
    { id: 5, name: "HeadlineHero", xp: 980, avatar: "🦸", isYou: false },
  ];

  // Tab configuration
  const tabs = [
    { id: "profile", icon: "📈", label: "Progress" },
    { id: "badges", icon: "🏆", label: "Badges" },
    { id: "challenges", icon: "✅", label: "Challenges" },
    { id: "leaderboard", icon: "👥", label: "Leaderboard" },
  ];

  // Action handlers
  const handleAction = (actionType) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    let pointsToAdd = 0;
    const newActions = { ...userActions };

    switch (actionType) {
      case "read":
        pointsToAdd = 5;
        newActions.articlesRead += 1;
        break;
      case "share":
        pointsToAdd = 10;
        newActions.articlesShared += 1;
        break;
      case "comment":
        pointsToAdd = 15;
        newActions.commentsMade += 1;
        break;
      case "bookmark":
        pointsToAdd = 3;
        newActions.articlesBookmarked += 1;
        break;
      default:
        break;
    }

    setUserActions(newActions);
    addPoints(pointsToAdd);
    checkForBadges(newActions);
  };

  const addPoints = (amount) => {
    setPoints((prev) => {
      const newPoints = prev + amount;

      // Check for level up
      const currentLevel = Math.floor(prev / 500);
      const newLevel = Math.floor(newPoints / 500);

      if (newLevel > currentLevel) {
        gsap.to(".level-up", {
          scale: 1.5,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "elastic.out(1, 0.5)",
        });
      }

      return newPoints;
    });

    // Animation for points earned
    gsap.fromTo(
      `.points-earned-${amount}`,
      { y: 20, opacity: 0, scale: 0.5 },
      { y: 0, opacity: 1, scale: 1.5, duration: 0.5, ease: "back.out(1.7)" }
    );

    setTimeout(() => {
      gsap.to(`.points-earned-${amount}`, { scale: 1, duration: 0.3 });
    }, 500);
  };

  const checkForBadges = (actions) => {
    const newBadges = [...badges];

    // Fast Reader badge
    if (actions.articlesRead >= 10 && !newBadges[0].unlocked) {
      newBadges[0].unlocked = true;
      newBadges[0].date = new Date().toISOString().split("T")[0];
      showBadgeUnlocked(newBadges[0]);
    }

    // News Junkie badge
    if (actions.articlesRead >= 25 && !newBadges[1].unlocked) {
      newBadges[1].unlocked = true;
      newBadges[1].date = new Date().toISOString().split("T")[0];
      showBadgeUnlocked(newBadges[1]);
    }

    // Debater badge
    if (actions.commentsMade >= 5 && !newBadges[3].unlocked) {
      newBadges[3].unlocked = true;
      newBadges[3].date = new Date().toISOString().split("T")[0];
      showBadgeUnlocked(newBadges[3]);
    }

    setBadges(newBadges);
  };

  const showBadgeUnlocked = (badge) => {
    // Animation for badge unlock
    gsap.to(".badge-unlock", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      onComplete: () => {
        setTimeout(() => {
          gsap.to(".badge-unlock", {
            opacity: 0,
            y: -20,
            duration: 0.5,
            delay: 2,
          });
        }, 1000);
      },
    });
  };

  // Streak management
  const updateStreak = () => {
    if (!isAuthenticated || !userEmail) return;

    const lastActive = localStorage.getItem(`lastActive-${userEmail}`);
    const today = new Date().toISOString().split("T")[0];

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastActive === yesterdayStr) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(1);
      }

      localStorage.setItem(`lastActive-${userEmail}`, today);
    }
  };

  // Initialize animations
  useEffect(() => {
    if (loading || !isAuthenticated) return;

    gsap.from(systemRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.from(tabRefs.current, {
      y: 10,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.3,
    });

    gsap.fromTo(
      sectionRefs.current[activeTab],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );

    // Initialize streak on component mount
    updateStreak();

    // Streak flame animation
    gsap.to(".streak-flame", {
      scale: 1.2,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, [activeTab, loading, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Welcome to News Explorer!</h2>
        <p className="mb-6">Please sign in to access gamification features.</p>
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div
      ref={systemRef}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Badge unlock notification */}
      <div className="badge-unlock fixed top-4 left-1/2 transform -translate-x-1/2 -translate-y-20 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md opacity-0 z-50">
        New Badge Unlocked! 🎉
      </div>

      {/* Header with XP and Level */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">News Explorer</h2>
          <div className="flex items-center gap-4">
            <div className="level-up bg-white/20 rounded-full px-4 py-1 font-bold">
              Level {Math.floor(points / 500) + 1}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>
              {points}/{Math.ceil(points / 500) * 500} XP
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full"
              style={{ width: `${(points % 500) / 5}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="streak-flame mr-2">🔥</div>
            <span>{streak} day streak</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🏆</span>
            <span>{badges.filter((b) => b.unlocked).length} badges</span>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      {/* Navigation Tabs */}
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center justify-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="mb-1 text-lg">{tab.icon}</div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="p-6">
        {/* Profile/Progress Tab */}
        <div
          ref={(el) => (sectionRefs.current["profile"] = el)}
          className={`${activeTab === "profile" ? "block" : "hidden"}`}
        >
          <h3 className="text-lg font-bold mb-4">Your Activity</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              {
                label: "Articles Read",
                value: userActions.articlesRead,
                icon: "📖",
              },
              {
                label: "Articles Shared",
                value: userActions.articlesShared,
                icon: "↗️",
              },
              {
                label: "Comments Made",
                value: userActions.commentsMade,
                icon: "💬",
              },
              {
                label: "Bookmarks",
                value: userActions.articlesBookmarked,
                icon: "🔖",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-50 border rounded-lg p-3 text-center"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-medium">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Read Article", action: "read", points: 5 },
              { label: "Share Article", action: "share", points: 10 },
              { label: "Leave Comment", action: "comment", points: 15 },
              { label: "Bookmark", action: "bookmark", points: 3 },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action.action)}
                className="bg-gray-50 hover:bg-gray-100 border rounded-lg p-3 text-center transition-colors"
              >
                <div className="font-medium">{action.label}</div>
                <div
                  className={`text-sm text-blue-600 points-earned-${action.points}`}
                >
                  +{action.points} XP
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Badges Tab */}
        <div
          ref={(el) => (sectionRefs.current["badges"] = el)}
          className={`${activeTab === "badges" ? "block" : "hidden"}`}
        >
          <h3 className="text-lg font-bold mb-4">Your Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center p-4 rounded-lg ${
                  badge.unlocked
                    ? "bg-white shadow-md border"
                    : "bg-gray-50 opacity-60"
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-center font-medium">{badge.name}</div>
                {badge.unlocked ? (
                  <div className="text-xs text-gray-500 mt-1">
                    Earned {badge.date}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">Locked</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Challenges Tab */}
        <div
          ref={(el) => (sectionRefs.current["challenges"] = el)}
          className={`challenges-section ${
            activeTab === "challenges" ? "block" : "hidden"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Daily Challenges</h3>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
              {completedChallenges}/{challenges.length}
            </div>
          </div>

          <div className="space-y-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    challenge.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {challenge.completed && "✓"}
                </div>
                <span
                  className={
                    challenge.completed ? "line-through text-gray-500" : ""
                  }
                >
                  {challenge.text}
                </span>
                {challenge.completed && (
                  <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    +10 XP
                  </div>
                )}
              </div>
            ))}
          </div>

          {completedChallenges === challenges.length && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-center font-medium">
              🎉 Daily challenge completed! +50 XP
            </div>
          )}
        </div>

        {/* Leaderboard Tab */}
        <div
          ref={(el) => (sectionRefs.current["leaderboard"] = el)}
          className={`${activeTab === "leaderboard" ? "block" : "hidden"}`}
        >
          <h3 className="text-lg font-bold mb-4">Weekly Leaderboard</h3>

          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center p-3 rounded-lg ${
                  user.isYou
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="text-2xl mr-3">{user.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.xp} XP</div>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
