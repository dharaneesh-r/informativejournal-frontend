"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";

export default function Home() {
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const containerRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
    });
    gsap.from(headingRef.current, {
      y: -20,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: "bounce.out",
    });
    gsap.from(formRef.current, {
      y: 20,
      opacity: 0,
      duration: 1,
      delay: 1,
      ease: "power2.out",
    });

    gsap.to(containerRef.current, {
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    const inputs = [emailInputRef.current, passwordInputRef.current];
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        gsap.to(input, {
          scale: 1.05,
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
          duration: 0.3,
          ease: "power2.out",
        });
      });
      input.addEventListener("blur", () => {
        gsap.to(input, {
          scale: 1,
          boxShadow: "none",
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });

    gsap.to(buttonRef.current, {
      scale: 1.05,
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.7)",
      duration: 0.3,
      paused: true,
      ease: "power2.out",
    });
    buttonRef.current.addEventListener("mouseenter", () =>
      gsap.to(buttonRef.current, { scale: 1.05, play: true })
    );
    buttonRef.current.addEventListener("mouseleave", () =>
      gsap.to(buttonRef.current, { scale: 1, play: true })
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    gsap.to(containerRef.current, {
      x: -1000, 
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        Swal.fire({
          title: "Success!",
          text: "Registration Successful!",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: "animated tada", 
          },
        }).then(() => {
          window.location.reload();
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div
        ref={containerRef}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-500 ease-in-out hover:scale-105"
      >
        <h1
          ref={headingRef}
          className="text-3xl font-bold text-center text-gray-800 mb-6"
        >
          Create Account
        </h1>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              ref={passwordInputRef}
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <button
              ref={buttonRef}
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Register
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
  