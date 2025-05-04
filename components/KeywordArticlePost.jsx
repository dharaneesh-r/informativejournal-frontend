"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";

const KeywordArticleForm = () => {
  const router = useRouter();
  const [authToken, setAuthToken] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    slug: "",
    image: "",
    description: "",
    content: [{ title: "", description: "", image: "" }],
    contentSchema: [""],
    keypoints: [{ points: [""] }],
    seokeywords: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState([true]);

  // Get auth token from localStorage when component mounts
  useEffect(() => {
    // Only run on the client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        setAuthToken(token);
      } else {
        // Redirect to login if no token found
        setErrors({ auth: "No authentication token found. Please login." });
        // Optional: Redirect to login page
        // setTimeout(() => router.push("/login"), 1500);
      }
    }
  }, []);

  // Handle basic form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generate slug from title
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, slug }));
  };

  // Handle content section changes
  const handleContentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContent = [...formData.content];
    updatedContent[index] = { ...updatedContent[index], [name]: value };
    setFormData((prev) => ({ ...prev, content: updatedContent }));
  };

  // Handle content schema changes
  const handleContentSchemaChange = (index, e) => {
    const { value } = e.target;
    const updatedSchema = [...formData.contentSchema];
    updatedSchema[index] = value;
    setFormData((prev) => ({ ...prev, contentSchema: updatedSchema }));
  };

  // Add new content schema point
  const addSchemaPoint = () => {
    setFormData((prev) => ({
      ...prev,
      contentSchema: [...prev.contentSchema, ""],
    }));
  };

  // Remove content schema point
  const removeSchemaPoint = (index) => {
    if (formData.contentSchema.length > 1) {
      const updatedSchema = [...formData.contentSchema];
      updatedSchema.splice(index, 1);
      setFormData((prev) => ({ ...prev, contentSchema: updatedSchema }));
    }
  };

  // Handle keypoint changes
  const handleKeypointChange = (pointIndex, e) => {
    const { value } = e.target;
    const updatedKeypoints = [...formData.keypoints];
    updatedKeypoints[0].points[pointIndex] = value;
    setFormData((prev) => ({ ...prev, keypoints: updatedKeypoints }));
  };

  // Handle SEO keywords change
  const handleSeoKeywordsChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      seokeywords: value.split(",").map((k) => k.trim()),
    }));
  };

  // Add new content section
  const addContentSection = () => {
    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, { title: "", description: "", image: "" }],
    }));
    setExpandedSections([...expandedSections, true]);
  };

  // Remove content section
  const removeContentSection = (index) => {
    if (formData.content.length > 1) {
      const updatedContent = [...formData.content];
      updatedContent.splice(index, 1);
      setFormData((prev) => ({ ...prev, content: updatedContent }));

      const updatedExpanded = [...expandedSections];
      updatedExpanded.splice(index, 1);
      setExpandedSections(updatedExpanded);
    }
  };

  // Toggle section expansion
  const toggleSection = (index) => {
    const updatedExpanded = [...expandedSections];
    updatedExpanded[index] = !updatedExpanded[index];
    setExpandedSections(updatedExpanded);
  };

  // Add new keypoint
  const addKeypoint = () => {
    const updatedKeypoints = [...formData.keypoints];
    updatedKeypoints[0].points.push("");
    setFormData((prev) => ({ ...prev, keypoints: updatedKeypoints }));
  };

  // Remove keypoint
  const removeKeypoint = (index) => {
    if (formData.keypoints[0].points.length > 1) {
      const updatedKeypoints = [...formData.keypoints];
      updatedKeypoints[0].points.splice(index, 1);
      setFormData((prev) => ({ ...prev, keypoints: updatedKeypoints }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!authToken) newErrors.auth = "Authentication token is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.slug) newErrors.slug = "Slug is required";
    if (!formData.image) newErrors.image = "Featured image is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (formData.content.some((section) => !section.title))
      newErrors.content = "All sections need a title";
    if (formData.content.some((section) => !section.description))
      newErrors.content = "All sections need a description";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://informativejournal-backend.vercel.app/keyword-articles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken, // Add the auth token to the headers
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create article");
      }

      setSuccessMessage("Article created successfully! Redirecting...");
      setTimeout(() => router.push("/keyword-articles"), 1500);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Keyword Article
      </h1>

      {/* Authentication Error Message */}
      {errors.auth && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {errors.auth}
        </div>
      )}

      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category*
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-8 border rounded-md appearance-none ${
                    errors.category
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="technology">Technology</option>
                  <option value="health">Health</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FiChevronDown className="h-4 w-4" />
                </div>
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={generateSlug}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter article title"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Slug*
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border rounded-l-md ${
                    errors.slug ? "border-red-300 bg-red-50" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="article-slug"
                  required
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-3 py-2 border-t border-b border-r border-gray-300 bg-gray-100 text-gray-700 rounded-r-md hover:bg-gray-200 transition-colors"
                >
                  Generate
                </button>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Used in the article URL (e.g., example.com/articles/your-slug)
              </p>
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Featured Image URL*
              </label>
              <div className="flex">
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border rounded-l-md ${
                    errors.image
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {formData.image && (
                  <div className="flex items-center justify-center px-3 border-t border-b border-r border-gray-300 bg-gray-100 rounded-r-md">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-8 w-8 object-cover rounded"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
              {formData.image && (
                <p className="mt-1 text-xs text-gray-500">Image preview</p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.description
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter a brief description of your article"
                required
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/10000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">
              Content Sections
            </h2>
            <button
              type="button"
              onClick={addContentSection}
              className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
            >
              <FiPlus className="mr-1" /> Add Section
            </button>
          </div>

          {errors.content && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              <p className="text-sm">{errors.content}</p>
            </div>
          )}

          {formData.content.map((section, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-700">
                    Section {index + 1}: {section.title || "Untitled Section"}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {formData.content.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeContentSection(index);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                      title="Remove section"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                    title={expandedSections[index] ? "Collapse" : "Expand"}
                  >
                    {expandedSections[index] ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </button>
                </div>
              </div>

              {expandedSections[index] && (
                <div className="p-4 space-y-4">
                  <div>
                    <label
                      htmlFor={`content-title-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Section Title*
                    </label>
                    <input
                      type="text"
                      id={`content-title-${index}`}
                      name="title"
                      value={section.title}
                      onChange={(e) => handleContentChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter section title"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`content-description-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Section Description*
                    </label>
                    <textarea
                      id={`content-description-${index}`}
                      name="description"
                      value={section.description}
                      onChange={(e) => handleContentChange(index, e)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter section content"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label
                      htmlFor={`content-image-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Section Image URL
                    </label>
                    <div className="flex">
                      <input
                        type="url"
                        id={`content-image-${index}`}
                        name="image"
                        value={section.image}
                        onChange={(e) => handleContentChange(index, e)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      {section.image && (
                        <div className="flex items-center justify-center px-3 border-t border-b border-r border-gray-300 bg-gray-100 rounded-r-md">
                          <img
                            src={section.image}
                            alt="Preview"
                            className="h-8 w-8 object-cover rounded"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        </div>
                      )}
                    </div>
                    {section.image && (
                      <p className="mt-1 text-xs text-gray-500">
                        Image preview
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Schema */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Content Schema
            </h2>
            <button
              type="button"
              onClick={addSchemaPoint}
              className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
            >
              <FiPlus className="mr-1" /> Add Schema Point
            </button>
          </div>

          <div className="space-y-2">
            {formData.contentSchema.map((point, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleContentSchemaChange(index, e)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Enter schema point ${index + 1}`}
                />
                {formData.contentSchema.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSchemaPoint(index)}
                    className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                    title="Remove schema point"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Define the structure and organization of your article content
          </p>
        </div>

        {/* Key Points */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">Key Points</h2>
            <button
              type="button"
              onClick={addKeypoint}
              className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
            >
              <FiPlus className="mr-1" /> Add Point
            </button>
          </div>

          <div className="space-y-2">
            {formData.keypoints[0].points.map((point, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleKeypointChange(index, e)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Enter key point ${index + 1}`}
                />
                {formData.keypoints[0].points.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeypoint(index)}
                    className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                    title="Remove point"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Keywords */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label
            htmlFor="seokeywords"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SEO Keywords
          </label>
          <input
            type="text"
            id="seokeywords"
            name="seokeywords"
            value={formData.seokeywords.join(", ")}
            onChange={handleSeoKeywordsChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate keywords with commas
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !authToken}
            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              isSubmitting || !authToken ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Creating Article...
              </span>
            ) : !authToken ? (
              "Authentication Required"
            ) : (
              "Create Article"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KeywordArticleForm;
