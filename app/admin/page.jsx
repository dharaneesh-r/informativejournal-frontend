"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import axios from "axios";

export default function AdminArticleForm() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    content: [],
  });

  // Fetch articles from the API
  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await axios.get("http://localhost:8080/articles");
        if (response.data.status === "success") {
          setArticles(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  // GSAP animation for form transitions
  useEffect(() => {
    if (selectedArticle) {
      gsap.from(".form-container", {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.from(".article-list", {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [selectedArticle]);

  // Handle article edit
  const handleEdit = (article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      description: article.description,
      content: article.content,
    });
  };

  // Handle article deletion
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await axios.delete(`http://localhost:8080/articles/${id}`);
        setArticles(articles.filter((article) => article._id !== id));
        alert("Article deleted successfully!");
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle content section changes
  const handleContentChange = (index, key, value) => {
    const updatedContent = [...formData.content];
    updatedContent[index][key] = value;
    setFormData((prev) => ({ ...prev, content: updatedContent }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8080/articles/${selectedArticle._id}`,
        formData
      );
      alert("Article updated successfully!");
      setSelectedArticle(null);
    } catch (error) {
      console.error("Error updating article:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {!selectedArticle ? (
          <div className="article-list">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              All Articles
            </h2>
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article._id}
                  className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-800">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {article.category}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="form-container p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Edit Article
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                ></textarea>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Content Sections
                </h3>
                {formData.content.map((section, index) => (
                  <div key={section._id} className="mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) =>
                          handleContentChange(index, "title", e.target.value)
                        }
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Content
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) =>
                          handleContentChange(index, "content", e.target.value)
                        }
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
