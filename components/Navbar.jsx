"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import logo from "../public/logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("user@example.com");
  const navbarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const logoRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const authDropdownRef = useRef(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAuthOpen(false);
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

  useEffect(() => {
    gsap.from(logoRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "bounce.out",
      delay: 0.5,
    });
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      gsap.from(mobileMenuRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isLanguageOpen) {
      gsap.from(languageDropdownRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isLanguageOpen]);

  useEffect(() => {
    if (isAuthOpen) {
      gsap.from(authDropdownRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isAuthOpen]);

  useEffect(() => {
    const links = gsap.utils.toArray(".nav-link");
    links.forEach((link) => {
      const underline = document.createElement("div");
      underline.style.height = "2px";
      underline.style.backgroundColor = "#3b82f6";
      underline.style.position = "absolute";
      underline.style.bottom = "0";
      underline.style.left = "0";
      underline.style.width = "0";
      underline.style.transition = "width 0.3s ease";
      link.appendChild(underline);

      link.addEventListener("mouseenter", () => {
        gsap.to(underline, {
          width: "100%",
          duration: 0.3,
          ease: "power2.out",
        });
      });
      link.addEventListener("mouseleave", () => {
        gsap.to(underline, {
          width: "0",
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target) &&
        !event.target.closest(".language-button")
      ) {
        setIsLanguageOpen(false);
      }
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target) &&
        !event.target.closest(".auth-button")
      ) {
        setIsAuthOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
                Informative Journal
              </a>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <div className="flex space-x-6">
              <a
                href="/technology"
                className="nav-link text-white transition-colors duration-300 relative"
              >
                Technology
              </a>
              <a
                href="/sports"
                className="nav-link text-white transition-colors duration-300 relative"
              >
                Sports
              </a>
              <a
                href="/business"
                className="nav-link text-white transition-colors duration-300 relative"
              >
                Business
              </a>
              <a
                href="/entertainment"
                className="nav-link text-white transition-colors duration-300 relative"
              >
                Entertainment
              </a>
            </div>

            <div className="relative">
              <button
                className="language-button nav-link text-white transition-colors duration-300 flex items-center relative"
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
                <div
                  ref={languageDropdownRef}
                  className="absolute top-10 left-0 bg-gray-800 shadow-lg rounded-lg w-48 p-2 backdrop-blur-md"
                >
                  <a
                    key="en"
                    href="/en"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                  >
                    English
                  </a>
                  <a
                    key="es"
                    href="/es"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                  >
                    Spanish
                  </a>
                  <a
                    key="fr"
                    href="/fr"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                  >
                    French
                  </a>
                  <a
                    key="de"
                    href="/de"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                  >
                    German
                  </a>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="auth-button nav-link text-white transition-colors duration-300 flex items-center relative"
                onClick={() => setIsAuthOpen(!isAuthOpen)}
                aria-expanded={isAuthOpen}
              >
                {isLoggedIn ? (
                  <>
                    <img
                      src="https://via.placeholder.com/30"
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>{userEmail}</span>
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
                <div
                  ref={authDropdownRef}
                  className="absolute top-10 right-0 bg-gray-800 shadow-lg rounded-lg w-48 p-2 backdrop-blur-md"
                >
                  {isLoggedIn ? (
                    <>
                      <a
                        key="profile"
                        href="/profile"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                      >
                        Profile
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
                        onClick={handleLogin}
                      >
                        Login
                      </a>
                      <a
                        key="register"
                        href="/register"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
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
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none"
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
            className="md:hidden bg-gray-800 shadow-lg rounded-lg mt-2 backdrop-blur-md"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/technology"
                className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
              >
                Technology
              </a>
              <a
                href="/sports"
                className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
              >
                Sports
              </a>
              <a
                href="/business"
                className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
              >
                Business
              </a>
              <a
                href="/entertainment"
                className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
              >
                Entertainment
              </a>

              <div
                className="relative"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <button className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700">
                  Language
                </button>
                {isLanguageOpen && (
                  <div className="pl-4">
                    <a
                      key="en"
                      href="/en"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    >
                      English
                    </a>
                    <a
                      key="es"
                      href="/es"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    >
                      Spanish
                    </a>
                    <a
                      key="fr"
                      href="/fr"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    >
                      French
                    </a>
                    <a
                      key="de"
                      href="/de"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                    >
                      German
                    </a>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onClick={() => setIsAuthOpen(!isAuthOpen)}
              >
                <button className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700">
                  {isLoggedIn ? (
                    <>
                      <img
                        src="https://via.placeholder.com/30"
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span>{userEmail}</span>
                    </>
                  ) : (
                    "Account"
                  )}
                </button>
                {isAuthOpen && (
                  <div className="pl-4">
                    {isLoggedIn ? (
                      <>
                        <a
                          key="profile"
                          href="/profile"
                          className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
                        >
                          Profile
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
                          onClick={handleLogin}
                        >
                          Login
                        </a>
                        <a
                          key="register"
                          href="/register"
                          className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-300"
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
