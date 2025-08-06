"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiDownload,
} from "react-icons/fi";
import { FixedSizeList } from "react-window";
import debounce from "lodash.debounce";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#A4DE6C", "#D0ED57"];
const GA_MEASUREMENT_ID = "G-DG0801N414";

const AnalyticsDashboard = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const articlesPerPage = 10;

  // Analytics state
  const [timeRange, setTimeRange] = useState("7days");
  const [activeTab, setActiveTab] = useState("overview");
  const [gaMetrics, setGaMetrics] = useState(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [gaError, setGaError] = useState(null);

  const isMounted = useRef(true);
  const cancelTokenRef = useRef(null);

  const allowedEmails = ["dharaneeshr0803@gmail.com", "marip45345@gmail.com"];

  // JWT helpers
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) return true;
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Load GA script
  const loadGtag = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.gtag) return;

    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname
      });
    `;
    document.head.appendChild(script2);
  }, []);

  // Generic event tracker
  const trackEvent = (name, params) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", name, params);
    }
  };

  // Fetch GA aggregated metrics from backend
  const fetchGAMetrics = useCallback(async () => {
    setGaLoading(true);
    setGaError(null);
    try {
      const res = await fetch(`/api/ga/summary?range=${timeRange}`);
      if (!res.ok) throw new Error(`GA summary fetch failed: ${res.statusText}`);
      const data = await res.json();
      setGaMetrics(data);
    } catch (e) {
      console.error("GA fetch error:", e);
      setGaError(
        e.message || "Failed to fetch GA metrics. Check GA configuration or API quotas."
      );
      setGaMetrics(null);
    } finally {
      setGaLoading(false);
    }
  }, [timeRange]);

  // Authentication check
  useEffect(() => {
    isMounted.current = true;
    const verifyAuth = () => {
      const authToken = localStorage.getItem("authToken");
      const userEmail = localStorage.getItem("userEmail");
      const tokenExpiration = localStorage.getItem("tokenExpiration");

      if (!authToken || !userEmail) {
        return;
      }

      if (tokenExpiration) {
        const expirationTime = parseInt(tokenExpiration, 10);
        if (Date.now() > expirationTime) {
          Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "Please login again.",
          });
          logout();
          return;
        }
      }

      if (isTokenExpired(authToken)) {
        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please login again.",
        });
        logout();
        return;
      }

      if (allowedEmails.includes(userEmail)) {
        setIsAuthenticated(true);
        setCurrentUser(userEmail);
        fetchArticles(1, searchQuery, showAll);
      } else {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "You are not authorized to access this admin panel.",
        });
        logout();
      }
    };

    verifyAuth();
    loadGtag();
    return () => {
      isMounted.current = false;
      if (cancelTokenRef.current) cancelTokenRef.current.cancel();
    };
  }, [loadGtag]);

  // Debounced search wrapper
  const debouncedFetch = useCallback(
    debounce((page, q, all) => {
      fetchArticles(page, q, all);
    }, 400),
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(1);
      debouncedFetch(1, searchQuery, showAll);
    }
  }, [searchQuery, showAll, debouncedFetch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGAMetrics();
    }
  }, [fetchGAMetrics, isAuthenticated, timeRange]);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!allowedEmails.includes(email)) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You are not authorized to access this admin panel.",
      });
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        "https://informativejournal-backend.vercel.app/login",
        { email, password },
        { timeout: 10000 }
      );
      const { token, email: returnedEmail, user } = response.data;
      if (!token) throw new Error("No token received");

      const userEmail = returnedEmail || email;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userEmail", userEmail);

      const decoded = decodeJWT(token);
      if (decoded && decoded.exp) {
        localStorage.setItem(
          "tokenExpiration",
          (decoded.exp * 1000).toString()
        );
      }
      if (user) localStorage.setItem("user", JSON.stringify(user));

      if (!allowedEmails.includes(userEmail)) {
        throw new Error("Email not authorized for admin access");
      }

      setIsAuthenticated(true);
      setCurrentUser(userEmail);
      fetchArticles(1, "", false);
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome, ${userEmail}`,
        showConfirmButton: false,
        timer: 1500,
      });
      trackEvent("login", { user_email: userEmail });
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      let errMsg = "Invalid email or password";
      if (err.response?.data?.message) errMsg = err.response.data.message;
      else if (err.message) errMsg = err.message;
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errMsg,
      });
      logout();
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("user");
    localStorage.removeItem("editArticleData");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setArticles([]);
    setEmail("");
    setPassword("");
    setCurrentPage(1);
    setSearchQuery("");
    setShowAll(false);
    setGaMetrics(null);
    trackEvent("logout", {});
  };

  // Fetch articles with search/pagination
  const fetchArticles = async (page = 1, q = "", all = false) => {
    setLoading(true);
    if (cancelTokenRef.current) cancelTokenRef.current.cancel("New request");
    cancelTokenRef.current = axios.CancelToken.source();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      if (isTokenExpired(token)) throw new Error("Token expired");
      const params = {
        page: all ? 1 : page,
        limit: all ? 5000 : articlesPerPage,
      };
      if (q && q.trim()) {
        params.search = q.trim();
      }
      const response = await axios.get(
        "https://informativejournal-backend.vercel.app/articles",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
          cancelToken: cancelTokenRef.current.token,
          timeout: 15000,
        }
      );

      if (!isMounted.current) return;

      let articlesArray = response.data.data || response.data;
      if (!Array.isArray(articlesArray)) {
        throw new Error("API response does not contain a valid articles array");
      }

      if (all && articlesArray.length >= 5000) {
        Swal.fire({
          icon: "warning",
          title: "Large Dataset",
          text: "Showing first 5000 articles. Contact support for full data access.",
        });
      }

      const validatedArticles = articlesArray.map((article, index) => ({
        id: article.id || article._id || `temp-${index}-${Date.now()}`,
        title: article.title || "Untitled Article",
        category: article.category || "Uncategorized",
        publishedAt:
          article.publishedAt ||
          article.createdAt ||
          article.date ||
          new Date().toISOString(),
        views: Number(article.views) || 0,
        likes: Number(article.likes) || 0,
        comments: Number(article.comments) || 0,
        slug:
          article.slug ||
          (article.title
            ? article.title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "")
            : "untitled"),
        imageUrl:
          article.imageUrl || article.image || "/placeholder-article.jpg",
        author: article.author || "Unknown",
      }));

      const total = response.data.totalArticles ?? articlesArray.length;
      const pages = all ? 1 : Math.max(1, Math.ceil(total / articlesPerPage));

      setArticles(validatedArticles);
      setTotalArticles(total);
      setTotalPages(pages);
      setCurrentPage(all ? 1 : page);
    } catch (err) {
      if (axios.isCancel(err)) {
        // ignore
      } else {
        console.error(
          "Fetch articles error:",
          err.response?.data || err.message
        );
        setError(
          err.message || "Failed to load articles. Please try again later."
        );
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          err.message === "Token expired"
        ) {
          Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: "Please login again.",
          });
          logout();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed to fetch articles",
            text:
              (err.response &&
                err.response.data &&
                err.response.data.message) ||
              err.message ||
              "Server error",
          });
        }
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Delete article
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      if (isTokenExpired(token)) throw new Error("Token expired");

      await axios.delete(
        `https://informativejournal-backend.vercel.app/articles/id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );
      Swal.fire("Deleted!", "Your article has been deleted.", "success");
      trackEvent("delete_article", { article_id: id });

      if (articles.length === 1 && currentPage > 1) {
        fetchArticles(currentPage - 1, searchQuery, showAll);
      } else {
        fetchArticles(currentPage, searchQuery, showAll);
      }
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      if (
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        err.message === "Token expired"
      ) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Please login again.",
        });
        logout();
      } else {
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text:
            (err.response && err.response.data && err.response.data.message) ||
            err.message ||
            "Failed to delete article. Please try again.",
        });
      }
    }
  };

  // Fetch single article for edit
  const fetchArticleForEdit = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      if (isTokenExpired(token)) throw new Error("Token expired");

      const response = await axios.get(
        `https://informativejournal-backend.vercel.app/articles/id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );
      return response.data.data || response.data;
    } catch (err) {
      console.error("Fetch article error:", err.response?.data || err.message);
      if (
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        err.message === "Token expired"
      ) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Please login again.",
        });
        logout();
        return null;
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to fetch article",
          text:
            (err.response && err.response.data && err.response.data.message) ||
            err.message ||
            "Server error",
        });
        return null;
      }
    }
  };

  const handleEdit = async (id) => {
    Swal.fire({
      title: "Loading article...",
      text: "Please wait while we fetch the article data",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const articleData = await fetchArticleForEdit(id);
      if (articleData) {
        localStorage.setItem(
          "editArticleData",
          JSON.stringify({
            ...articleData,
            isEditing: true,
            id,
          })
        );
        Swal.close();
        trackEvent("edit_article", { article_id: id });
        if (articleData.keywords && articleData.keywords.length > 0) {
          router.push("/admin-manager/keyword-articles-form");
        } else {
          router.push("/admin-manager/admin");
        }
      } else {
        Swal.close();
      }
    } catch (e) {
      Swal.close();
      console.error("Edit navigation error:", e);
    }
  };

  const handleCreate = () => {
    localStorage.removeItem("editArticleData");
    trackEvent("create_article", { action: "initiate_create_news" });
    router.push("/admin-manager/admin");
  };

  const handleCreateKeywordArticle = () => {
    localStorage.removeItem("editArticleData");
    trackEvent("create_article", { action: "initiate_create_keyword" });
    router.push("/admin-manager/keyword-articles-form");
  };

  const handleExportCSV = () => {
    const csv = [
      [
        "Title",
        "Category",
        "Author",
        "Published",
        "Views",
        "Likes",
        "Comments",
      ],
      ...filteredArticles.map((a) => [
        `"${a.title.replace(/"/g, '""')}"`,
        a.category,
        a.author,
        new Date(a.publishedAt).toLocaleDateString(),
        a.views,
        a.likes,
        a.comments,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `articles_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    trackEvent("export_data", { format: "csv" });
  };

  const renderPagination = () => {
    if (showAll || totalPages <= 1) return null;

    const windowSize = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start < windowSize - 1) {
      start = Math.max(1, end - windowSize + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => fetchArticles(currentPage - 1, searchQuery, showAll)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => fetchArticles(currentPage + 1, searchQuery, showAll)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * articlesPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * articlesPerPage, totalArticles)}
              </span>{" "}
              of <span className="font-medium">{totalArticles}</span> articles
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() =>
                  fetchArticles(currentPage - 1, searchQuery, showAll)
                }
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              {pages.map((p) => (
                <button
                  key={p}
                  onClick={() => fetchArticles(p, searchQuery, showAll)}
                  aria-current={currentPage === p ? "page" : undefined}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === p
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() =>
                  fetchArticles(currentPage + 1, searchQuery, showAll)
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const processData = () => {
    if (!Array.isArray(articles) || articles.length === 0) {
      return {
        lineData: [],
        barData: [],
        categoryData: [],
        filteredArticles: [],
        engagementData: [],
        topCategories: [],
      };
    }

    const sortedArticles = [...articles].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    if (showAll || timeRange === "all") {
      const lineData = sortedArticles.map((article) => ({
        date: new Date(article.publishedAt).toLocaleDateString(),
        views: article.views,
        likes: article.likes,
        title:
          article.title.substring(0, 20) +
          (article.title.length > 20 ? "..." : ""),
      }));

      const barData = [...sortedArticles]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map((article) => ({
          title:
            article.title.substring(0, 15) +
            (article.title.length > 15 ? "..." : ""),
          views: article.views,
          likes: article.likes,
          comments: article.comments,
        }));

      const categoryData = sortedArticles.reduce((acc, article) => {
        const existing = acc.find((item) => item.name === article.category);
        if (existing) {
          existing.value += 1;
          existing.views += article.views;
        } else {
          acc.push({
            name: article.category,
            value: 1,
            views: article.views,
          });
        }
        return acc;
      }, []);

      const engagementData = sortedArticles.map((article) => ({
        date: new Date(article.publishedAt).toLocaleDateString(),
        engagement: article.views ? (article.likes / article.views) * 100 : 0,
      }));

      const topCategories = [...categoryData]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      return {
        lineData,
        barData,
        categoryData,
        filteredArticles: sortedArticles,
        engagementData,
        topCategories,
      };
    }

    const now = new Date();
    let cutoffDate = new Date();

    if (timeRange === "7days") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === "30days") {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeRange === "90days") {
      cutoffDate.setDate(now.getDate() - 90);
    }

    const filteredArticles = sortedArticles.filter(
      (article) => new Date(article.publishedAt) >= cutoffDate
    );

    const lineData = filteredArticles.map((article) => ({
      date: new Date(article.publishedAt).toLocaleDateString(),
      views: article.views,
      likes: article.likes,
      title:
        article.title.substring(0, 20) +
        (article.title.length > 20 ? "..." : ""),
    }));

    const barData = [...filteredArticles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((article) => ({
        title:
          article.title.substring(0, 15) +
          (article.title.length > 15 ? "..." : ""),
        views: article.views,
        likes: article.likes,
        comments: article.comments,
      }));

    const categoryData = filteredArticles.reduce((acc, article) => {
      const existing = acc.find((item) => item.name === article.category);
      if (existing) {
        existing.value += 1;
        existing.views += article.views;
      } else {
        acc.push({
          name: article.category,
          value: 1,
          views: article.views,
        });
      }
      return acc;
    }, []);

    const engagementData = filteredArticles.map((article) => ({
      date: new Date(article.publishedAt).toLocaleDateString(),
      engagement: article.views ? (article.likes / article.views) * 100 : 0,
    }));

    const topCategories = [...categoryData]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      lineData,
      barData,
      categoryData,
      filteredArticles,
      engagementData,
      topCategories,
    };
  };

  const { lineData, barData, categoryData, filteredArticles, engagementData, topCategories } =
    processData();
  const totalViews = filteredArticles.reduce(
    (sum, article) => sum + article.views,
    0
  );
  const totalLikes = filteredArticles.reduce(
    (sum, article) => sum + article.likes,
    0
  );
  const engagementRate =
    filteredArticles.length > 0
      ? Math.round((totalLikes / Math.max(totalViews, 1)) * 100)
      : 0;

  const handleArticleClick = (article) => {
    trackEvent("select_content", {
      content_type: "article",
      item_id: article.id,
      title: article.title,
    });
  };

  const VirtualizedTable = () => {
    const Row = ({ index, style }) => {
      const article = filteredArticles[index];
      const engagementPercentage = article.views
        ? Math.round((article.likes / article.views) * 100)
        : 0;

      return (
        <tr
          key={article.id}
          style={style}
          className="hover:bg-gray-50 transition-colors even:bg-gray-50"
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <img
                  className="h-10 w-10 rounded-md object-cover"
                  src={article.imageUrl}
                  alt={article.title}
                  onError={(e) => {
                    e.target.src = "/placeholder-article.jpg";
                  }}
                />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  <a
                    href={`/${article.category}/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                    onClick={() => handleArticleClick(article)}
                  >
                    {article.title.length > 50
                      ? `${article.title.substring(0, 50)}...`
                      : article.title}
                  </a>
                </div>
                <div className="text-sm text-gray-500">
                  <a
                    href={`/${article.category}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.category}
                  </a>
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {article.author}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(article.publishedAt).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
            {article.views.toLocaleString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
            {article.likes.toLocaleString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
            {article.comments.toLocaleString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 text-center">
              {engagementPercentage}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(engagementPercentage, 100)}%`,
                }}
              ></div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div className="flex space-x-2 justify-center">
              <button
                onClick={() => handleEdit(article.id)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={() => handleDelete(article.id)}
                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      );
    };

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <FixedSizeList
          height={Math.min(400, filteredArticles.length * 80)}
          itemCount={filteredArticles.length}
          itemSize={80}
          width="100%"
        >
          {Row}
        </FixedSizeList>
        {renderPagination()}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Analytics Login
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Access restricted to authorized personnel only
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your admin email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Authorized emails only</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && showAll) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">
          Loading all articles, this may take a moment...
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-600">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium">Error Loading Data</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <div className="mt-4 text-sm text-gray-600">
          <p>Please check:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Your internet connection</li>
            <li>API endpoint availability</li>
            <li>Browser console for more details</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!showAll && filteredArticles.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center text-yellow-600">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium">No Data Available</h3>
        </div>
        <p className="mt-2 text-yellow-700">
          {articles.length === 0
            ? "No articles found in the system."
            : "No articles match the selected time range or search criteria."}
        </p>
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md shadow-sm hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          Show All Articles
        </button>
      </div>
    );
  }

  const gaActiveUsers = gaMetrics?.activeUsers ?? "—";
  const gaSessions = gaMetrics?.sessions ?? "—";
  const gaPageviews = gaMetrics?.pageviews ?? "—";
  const gaEngagementRate = gaMetrics?.engagementRate ?? "—";
  const gaAvgSessionDuration = gaMetrics?.averageSessionDuration ?? "—";
  const gaBounceRate = gaMetrics?.bounceRate ?? "—";
  const gaEventCounts = gaMetrics?.eventCounts || {};

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {gaError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-700">{gaError}</p>
            <p className="text-sm text-gray-600 mt-2">
              Check Google Analytics configuration or API quotas.
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              News Analytics Dashboard
            </h1>
            {currentUser && (
              <p className="text-sm text-gray-600 mt-1">
                Logged in as: {currentUser}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-48 md:w-64">
              <input
                aria-label="Search articles"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    trackEvent("search", {
                      search_term: e.target.value.trim(),
                    });
                  }
                }}
                placeholder="Search by title, author, category"
                className="pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAll}
                  onChange={() => {
                    setShowAll((v) => !v);
                    trackEvent("toggle_show_all", { show_all: !showAll });
                  }}
                />
                Show all
              </label>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateKeywordArticle}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                >
                  <FiPlus size={16} /> Keyword Article
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                >
                  <FiPlus size={16} /> News Article
                </button>
              </div>
              
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                <FiDownload size={16} /> Export
              </button>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["7days", "30days", "90days", "all"].map((range) => (
            <button
              key={range}
              onClick={() => {
                setTimeRange(range);
                trackEvent("filter_time_range", { range });
              }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
              }`}
              title={
                range === "all"
                  ? "Show all articles regardless of publication date"
                  : `Show articles from the last ${range}`
              }
            >
              {range === "7days"
                ? "Last 7 Days"
                : range === "30days"
                ? "Last 30 Days"
                : range === "90days"
                ? "Last 90 Days"
                : "All Time"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Articles</h3>
            <p className="text-2xl font-bold text-gray-800">
              {filteredArticles.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Internal Views</h3>
            <p className="text-2xl font-bold text-blue-600">
              {totalViews.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Internal Likes</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalLikes.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
            <p className="text-2xl font-bold text-purple-600">
              {engagementRate}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">GA Active Users</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {gaLoading
                ? "…"
                : typeof gaActiveUsers === "number"
                ? gaActiveUsers.toLocaleString()
                : gaActiveUsers}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">GA Sessions</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {gaLoading
                ? "…"
                : typeof gaSessions === "number"
                ? gaSessions.toLocaleString()
                : gaSessions}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">GA Pageviews</h3>
            <p className="text-2xl font-bold text-blue-600">
              {gaLoading
                ? "…"
                : typeof gaPageviews === "number"
                ? gaPageviews.toLocaleString()
                : gaPageviews}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">GA Engagement</h3>
            <p className="text-2xl font-bold text-teal-600">
              {gaLoading
                ? "…"
                : typeof gaEngagementRate === "number"
                ? `${Math.round(gaEngagementRate)}%`
                : gaEngagementRate}
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          {["overview", "articles", "categories"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                trackEvent("switch_tab", { tab });
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Views Over Time
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Views"
                      animationDuration={1000}
                    />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Likes"
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Engagement Over Time
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={engagementData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      unit="%" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, "Engagement"]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#FF8042"
                      fill="#FFBB28"
                      fillOpacity={0.3}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Top Performing Articles
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="title" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="views"
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                        name="Views"
                        animationDuration={1000}
                      />
                      <Bar
                        dataKey="likes"
                        fill="#82ca9d"
                        radius={[0, 4, 4, 0]}
                        name="Likes"
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Articles by Category
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${props.payload.name}: ${value} articles (${props.payload.views} views)`,
                        ]}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "articles" && <VirtualizedTable />}

        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Views by Category
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topCategories}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [value, "Views"]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar
                      dataKey="views"
                      fill="#8884d8"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Category Distribution
              </h2>
              <div className="space-y-4">
                {categoryData.map((category, index) => {
                  const percentage =
                    (category.value / filteredArticles.length) * 100;
                  return (
                    <div key={category.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <a
                          href={`/${category.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </a>
                        <span>
                          {category.value} articles ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;