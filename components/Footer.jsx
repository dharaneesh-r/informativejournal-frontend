"use client"; // Required for GSAP animations in Next.js
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const socialIconsRef = useRef([]);
  const newsletterRef = useRef(null);
  const categoriesRef = useRef([]);
  const copyrightRef = useRef(null);
  const floatingIconsRef = useRef([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // GSAP Animations
  useEffect(() => {
    // Animate footer on scroll
    gsap.from(footerRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 80%",
        end: "bottom bottom",
        toggleActions: "play none none reverse",
      },
    });

    // Animate social icons
    gsap.from(socialIconsRef.current, {
      opacity: 0,
      y: 20,
      stagger: 0.2,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 80%",
        end: "bottom bottom",
      },
    });

    // Animate newsletter form
    gsap.from(newsletterRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: newsletterRef.current,
        start: "top 80%",
        end: "bottom bottom",
      },
    });

    // Animate categories
    gsap.from(categoriesRef.current, {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 80%",
        end: "bottom bottom",
      },
    });

    // Animate copyright text
    gsap.from(copyrightRef.current, {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: copyrightRef.current,
        start: "top 80%",
        end: "bottom bottom",
      },
    });

    // Floating icons animation
    floatingIconsRef.current.forEach((icon, index) => {
      const randomX = gsap.utils.random(-50, 50);
      const randomY = gsap.utils.random(-50, 50);
      const randomDuration = gsap.utils.random(3, 8);
      const randomRotation = gsap.utils.random(-180, 180);

      gsap.to(icon, {
        x: randomX,
        y: randomY,
        rotation: randomRotation,
        duration: randomDuration,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    });
  }, []);

  // Scroll-to-top functionality
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      ref={footerRef}
      className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Floating Icons */}
      {[
        "💻",
        "📈",
        "🎬",
        "🏛️",
        "🌍",
        "🏥",
        "🏀",
        "💰",
        "📰",
        "🎮",
        "📚",
        "🚀",
        "🍿",
        "🎤",
        "📱",
        "💡",
        "🌱",
        "🛒",
        "🍔",
        "🚗",
      ].map((icon, index) => (
        <div
          key={index}
          ref={(el) => (floatingIconsRef.current[index] = el)}
          className="absolute text-2xl opacity-30"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          {icon}
        </div>
      ))}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter Section */}
        <div ref={newsletterRef} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Newwss
          </h2>
          <p className="text-gray-400 mb-6">
            Subscribe to our newsletter for the latest news and updates.
          </p>
          <form className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg sm:rounded-l-lg sm:rounded-r-none py-3 px-4 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg sm:rounded-r-lg sm:rounded-l-none transition-colors duration-300 w-full sm:w-auto"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {[
            { name: "Technology", icon: "💻", href: "/technology" },
            { name: "Sports", icon: "🏀", href: "/sports" },
            { name: "Business", icon: "💼", href: "/business" },
            { name: "Entertainment", icon: "🎬", href: "/entertainment" },
            { name: "Health", icon: "🏥", href: "/health" },
            { name: "Politics", icon: "🏛️", href: "/politics" },
            { name: "Finance", icon: "📈", href: "/finance" },
            { name: "World News", icon: "🌍", href: "/" },
            { name: "Education", icon: "📚", href: "/education" },
            { name: "Financial Calculator", icon: "🌱", href: "/financial-calculators" },
          ].map((category, index) => (
            <Link
              key={index}
              href={category.href}
              ref={(el) => (categoriesRef.current[index] = el)}
              className="text-center p-4 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors duration-300 text-decoration-none"
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-12">
          {[
            {
              name: "Twitter",
              path: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
            },
            {
              name: "Instagram",
              path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
            },
            {
              name: "LinkedIn",
              path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
            },
            {
              name: "Website",
              path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
            },
          ].map((social, index) => (
            <a
              key={index}
              ref={(el) => (socialIconsRef.current[index] = el)}
              href={
                social.name === "Website"
                  ? "https://dharaneeshr.vercel.app"
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </div>

        {/* Copyright and Privacy Policy Section */}
        <div ref={copyrightRef} className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Newwss. All rights
          reserved. |{" "}
          <Link
            href="/privacy-policy"
            className="hover:text-blue-500 transition-colors duration-300"
          >
            Privacy Policy
          </Link> | {" "}
          <Link href="/aboutus"
          className="hover:text-blue-500 transition-colors duration-300">
            About Us
          </Link>
        </div>
      </div>

      {/* Scroll-to-top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors duration-300"
          aria-label="Scroll to top"
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
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </footer>
  );
};

export default Footer;