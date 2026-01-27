import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Summary {
  main_topic: string;
  content: string;
  key_takeaways: string[];
  actionable_advice: string[];
  resources_mentioned?: string[];
}

interface PodcastPost {
  id: string;
  title: string;
  podcast_name: string;
  creator: string;
  source_link: string;
  tags: string[];
  summary: Summary;
  guest_name?: string;
  duration_minutes?: number;
  rating?: number;
  user_id: string;
  created_at: string;
}

interface ImportedPodcast {
  title: string;
  podcast_name: string;
  creator: string;
  youtube_link: string;
  estimated_duration_minutes: number;
  estimated_reading_time_minutes: number;
  summary: Summary;
}

export const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<PodcastPost[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<ImportedPodcast | null>(null);
  const [formData, setFormData] = useState<Omit<PodcastPost, "id" | "user_id" | "created_at"> | null>(null);
  const [editingArrays, setEditingArrays] = useState({
    tags: [] as string[],
    key_takeaways: [] as string[],
    actionable_advice: [] as string[],
  });

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("podcast_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed: ImportedPodcast = JSON.parse(text);

      // Validate required fields
      if (!parsed.title || !parsed.podcast_name || !parsed.creator || !parsed.summary) {
        setError("Invalid JSON format. Missing required fields.");
        return;
      }

      setImportedData(parsed);

      // Initialize form data with imported data
      setFormData({
        title: parsed.title,
        podcast_name: parsed.podcast_name,
        creator: parsed.creator,
        source_link: parsed.youtube_link,
        tags: [],
        summary: parsed.summary,
        duration_minutes: parsed.estimated_duration_minutes,
        rating: undefined,
      });

      // Initialize arrays for editing
      setEditingArrays({
        tags: [],
        key_takeaways: parsed.summary.key_takeaways || [],
        actionable_advice: parsed.summary.actionable_advice || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse JSON file");
    }
  };

  const handleFormChange = (field: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleArrayChange = (arrayName: keyof typeof editingArrays, index: number, value: string) => {
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

  const handleRemoveArrayItem = (arrayName: keyof typeof editingArrays, index: number) => {
    setEditingArrays({
      ...editingArrays,
      [arrayName]: editingArrays[arrayName].filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const dataToSave: Omit<PodcastPost, "id" | "created_at"> = {
        ...formData,
        summary: {
          main_topic: formData.summary.main_topic,
          content: formData.summary.content,
          key_takeaways: editingArrays.key_takeaways.filter(item => item.trim()),
          actionable_advice: editingArrays.actionable_advice.filter(item => item.trim()),
          resources_mentioned: formData.summary.resources_mentioned,
        },
        tags: editingArrays.tags.filter(item => item.trim()),
        user_id: user?.id || "",
      };

      const { error: insertError } = await supabase
        .from("podcast_posts")
        .insert([dataToSave]);

      if (insertError) throw insertError;

      // Reset form
      setFormData(null);
      setImportedData(null);
      setEditingArrays({
        tags: [],
        key_takeaways: [],
        actionable_advice: [],
      });

      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save podcast");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("podcast_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      setError("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎙️ AI Podcast Notes
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Upload Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-12 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            Import Podcast JSON
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {!formData ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-upload"
                />
                <label
                  htmlFor="json-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="text-4xl">📄</div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Drop JSON file here or click to select
                    </p>
                    <p className="text-sm text-gray-600">
                      Upload the podcast_summary.json file I provide
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            // Edit Form
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Loaded:</span> {importedData?.title}
                </p>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
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
                    onChange={(e) => handleFormChange("podcast_name", e.target.value)}
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
                    onChange={(e) => handleFormChange("creator", e.target.value)}
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
                    onChange={(e) => handleFormChange("source_link", e.target.value)}
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
                    onChange={(e) => handleFormChange("duration_minutes", parseInt(e.target.value))}
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
                          formData.rating === star ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
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
                  Content
                </label>
                <textarea
                  value={formData.summary.content}
                  onChange={(e) =>
                    handleFormChange("summary", {
                      ...formData.summary,
                      content: e.target.value,
                    })
                  }
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-sm"
                />
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
                        onChange={(e) => handleArrayChange("tags", idx, e.target.value)}
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
                        onChange={(e) => handleArrayChange("key_takeaways", idx, e.target.value)}
                        rows={2}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Takeaway..."
                      />
                      <button
                        onClick={() => handleRemoveArrayItem("key_takeaways", idx)}
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
                        onChange={(e) => handleArrayChange("actionable_advice", idx, e.target.value)}
                        rows={2}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Action item..."
                      />
                      <button
                        onClick={() => handleRemoveArrayItem("actionable_advice", idx)}
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

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={isAnalyzing}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all"
                >
                  {isAnalyzing ? "Saving..." : "Save Podcast"}
                </button>
                <button
                  onClick={() => {
                    setFormData(null);
                    setImportedData(null);
                    setEditingArrays({ tags: [], key_takeaways: [], actionable_advice: [] });
                  }}
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Posts Feed */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Notes</h2>

          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-2xl backdrop-blur-xl border border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <span className="text-3xl">🎙️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No notes yet</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                Upload a podcast JSON file to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white/70 backdrop-blur-xl rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/50 hover:border-blue-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {post.title}
                    </h3>
                    {post.user_id === user?.id && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="px-4 py-2 text-red-600 font-semibold hover:text-red-700 rounded-xl hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Podcast:</span> {post.podcast_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Creator:</span> {post.creator}
                      </p>
                    </div>
                    <div className="text-right">
                      {post.duration_minutes && (
                        <p className="text-sm text-gray-500">
                          ⏱️ {post.duration_minutes} min
                        </p>
                      )}
                      {post.rating && (
                        <div className="flex justify-end gap-1 mt-2">
                          {Array.from({ length: post.rating }).map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-3">Main Topic</h4>
                    <p className="text-gray-700 leading-relaxed">{post.summary.main_topic}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-3">Content</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                      {post.summary.content}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="font-bold text-blue-600 mb-3 text-lg">Key Takeaways</h5>
                      <ul className="space-y-2">
                        {post.summary.key_takeaways?.map((takeaway, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-500 font-bold mt-0.5">•</span>
                            {takeaway}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-bold text-purple-600 mb-3 text-lg">Action Items</h5>
                      <ul className="space-y-2">
                        {post.summary.actionable_advice?.map((advice, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-orange-500 font-bold mt-0.5">✓</span>
                            {advice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {post.source_link && (
                      <a
                        href={post.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition inline-block"
                      >
                        Listen on YouTube
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};