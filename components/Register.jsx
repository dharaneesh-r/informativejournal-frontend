"use client"; // Required for GSAP animations in Next.js
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Register = () => {
  const formRef = useRef(null);
  const inputRefs = useRef([]);
  const buttonRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    // Animate form on load
    gsap.from(formRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
    });

    // Animate inputs
    gsap.from(inputRefs.current, {
      opacity: 0,
      y: 20,
      stagger: 0.2,
      duration: 0.8,
      ease: "power2.out",
    });

    // Animate button
    gsap.from(buttonRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power3.out",
      delay: 0.5,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div
        ref={formRef}
        className="bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-8 sm:p-12 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create an Account
        </h2>
        <form className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              ref={(el) => (inputRefs.current[0] = el)}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              ref={(el) => (inputRefs.current[1] = el)}
              type="password"
              id="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white"
            >
              Confirm Password
            </label>
            <input
              ref={(el) => (inputRefs.current[2] = el)}
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              className="mt-1 block w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>

          {/* Register Button */}
          <button
            ref={buttonRef}
            type="submit"
            className="w-full bg-white text-purple-600 py-3 px-6 rounded-lg font-semibold hover:bg-purple-100 transition-colors duration-300"
          >
            Register
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-white">
          Already have an account?{" "}
          <a href="/login" className="text-purple-200 hover:text-white">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
