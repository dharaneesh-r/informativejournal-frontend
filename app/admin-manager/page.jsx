"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";
import debounce from "lodash.debounce";

const AdminManager = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination & search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const articlesPerPage = 10;

  const isMounted = useRef(true);
  const cancelTokenRef = useRef(null);

  const allowedEmails = [
    "dharaneeshr0803@gmail.com",
    "marip45345@gmail.com",
  ];

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
    return () => {
      isMounted.current = false;
      if (cancelTokenRef.current) cancelTokenRef.current.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search wrapper
  const debouncedFetch = useCallback(
    debounce((page, q, all) => {
      fetchArticles(page, q, all);
    }, 400),
    []
  );

  useEffect(() => {
    setCurrentPage(1);
    debouncedFetch(1, searchQuery, showAll);
  }, [searchQuery, showAll, debouncedFetch]);

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
        limit: all ? 1000 : articlesPerPage,
      };
      if (q && q.trim()) {
        params.search = q.trim(); // backend must support this
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

      const data = response.data.data || [];
      const total = response.data.totalArticles ?? data.length;
      const pages = all
        ? 1
        : Math.max(
            1,
            Math.ceil((response.data.totalArticles || 0) / articlesPerPage)
          );

      setArticles(data);
      setTotalArticles(total);
      setTotalPages(pages);
      setCurrentPage(all ? 1 : page);
    } catch (err) {
      if (axios.isCancel(err)) {
        // ignore
      } else {
        console.error("Fetch articles error:", err.response?.data || err.message);
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
              (err.response && err.response.data && err.response.data.message) ||
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
    router.push("/admin-manager/admin");
  };

  const handleCreateKeywordArticle = () => {
    localStorage.removeItem("editArticleData");
    router.push("/admin-manager/keyword-articles-form");
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
      <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Authorized emails only</p>
            <p className="mt-1">({allowedEmails.join(", ")})</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Article Management</h1>
            {currentUser && (
              <p className="text-sm text-gray-600 mt-1">
                Logged in as: {currentUser}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative">
              <input
                aria-label="Search articles"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, category"
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAll}
                onChange={() => setShowAll((v) => !v)}
              />
              Show all
            </label>
            <button
              onClick={handleCreateKeywordArticle}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FiPlus /> Create Keyword Article
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FiPlus /> Create News Article
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Author
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-normal max-w-xs">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 sm:hidden">
                          {article.author && `Author: ${article.author}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 sm:hidden">
                          {article.category && `Category: ${article.category}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 sm:hidden">
                          {article.createdAt &&
                            `Created: ${new Date(
                              article.createdAt
                            ).toLocaleDateString()}`}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-500">
                          {article.author || "Unknown"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-500 capitalize">
                          {article.category}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-500">
                          {article.createdAt &&
                            new Date(article.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(article._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(article._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No articles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManager;
