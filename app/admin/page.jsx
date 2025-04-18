"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

const ArticlePostForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    category: "technology",
    title: "",
    slug: "", // Added slug field
    image: "",
    video: "",
    description: "",
    content: [
      {
        title: "",
        image: "",
        video: "",
        content: "",
        keypoints: [{ points: [] }],
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Warn before leaving if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Auto-generate slug when title changes
      if (name === 'title') {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
    
    clearValidationError(name);
  };

  // Handle content block field changes
  const handleContentChange = (index, e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData((prev) => {
      const updatedContent = [...prev.content];
      updatedContent[index] = {
        ...updatedContent[index],
        [name]: value,
      };
      return {
        ...prev,
        content: updatedContent,
      };
    });
    clearValidationError(`content-${index}-${name}`);
  };

  // Handle keypoint changes
  const handleKeypointChange = (contentIndex, pointIndex, e) => {
    const { value } = e.target;
    setIsDirty(true);
    setFormData((prev) => {
      const updatedContent = [...prev.content];
      const updatedPoints = [
        ...updatedContent[contentIndex].keypoints[0].points,
      ];
      updatedPoints[pointIndex] = value;
      updatedContent[contentIndex].keypoints[0].points = updatedPoints;
      return {
        ...prev,
        content: updatedContent,
      };
    });
  };

  // Clear validation error for a field
  const clearValidationError = (fieldName) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Add new content block
  const addContentBlock = () => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        {
          title: "",
          image: "",
          video: "",
          content: "",
          keypoints: [{ points: [] }],
        },
      ],
    }));
  };

  // Add new keypoint to content block
  const addKeypoint = (contentIndex) => {
    setIsDirty(true);
    setFormData((prev) => {
      const updatedContent = [...prev.content];
      updatedContent[contentIndex].keypoints[0].points.push("");
      return {
        ...prev,
        content: updatedContent,
      };
    });
  };

  // Remove content block with confirmation
  const removeContentBlock = (index) => {
    Swal.fire({
      title: "Remove Section?",
      text: "This will delete the entire content section.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete Section",
      cancelButtonText: "Keep Section",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDirty(true);
        setFormData((prev) => ({
          ...prev,
          content: prev.content.filter((_, i) => i !== index),
        }));
      }
    });
  };

  // Remove keypoint from content block
  const removeKeypoint = (contentIndex, pointIndex) => {
    setIsDirty(true);
    setFormData((prev) => {
      const updatedContent = [...prev.content];
      updatedContent[contentIndex].keypoints[0].points.splice(pointIndex, 1);
      return {
        ...prev,
        content: updatedContent,
      };
    });
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    // Main article validation
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.image.trim()) {
      errors.image = "Featured image is required";
    } else if (!isValidUrl(formData.image)) {
      errors.image = "Please enter a valid URL";
    }

    if (formData.video && !isValidUrl(formData.video)) {
      errors.video = "Please enter a valid URL";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 20) {
      errors.description = "Description should be at least 20 characters";
    }

    // Validate each content block
    formData.content.forEach((block, index) => {
      if (!block.title.trim()) {
        errors[`content-${index}-title`] = "Section title is required";
      }
      if (!block.image.trim()) {
        errors[`content-${index}-image`] = "Section image is required";
      } else if (!isValidUrl(block.image)) {
        errors[`content-${index}-image`] = "Please enter a valid URL";
      }
      if (block.video && !isValidUrl(block.video)) {
        errors[`content-${index}-video`] = "Please enter a valid URL";
      }
      if (!block.content.trim()) {
        errors[`content-${index}-content`] = "Section content is required";
      } else if (block.content.length < 50) {
        errors[`content-${index}-content`] =
          "Content should be at least 50 characters";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Simple URL validation
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Form Errors",
        html: "Please correct the highlighted fields before submitting.",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.post(
        "https://informativejournal-backend.vercel.app/articles",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Article Published!",
        html: `
          <p>Your article has been successfully published.</p>
          <p class="mt-2 text-sm">You'll be redirected to the admin panel.</p>
        `,
        showConfirmButton: false,
        timer: 2000,
      });

      // Reset form state
      setIsDirty(false);
      setFormData({
        category: "technology",
        title: "",
        slug: "",
        image: "",
        video: "",
        description: "",
        content: [
          {
            title: "",
            image: "",
            video: "",
            content: "",
            keypoints: [{ points: [] }],
          },
        ],
      });

      // Redirect to admin panel
      router.push("/admin");
    } catch (err) {
      let errorMessage = "Failed to publish article. Please try again.";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Your session has expired. Please login again.";
          router.push("/login");
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Publishing Failed",
        html: `
          <p>${errorMessage}</p>
          ${
            err.response?.status === 401
              ? '<p class="mt-2 text-sm">Redirecting to login...</p>'
              : '<p class="mt-2 text-sm">Please check your data and try again.</p>'
          }
        `,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Create New Article
          </h1>
          <p className="text-gray-600 mt-1">
            Fill in the details below to publish a new article
          </p>
        </div>
        {isDirty && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Unsaved changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* Main Article Fields */}
        <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-700 border-b pb-2">
            Article Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                  validationErrors.category
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <option value="technology">Technology</option>
                <option value="science">Science</option>
                <option value="health">Health & Wellness</option>
                <option value="business">Business</option>
                <option value="startup">Startup</option>
                <option value="entertainment">Entertainment</option>
                <option value="sports">Sports</option>
                <option value="politics">Politics</option>
                <option value="finance">Finance</option>
                <option value="mutualfund">Mutual Funds</option>
                <option value="stockmarket">Stock Market</option>
                <option value="cryptocurrency">Cryptocurrency</option>
                <option value="commodities">Commodities</option>
                <option value="economics">Economics</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="world">World</option>
                <option value="india">India</option>
                <option value="us">US</option>
                <option value="russia">Russia</option>
                <option value="china">China</option>
                <option value="singapore">Singapore</option>
              </select>
              {validationErrors.category && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter article title"
                className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                  validationErrors.title
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.title && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.title}
                </p>
              )}
            </div>
          </div>

          {/* Slug Field */}
          <div className="mt-4 md:mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Slug*
            </label>
            <div className="relative">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="article-slug"
                className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                  validationErrors.slug
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {formData.title && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      slug: generateSlug(prev.title)
                    }));
                    clearValidationError('slug');
                  }}
                  className="absolute right-2 top-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  title="Regenerate from title"
                >
                  Regenerate
                </button>
              )}
            </div>
            {validationErrors.slug && (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.slug}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              URL-friendly identifier for the article
            </p>
          </div>

          <div className="mt-4 md:mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Featured Image URL*
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={`flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                  validationErrors.image
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {formData.image && (
                <button
                  type="button"
                  onClick={() => window.open(formData.image, "_blank")}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Preview image"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              )}
            </div>
            {validationErrors.image ? (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.image}
              </p>
            ) : (
              <p className="text-gray-500 text-xs mt-1">
                Provide a high-quality image URL (JPEG, PNG, or WebP)
              </p>
            )}
          </div>

          <div className="mt-4 md:mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Featured Video URL (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                name="video"
                value={formData.video}
                onChange={handleChange}
                placeholder="https://example.com/video.mp4"
                className={`flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                  validationErrors.video
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {formData.video && (
                <button
                  type="button"
                  onClick={() => window.open(formData.video, "_blank")}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Preview video"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              )}
            </div>
            {validationErrors.video ? (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.video}
              </p>
            ) : (
              <p className="text-gray-500 text-xs mt-1">
                Add a video URL (MP4, WebM, or YouTube embed)
              </p>
            )}
          </div>

          <div className="mt-4 md:mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief summary of your article (20-200 characters)"
              rows={3}
              className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                validationErrors.description
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center">
              {validationErrors.description ? (
                <p className="text-red-600 text-xs">
                  {validationErrors.description}
                </p>
              ) : (
                <p className="text-gray-500 text-xs">
                  {formData.description.length < 20
                    ? `Minimum ${
                        20 - formData.description.length
                      } more characters needed`
                    : "Good description length"}
                </p>
              )}
              <span
                className={`text-xs ${
                  formData.description.length >1000
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {formData.description.length}/1000
              </span>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                Content Sections
              </h2>
              <p className="text-gray-500 text-sm">
                Add multiple sections to structure your article
              </p>
            </div>
            <button
              type="button"
              onClick={addContentBlock}
              className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 w-full md:w-auto justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Section
            </button>
          </div>

          {formData.content.map((contentBlock, contentIndex) => (
            <div
              key={contentIndex}
              className="p-4 md:p-6 border border-gray-200 rounded-lg bg-gray-50 group relative"
            >
              <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {formData.content.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContentBlock(contentIndex)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                    title="Remove section"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <h3 className="text-base md:text-lg font-medium text-gray-700 mb-4">
                Section {contentIndex + 1}
              </h3>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Section Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={contentBlock.title}
                    onChange={(e) => handleContentChange(contentIndex, e)}
                    placeholder="Section heading"
                    className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                      validationErrors[`content-${contentIndex}-title`]
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {validationErrors[`content-${contentIndex}-title`] && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors[`content-${contentIndex}-title`]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Section Image URL*
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      name="image"
                      value={contentBlock.image}
                      onChange={(e) => handleContentChange(contentIndex, e)}
                      placeholder="https://example.com/section-image.jpg"
                      className={`flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                        validationErrors[`content-${contentIndex}-image`]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {contentBlock.image && (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(contentBlock.image, "_blank")
                        }
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Preview image"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {validationErrors[`content-${contentIndex}-image`] ? (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors[`content-${contentIndex}-image`]}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-xs mt-1">
                      Image that illustrates this section
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Section Video URL (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      name="video"
                      value={contentBlock.video}
                      onChange={(e) => handleContentChange(contentIndex, e)}
                      placeholder="https://example.com/section-video.mp4"
                      className={`flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                        validationErrors[`content-${contentIndex}-video`]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {contentBlock.video && (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(contentBlock.video, "_blank")
                        }
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Preview video"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {validationErrors[`content-${contentIndex}-video`] && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors[`content-${contentIndex}-video`]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Content*
                  </label>
                  <textarea
                    name="content"
                    value={contentBlock.content}
                    onChange={(e) => handleContentChange(contentIndex, e)}
                    placeholder="Write your content here (minimum 50 characters)"
                    rows={5}
                    className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all ${
                      validationErrors[`content-${contentIndex}-content`]
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    {validationErrors[`content-${contentIndex}-content`] ? (
                      <p className="text-red-600 text-xs">
                        {validationErrors[`content-${contentIndex}-content`]}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs">
                        {contentBlock.content.length < 50
                          ? `Minimum ${
                              50 - contentBlock.content.length
                            } more characters needed`
                          : "Good content length"}
                      </p>
                    )}
                    <span
                      className={`text-xs ${
                        contentBlock.content.length > 5000
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {contentBlock.content.length}/5000
                    </span>
                  </div>
                </div>

                {/* Keypoints */}
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Key Points
                    </label>
                    <button
                      type="button"
                      onClick={() => addKeypoint(contentIndex)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Key Point
                    </button>
                  </div>

                  {contentBlock.keypoints[0].points.length === 0 ? (
                    <div className="text-sm text-gray-500 italic p-3 bg-gray-100 rounded-lg">
                      No key points added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contentBlock.keypoints[0].points.map(
                        (point, pointIndex) => (
                          <div
                            key={pointIndex}
                            className="flex items-center gap-2 group"
                          >
                            <div className="flex-grow flex items-center gap-2">
                              <span className="text-gray-500">•</span>
                              <input
                                type="text"
                                value={point}
                                onChange={(e) =>
                                  handleKeypointChange(
                                    contentIndex,
                                    pointIndex,
                                    e
                                  )
                                }
                                placeholder="Enter key point"
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeKeypoint(contentIndex, pointIndex)
                              }
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-all duration-200"
                              title="Remove key point"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (isDirty) {
                  Swal.fire({
                    title: "Discard changes?",
                    text: "You have unsaved changes that will be lost.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Discard",
                    cancelButtonText: "Keep Editing",
                    reverseButtons: true,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      router.push("/admin-manager");
                    }
                  });
                } else {
                  router.push("/admin");
                }
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Publishing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Publish Article
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticlePostForm;