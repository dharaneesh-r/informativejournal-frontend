"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "../public/logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navbarRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const authDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Updated news categories data
  const newsCategories = [
    // Technology & Science
    { name: "Technology", path: "/technology" },
    { name: "Science", path: "/science" },

    // Business & Finance
    { name: "Business", path: "/business" },
    { name: "Startup", path: "/startup" },
    { name: "Finance", path: "/finance" },
    { name: "Mutual Funds", path: "/mutualfund" },
    { name: "Stock Market", path: "/stockmarket" },
    { name: "Stock Dashboard", path: "/stock-dashboard"},
    { name: "Cryptocurrency", path: "/cryptocurrency" },
    { name: "Commodities", path: "/commodities" },
    { name: "Economics", path: "/economics" },

    // Health & Lifestyle
    { name: "Health & Wellness", path: "/health" },
    { name: "Entertainment", path: "/entertainment" },
    { name: "Sports", path: "/sports" },

    // Politics & World
    { name: "Politics", path: "/politics" },
    { name: "World", path: "/world" },
    { name: "India", path: "/india" },
    { name: "US", path: "/us" },
    { name: "Russia", path: "/russia" },
    { name: "China", path: "/china" },
    { name: "Singapore", path: "/singapore" },

    // Other categories
    { name: "Education", path: "/education" },
    { name: "Environment", path: "/environment" },

    // PAPER TRADING

    { name: "Crypto Trading", path: "/crypto-games" },
    { name: "Financial Calculators", path: "/financial-calculators" },
  ];

  // Group categories for a better dropdown organization
  const categoryGroups = {
    "Tech & Science": newsCategories.slice(0, 2),
    "Business & Finance": newsCategories.slice(2, 10),
    "Health & Lifestyle": newsCategories.slice(10, 13),
    "Politics & World": newsCategories.slice(13, 20),
    Other: newsCategories.slice(20),
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close language dropdown if clicked outside
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target) &&
        !(
          mobileMenuRef.current?.contains(event.target) &&
          event.target !== mobileMenuButtonRef.current
        )
      ) {
        setIsLanguageOpen(false);
      }

      // Close auth dropdown if clicked outside
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target) &&
        !mobileMenuRef.current?.contains(event.target) &&
        event.target !== mobileMenuButtonRef.current
      ) {
        setIsAuthOpen(false);
      }

      // Close categories dropdown if clicked outside
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target) &&
        !mobileMenuRef.current?.contains(event.target) &&
        event.target !== mobileMenuButtonRef.current
      ) {
        setIsCategoriesOpen(false);
      }

      // Close mobile menu if clicked outside
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !navbarRef.current?.contains(event.target) &&
        event.target !== mobileMenuButtonRef.current
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Add event listener for storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      const email =
        localStorage.getItem("userEmail") ||
        sessionStorage.getItem("userEmail");

      setIsLoggedIn(!!token);
      if (email) setUserEmail(email);
    };

    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
    };
  }, []);

  // Handle scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        if (window.scrollY > 10) {
          navbarRef.current.classList.add("bg-opacity-90");
          navbarRef.current.classList.add("shadow-md");
        } else {
          navbarRef.current.classList.remove("bg-opacity-90");
          navbarRef.current.classList.remove("shadow-md");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    const email =
      localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    setIsLoggedIn(true);
    setIsAuthOpen(false);
    if (email) setUserEmail(email);
    window.dispatchEvent(new Event("authChange"));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAuthOpen(false);
    setUserEmail("");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiration");
    sessionStorage.removeItem("userEmail");
    window.dispatchEvent(new Event("authChange"));
  };

  const closeAllDropdowns = () => {
    setIsLanguageOpen(false);
    setIsAuthOpen(false);
    setIsCategoriesOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isMobileMenuOpen) {
      closeAllDropdowns();
    }
  };

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-95 backdrop-blur-md border-b border-gray-800 z-50 transition-all duration-300"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href="/"
              className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-300 flex items-center"
            >
              <Image
                src={logo}
                width={40}
                height={40}
                alt="Newwss"
                className="mr-2"
              />
              <span className="hidden sm:inline">Newwss</span>
              <span className="sm:hidden">Newwss</span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesDropdownRef}>
              <button
                className="px-3 py-2 text-white rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center"
                onClick={() => {
                  setIsCategoriesOpen(!isCategoriesOpen);
                  setIsLanguageOpen(false);
                  setIsAuthOpen(false);
                }}
                aria-expanded={isCategoriesOpen}
              >
                Categories
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    isCategoriesOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isCategoriesOpen && (
                <div className="fixed left-0 right-0 top-16 bg-gray-800 shadow-xl p-4 border-t border-gray-700 z-50">
                  <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Object.entries(categoryGroups).map(
                        ([groupName, categories]) => (
                          <div key={groupName} className="mb-4">
                            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                              {groupName}
                            </h3>
                            <div className="space-y-1">
                              {categories.map((category) => (
                                <a
                                  key={category.name}
                                  href={category.path}
                                  className="block px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 text-sm"
                                  onClick={() => setIsCategoriesOpen(false)}
                                >
                                  {category.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                className="px-3 py-2 text-white rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center"
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsCategoriesOpen(false);
                  setIsAuthOpen(false);
                }}
                aria-expanded={isLanguageOpen}
              >
                Language
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    isLanguageOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isLanguageOpen && (
                <div className="absolute top-full right-0 bg-gray-800 rounded-lg shadow-xl w-48 p-2 mt-1 border border-gray-700 z-50">
                  {["English", "Spanish", "French", "German"].map((lang, i) => (
                    <a
                      key={lang}
                      href={`/${lang.toLowerCase().substring(0, 2)}`}
                      className="block px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                      onClick={() => setIsLanguageOpen(false)}
                    >
                      {lang}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Button/Dropdown */}
            <div className="relative" ref={authDropdownRef}>
              <button
                className="px-3 py-2 text-white rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center"
                onClick={() => {
                  setIsAuthOpen(!isAuthOpen);
                  setIsLanguageOpen(false);
                  setIsCategoriesOpen(false);
                }}
                aria-expanded={isAuthOpen}
              >
                {isLoggedIn ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-2">
                      {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="max-w-xs truncate hidden lg:inline mr-1">
                      {userEmail.split("@")[0]}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isAuthOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Account</span>
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        isAuthOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </button>
              {isAuthOpen && (
                <div className="absolute top-full right-0 bg-gray-800 rounded-lg shadow-xl w-48 p-2 mt-1 border border-gray-700 z-50">
                  {isLoggedIn ? (
                    <>
                      <a
                        href="/admin-manager"
                        className="block px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 flex items-center"
                        onClick={() => setIsAuthOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Admin
                      </a>
                      <a
                        href="/profile"
                        className="block px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 flex items-center"
                        onClick={() => setIsAuthOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </a>
                      <hr className="border-gray-700 my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="block px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 flex items-center"
                        onClick={() => setIsAuthOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                        Login
                      </a>
                      <a
                        href="/register"
                        className="block px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 display-flex items-center"
                        onClick={() => setIsAuthOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        Register
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              ref={mobileMenuButtonRef}
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-md hover:bg-gray-800 transition-colors duration-200 focus:outline-none"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Canvas - Only render when isMobileMenuOpen is true */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 bg-gray-900 bg-opacity-95 backdrop-blur-md z-40 md:hidden transition-all duration-300 ease-in-out"
          style={{ top: "4rem" }}
        >
          <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-900">
            {/* Mobile User Info */}
            {isLoggedIn && (
              <div className="flex items-center p-4 bg-gray-800 rounded-lg mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-3">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 truncate">
                  <div className="text-white font-medium">{userEmail}</div>
                  <div className="text-gray-400 text-sm">Logged in</div>
                </div>
              </div>
            )}

            {/* Categories Section */}
            <div className="mb-4">
              <button
                className="flex justify-between items-center w-full p-4 text-white bg-gray-800 rounded-lg mb-1"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                <span className="text-lg font-medium">Categories</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isCategoriesOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isCategoriesOpen && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  {Object.entries(categoryGroups).map(
                    ([groupName, categories]) => (
                      <div key={groupName} className="mb-2">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-4 py-2 border-t border-gray-700">
                          {groupName}
                        </h3>
                        <div className="grid grid-cols-2 gap-1 px-2">
                          {categories.map((category) => (
                            <a
                              key={category.name}
                              href={category.path}
                              className="block p-3 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                              onClick={() => {
                                setIsCategoriesOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              {category.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Language Section */}
            <div className="mb-4">
              <button
                className="flex justify-between items-center w-full p-4 text-white bg-gray-800 rounded-lg mb-1"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <span className="text-lg font-medium">Language</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isLanguageOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isLanguageOpen && (
                <div className="p-2 bg-gray-800 rounded-lg">
                  {["English", "Spanish", "French", "German"].map((lang) => (
                    <a
                      key={lang}
                      href={`/${lang.toLowerCase().substring(0, 2)}`}
                      className="block p-3 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                      onClick={() => {
                        setIsLanguageOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {lang}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Account Section */}
            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <a
                  href="/login"
                  className="block p-4 text-center text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                  onClick={() => {
                    handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="block p-4 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </a>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <a
                  href="/admin-manager"
                  className="flex items-center p-4 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin Dashboard
                </a>
                <a
                  href="/profile"
                  className="flex items-center p-4 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full p-4 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
