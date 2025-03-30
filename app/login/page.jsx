"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken");
    if (token) {
      router.push("/");
    }

    // GSAP Animations
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
    });
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Input validation
    if (!formData.email || !formData.password) {
      setIsLoading(false);
      Swal.fire({
        title: "Error!",
        text: "Please fill in all fields",
        icon: "error",
      });
      return;
    }

    try {
      // API call to backend
      const response = await axios.post(
        "https://informativejournal-backend.vercel.app/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.token) {
        const tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        localStorage.setItem("tokenExpiration", tokenExpiration.toString());
        
        localStorage.setItem("userEmail", formData.email);
        sessionStorage.setItem("userEmail", formData.email);

        gsap.to(containerRef.current, {
          x: -1000,
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            Swal.fire({
              title: "Success!",
              text: "Login successful!",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              router.push("/");
            });
          },
        });
      } else {
        throw new Error("Login failed - no token received");
      }
    } catch (error) {
      setIsLoading(false);
      gsap.to(buttonRef.current, {
        backgroundColor: "#2563eb",
        duration: 0.3,
      });

      gsap.from(containerRef.current, {
        x: [10, -10, 10, -10, 0],
        duration: 0.5,
        ease: "power1.inOut",
      });

      let errorMessage = "Login failed. Please try again.";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              errorMessage = "Invalid request. Please check your input.";
              break;
            case 401:
              errorMessage = "Invalid email or password.";
              break;
            case 403:
              errorMessage = "Account not verified. Please check your email.";
              break;
            case 404:
              errorMessage = "User not found.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage =
                error.response.data?.message ||
                "An unexpected error occurred. Please try again.";
          }
        } else if (error.request) {
          errorMessage = "No response from server. Please check your connection.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
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
          Welcome Back!
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
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </a>
            </div>
          </div>
          <div>
            <button
              ref={buttonRef}
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? "bg-blue-800" : "bg-blue-600"
              } text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 flex justify-center items-center`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;