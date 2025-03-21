"use client";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import Loading from "./loading";
import Link from "next/link";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedPosts() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroArticles, setHeroArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          "https://informativejournal-backend.vercel.app/articles"
        );
        console.log("API Response:", response.data);
        if (response.data.status === "success") {
          setArticles(response.data.data);
          setHeroArticles(response.data.data.slice(0, 4)); // Initialize hero articles
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(<Loading />);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    gsap.from(".fade-in", {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: ".fade-in",
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  }, [articles]);

  useEffect(() => {
    if (articles.length > 0) {
      const interval = setInterval(() => {
        const shuffledArticles = [...articles].sort(() => Math.random() - 0.5);
        setHeroArticles(shuffledArticles.slice(0, 4)); // Update hero articles every 10 seconds
      }, 10000); // 10 seconds
      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [articles]);

  const renderArticlesWithHero = () => {
    const result = [];
    let heroCount = 0;

    for (let i = 0; i < articles.length; i += 3) {
      const chunk = articles.slice(i, i + 3);

      // Push the chunk of 3 articles
      chunk.forEach((article) => {
        result.push(
          <div
            key={article._id}
            className="bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105 fade-in"
          >
            <Link href={`/${article.category}/${article.slug}`}>
              <div className="w-full h-48 relative">
                <Image
                  src={article.image || "/news-image.jpg"}
                  alt={article.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold hover:text-blue-600">
                  {article.title}
                </h3>
                <p className="text-gray-600 mt-2">{article.description}</p>
                <div className="flex items-center mt-4 text-gray-500">
                  <span className="text-sm">
                    By {article.author || "Unknown"}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="text-sm">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        );
      });

      // Push a hero section after every chunk of 3 articles
      if (heroCount < heroArticles.length) {
        const heroArticle = heroArticles[heroCount];
        result.push(
          <div
            key={`hero-${heroCount}`}
            className="col-span-1 md:col-span-2 lg:col-span-3 fade-in"
          >
            <Link href={`/${heroArticle.category}/${heroArticle.slug}`}>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={heroArticle.image || "/news-image.jpg"}
                  alt={heroArticle.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-bold text-white">
                    {heroArticle.title}
                  </h2>
                  <p className="text-gray-200 mt-2">
                    {heroArticle.description}
                  </p>
                  <div className="flex items-center mt-4 text-gray-300">
                    <span className="text-sm">
                      By {heroArticle.author || "Unknown"}
                    </span>
                    <span className="mx-2">|</span>
                    <span className="text-sm">
                      {new Date(heroArticle.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
        heroCount++;
      }
    }

    return result;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6 mt-10">
      <h2 className="text-4xl font-bold text-center mb-12 fade-in"></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.length > 0 ? (
          renderArticlesWithHero()
        ) : (
          <p className="text-center col-span-3">
            <Loading />
          </p>
        )}
      </div>
    </section>
  );
}
