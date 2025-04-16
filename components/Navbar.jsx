"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
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
  const mobileMenuRef = useRef(null);
  const logoRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const authDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);

  // News categories data
  const newsCategories = [
    { name: "Technology", path: "/technology" },
    { name: "Business", path: "/business" },
    { name: "Finance", path: "/finance" },
    { name: "Politics", path: "/politics" },
    { name: "Health", path: "/health" },
    { name: "Science", path: "/science" },
    { name: "Sports", path: "/sports" },
    { name: "Entertainment", path: "/entertainment" },
    { name: "World", path: "/world" },
    { name: "Environment", path: "/environment" },
    { name: "Education", path: "/education" },
    { name: "Stock Dashboard", path: "/stock-dashboard" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target)) {
        setIsAuthOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  useEffect(() => {
    gsap.to(navbarRef.current, {
      y: 0,
      duration: 0.5,
      scrollTrigger: {
        trigger: navbarRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 w-full bg-gray-900 shadow-lg backdrop-blur-md border-b border-gray-800 z-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <div ref={logoRef} className="flex items-center">
              <a
                href="/"
                className="text-2xl font-bold text-white hover:text-blue-200 transition-colors duration-300 flex items-center"
              >
                <Image
                  src={logo}
                  width={50}
                  height={20}
                  alt="Informative Journal"
                  className="mr-2"
                />
                <span className="hidden sm:inline">Informative Journal</span>
                <span className="sm:hidden">IJ</span>
              </a>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesDropdownRef}>
              <button
                className="nav-link text-white transition-colors duration-300 flex items-center px-4 py-2 hover:bg-gray-800 rounded-lg"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                aria-expanded={isCategoriesOpen}
              >
                Categories
                <svg
                  className="w-4 h-4 ml-2"
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
                <div className="absolute top-12 left-0 bg-gray-800 shadow-xl rounded-lg w-64 p-2 backdrop-blur-md grid grid-cols-2 gap-2 z-50">
                  {newsCategories.map((category) => (
                    <a
                      key={category.name}
                      href={category.path}
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300 text-sm"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                className="nav-link text-white transition-colors duration-300 flex items-center px-4 py-2 hover:bg-gray-800 rounded-lg"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                aria-expanded={isLanguageOpen}
              >
                Language
                <svg
                  className="w-4 h-4 ml-2"
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
                <div className="absolute top-12 left-0 bg-gray-800 shadow-lg rounded-lg w-48 p-2 backdrop-blur-md z-50">
                  <a
                    key="en"
                    href="/en"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    English
                  </a>
                  <a
                    key="es"
                    href="/es"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    Spanish
                  </a>
                  <a
                    key="fr"
                    href="/fr"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    French
                  </a>
                  <a
                    key="de"
                    href="/de"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    German
                  </a>
                </div>
              )}
            </div>

            {/* Auth Dropdown */}
            <div className="relative" ref={authDropdownRef}>
              <button
                className="nav-link text-white transition-colors duration-300 flex items-center px-4 py-2 hover:bg-gray-800 rounded-lg"
                onClick={() => setIsAuthOpen(!isAuthOpen)}
                aria-expanded={isAuthOpen}
              >
                {isLoggedIn ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-2">
                      {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="max-w-xs truncate hidden lg:inline">
                      {userEmail}
                    </span>
                  </>
                ) : (
                  "Account"
                )}
                <svg
                  className="w-4 h-4 ml-2"
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
              {isAuthOpen && (
                <div className="absolute top-12 right-0 bg-gray-800 shadow-lg rounded-lg w-48 p-2 backdrop-blur-md z-50">
                  {isLoggedIn ? (
                    <>
                      <a
                        key="Admin"
                        href="/admin-manager"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                        onClick={() => setIsAuthOpen(false)}
                      >
                        Admin
                      </a>
                      <button
                        key="logout"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        key="login"
                        href="/login"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                        onClick={() => {
                          handleLogin();
                          setIsAuthOpen(false);
                        }}
                      >
                        Login
                      </a>
                      <a
                        key="register"
                        href="/register"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                        onClick={() => setIsAuthOpen(false)}
                      >
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none p-2"
              aria-label="Toggle mobile menu"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-gray-800 shadow-lg rounded-lg mt-2 backdrop-blur-md overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Categories Dropdown */}
              <div className="relative">
                <button
                  className="flex justify-between items-center w-full px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-md"
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                >
                  <span>Categories</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
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
                  <div className="pl-4 grid grid-cols-2 gap-1 mt-1">
                    {newsCategories.map((category) => (
                      <a
                        key={category.name}
                        href={category.path}
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300 text-sm"
                        onClick={() => {
                          setIsCategoriesOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Language Dropdown */}
              <div className="relative">
                <button
                  className="flex justify-between items-center w-full px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-md"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                >
                  <span>Language</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
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
                  <div className="pl-4">
                    <a
                      key="en"
                      href="/en"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                      onClick={() => {
                        setIsLanguageOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      English
                    </a>
                    <a
                      key="es"
                      href="/es"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                      onClick={() => {
                        setIsLanguageOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Spanish
                    </a>
                    <a
                      key="fr"
                      href="/fr"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                      onClick={() => {
                        setIsLanguageOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      French
                    </a>
                    <a
                      key="de"
                      href="/de"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                      onClick={() => {
                        setIsLanguageOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      German
                    </a>
                  </div>
                )}
              </div>

              {/* Mobile Auth Dropdown */}
              <div className="relative">
                <button
                  className="flex justify-between items-center w-full px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-md"
                  onClick={() => setIsAuthOpen(!isAuthOpen)}
                >
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-2">
                          {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="max-w-xs truncate">{userEmail}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>Account</span>
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
                  )}
                </button>
                {isAuthOpen && (
                  <div className="pl-4">
                    {isLoggedIn ? (
                      <>
                        <a
                          key="Admin"
                          href="/admin-manager"
                          className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                          onClick={() => {
                            setIsAuthOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Admin
                        </a>
                        <button
                          key="logout"
                          onClick={() => {
                            handleLogout();
                            setIsAuthOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          key="login"
                          href="/login"
                          className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                          onClick={() => {
                            handleLogin();
                            setIsAuthOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Login
                        </a>
                        <a
                          key="register"
                          href="/register"
                          className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                          onClick={() => {
                            setIsAuthOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Register
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

