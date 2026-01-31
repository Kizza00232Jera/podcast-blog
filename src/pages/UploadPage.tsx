import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface Summary {
  main_topic: string;
  content: string;
  key_takeaways?: string[];
  actionable_advice?: string[];
  resources_mentioned?: string[];
}

interface PodcastPost {
  title: string;
  podcast_name: string;
  creator: string;
  source_link: string;
  tags: string[];
  summary: Summary;
  thumbnail_url?: string;
  duration_minutes?: number;
  rating?: number;
  user_id?: string;
  created_at?: string;
}

const extractYoutubeInfo = async (url: string) => {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Could not fetch YouTube info:', error);
  }
  return null;
};


export const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [formData, setFormData] = useState<PodcastPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingArrays, setEditingArrays] = useState({
    tags: [] as string[],
    key_takeaways: [] as string[],
    actionable_advice: [] as string[],
    resources_mentioned: [] as string[],
  });

  // Generate from YouTube using Perplexity API
const handleGenerate = async () => {
  if (!youtubeUrl.trim()) {
    setError("Please enter a YouTube URL");
    return;
  }

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (!youtubeRegex.test(youtubeUrl)) {
    setError("Please enter a valid YouTube URL");
    return;
  }

  setIsGenerating(true);
  setError(null);
  setFormData(null);

  try {
    console.log("🚀 Calling Edge Function with URL:", youtubeUrl);

    // NEW: Get YouTube video info
    const videoInfo = await extractYoutubeInfo(youtubeUrl);
    console.log("📺 Video info:", videoInfo);

    // NEW: Build the request body with metadata
    const requestBody: any = { 
      youtubeUrl,
      videoTitle: videoInfo?.title || "",
      videoAuthor: videoInfo?.author_name || "",
    };

    // NEW: Add detailed metadata if available
    if (videoInfo) {
      requestBody.videoMetadata = `
Title: ${videoInfo.title}
Author: ${videoInfo.author_name}
      `.trim();
    }

    // UPDATED: Send the request with metadata
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-podcast`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("📦 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Function returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("📦 Response data:", data);

    if (data.error) {
      throw new Error(data.error);
    }

    // Map API response to your internal format
    setFormData({
      title: data.title,
      podcast_name: data.podcast_name,
      creator: data.creator,
      source_link: data.youtubelink,
      tags: [],
      summary: data.summary,
      duration_minutes: data.estimateddurationminutes,
      rating: undefined,
      user_id: user?.id,
      created_at: new Date().toISOString(),
    });

    setEditingArrays({
      tags: [],
      key_takeaways: data.summary.key_takeaways || [],
      actionable_advice: data.summary.actionable_advice || [],
      resources_mentioned: data.summary.resources_mentioned || [],
    });
  } catch (err) {
    console.error("Generation error:", err);
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setIsGenerating(false);
  }
};



  const handleFormChange = (field: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleArrayChange = (
    arrayName: keyof typeof editingArrays,
    index: number,
    value: string,
  ) => {
    const newArray = [...editingArrays[arrayName]];
    newArray[index] = value;
    setEditingArrays({
      ...editingArrays,
      [arrayName]: newArray,
    });
  };

  const handleAddArrayItem = (arrayName: keyof typeof editingArrays) => {
    setEditingArrays({
      ...editingArrays,
      [arrayName]: [...editingArrays[arrayName], ""],
    });
  };

  const handleRemoveArrayItem = (
    arrayName: keyof typeof editingArrays,
    index: number,
  ) => {
    setEditingArrays({
      ...editingArrays,
      [arrayName]: editingArrays[arrayName].filter((_, i) => i !== index),
    });
  };

 const handleSubmit = async () => {
  if (!formData) return;
  setIsSaving(true);
  setError(null);

  try {
    // Extract YouTube thumbnail
    const getThumbnail = (url: string) => {
      const videoId = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
      )?.[1];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null;
    };

    // ✅ NEW: Generate slug from title
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
        .substring(0, 100);            // Limit length to 100 chars
    };

    const dataToSave = {
      title: formData.title,
      slug: generateSlug(formData.title),  // ✅ ADD THIS LINE
      podcast_name: formData.podcast_name,
      creator: formData.creator,
      source_link: formData.source_link,
      duration_minutes: formData.duration_minutes,
      rating: formData.rating,
      thumbnail_url: getThumbnail(formData.source_link),
      tags: editingArrays.tags.filter((item) => item.trim()),
      summary: {
        main_topic: formData.summary.main_topic,
        content: formData.summary.content,
        key_takeaways: editingArrays.key_takeaways.filter((item) =>
          item.trim(),
        ),
        actionable_advice: editingArrays.actionable_advice.filter((item) =>
          item.trim(),
        ),
        resources_mentioned: editingArrays.resources_mentioned.filter(
          (item) => item.trim(),
        ),
      },
      user_id: user?.id,
    };

    const { error: insertError } = await supabase
      .from("podcast_posts")
      .insert([dataToSave]);

    if (insertError) throw insertError;

    navigate("/");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to save podcast");
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            🎥 Generate Podcast from YouTube
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {!formData ? (
            <div className="space-y-6">
              {/* YouTube URL Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isGenerating && handleGenerate()
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-lg"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⏱️ AI generation takes 45-90 seconds. Please be patient!
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !youtubeUrl.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all text-lg"
              >
                {isGenerating ? "🤖 Generating..." : "✨ Generate Podcast"}
              </button>

              {/* Loading State */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                  <p className="text-gray-700 font-semibold text-lg">
                    Analyzing podcast with AI...
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Extracting quotes, creating sections, generating insights...
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    This usually takes 45-90 seconds
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">✅ Generated:</span>{" "}
                  {formData.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Review and edit the content below before saving
                </p>
              </div>

              {/* Basic Fields */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleFormChange("title", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Podcast Name
                    </label>
                    <input
                      type="text"
                      value={formData.podcast_name}
                      onChange={(e) =>
                        handleFormChange("podcast_name", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Creator
                    </label>
                    <input
                      type="text"
                      value={formData.creator}
                      onChange={(e) =>
                        handleFormChange("creator", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      YouTube Link
                    </label>
                    <input
                      type="url"
                      value={formData.source_link}
                      onChange={(e) =>
                        handleFormChange("source_link", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_minutes || ""}
                      onChange={(e) =>
                        handleFormChange(
                          "duration_minutes",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Rating (1-5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleFormChange("rating", star)}
                          className={`text-3xl transition ${
                            formData.rating === star
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Topic */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Main Topic
                </label>
                <textarea
                  value={formData.summary.main_topic}
                  onChange={(e) =>
                    handleFormChange("summary", {
                      ...formData.summary,
                      main_topic: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Content (Markdown with ## sections and quotes)
                </label>
                <textarea
                  value={formData.summary.content}
                  onChange={(e) =>
                    handleFormChange("summary", {
                      ...formData.summary,
                      content: e.target.value,
                    })
                  }
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-sm"
                  placeholder={
                    '## Section Title\n\nContent here...\n\n"Quote here." --- Speaker Name'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.summary.content.length} characters
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Tags
                </label>
                <div className="space-y-2 mb-3">
                  {editingArrays.tags.map((tag, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) =>
                          handleArrayChange("tags", idx, e.target.value)
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="e.g., AI, Philosophy"
                      />
                      <button
                        onClick={() => handleRemoveArrayItem("tags", idx)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddArrayItem("tags")}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  + Add Tag
                </button>
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Key Takeaways
                </label>
                <div className="space-y-2 mb-3">
                  {editingArrays.key_takeaways.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <textarea
                        value={item}
                        onChange={(e) =>
                          handleArrayChange(
                            "key_takeaways",
                            idx,
                            e.target.value,
                          )
                        }
                        rows={2}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Takeaway..."
                      />
                      <button
                        onClick={() =>
                          handleRemoveArrayItem("key_takeaways", idx)
                        }
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition h-fit"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddArrayItem("key_takeaways")}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  + Add Takeaway
                </button>
              </div>

              {/* Actionable Advice */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Actionable Advice
                </label>
                <div className="space-y-2 mb-3">
                  {editingArrays.actionable_advice.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <textarea
                        value={item}
                        onChange={(e) =>
                          handleArrayChange(
                            "actionable_advice",
                            idx,
                            e.target.value,
                          )
                        }
                        rows={2}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Action item..."
                      />
                      <button
                        onClick={() =>
                          handleRemoveArrayItem("actionable_advice", idx)
                        }
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition h-fit"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddArrayItem("actionable_advice")}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  + Add Action Item
                </button>
              </div>

              {/* Resources Mentioned */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Resources Mentioned
                </label>
                <div className="space-y-2 mb-3">
                  {editingArrays.resources_mentioned.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange(
                            "resources_mentioned",
                            idx,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Resource Name -- Description"
                      />
                      <button
                        onClick={() =>
                          handleRemoveArrayItem("resources_mentioned", idx)
                        }
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddArrayItem("resources_mentioned")}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  + Add Resource
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all"
                >
                  {isSaving ? "Saving..." : "💾 Save Podcast"}
                </button>
                <button
                  onClick={() => {
                    setFormData(null);
                    setYoutubeUrl("");
                    setEditingArrays({
                      tags: [],
                      key_takeaways: [],
                      actionable_advice: [],
                      resources_mentioned: [],
                    });
                  }}
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
