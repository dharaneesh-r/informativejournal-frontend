"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FiEdit, FiTrash2, FiPlus, FiLogOut } from "react-icons/fi";

const AdminManager = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Valid admin credentials
  const validCredentials = [
    { email: "dharaneeshr0803@gmail.com", password: "Dhara@080304" },
    { email: "marip45345@gmail.com", password: "Marip@45345" },
  ];

  // Check if credentials are valid
  const isValidCredentials = (email, password) => {
    return validCredentials.some(
      (cred) => cred.email === email && cred.password === password
    );
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedEmail = localStorage.getItem("adminEmail");
    const storedPassword = localStorage.getItem("adminPassword");

    if (
      token &&
      storedEmail &&
      storedPassword &&
      isValidCredentials(storedEmail, storedPassword)
    ) {
      verifyToken(token);
    }
  }, []);

  // Verify JWT token
  const verifyToken = async (token) => {
    try {
      const response = await axios.get(
        "https://informativejournal-backend.vercel.app/verify",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (validCredentials.some((cred) => cred.email === response.data.email)) {
        setIsAuthenticated(true);
        fetchArticles();
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isValidCredentials(email, password)) {
        const response = await axios.post(
          "https://informativejournal-backend.vercel.app/login",
          {
            email,
            password,
          }
        );

        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminPassword", password);
        setIsAuthenticated(true);
        fetchArticles();

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminPassword");
    setIsAuthenticated(false);
    setArticles([]);
  };

  // Fetch all articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "https://informativejournal-backend.vercel.app/articles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setArticles(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to fetch articles",
        text: error.response?.data?.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete article
  const handleDelete = async (category, slug) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("authToken");
          await axios.delete(
            `https://informativejournal-backend.vercel.app/articles/${category}/${slug}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          Swal.fire("Deleted!", "Your article has been deleted.", "success");
          fetchArticles();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: error.response?.data?.message || "Server error",
          });
        }
      }
    });
  };

  // Navigate to edit page
  const handleEdit = (category, slug) => {
    router.push(`/admin/edit/${category}/${slug}`);
  };

  // Navigate to create page
  const handleCreate = () => {
    router.push("/admin-manager/admin");
  };

  const handleCreateKeywordArticle = () => {
    router.push("/admin-manager/keyword-articles-form");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Article Management</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleCreateKeywordArticle}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full sm:w-auto justify-center"
            >
              <FiPlus /> Create Keyword Article
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full sm:w-auto justify-center"
            >
              <FiPlus /> Create News Article
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full sm:w-auto justify-center"
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article._id}>
                      <td className="px-4 py-4 whitespace-normal max-w-xs">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {article.slug}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {article.author || "Unknown"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 capitalize">
                          {article.category}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleEdit(article.category, article.slug)
                            }
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(article.category, article.slug)
                            }
                            className="text-red-600 hover:text-red-900 p-1 rounded-md"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {articles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No articles found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManager;
