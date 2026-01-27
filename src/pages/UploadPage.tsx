import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface Summary {
  main_topic: string;
  content: string;
  key_takeaways: string[];
  actionable_advice: string[];
  resources_mentioned?: string[];
}

interface PodcastPost {
  title: string;
  podcast_name: string;
  creator: string;
  source_link: string;
  tags: string[];
  summary: Summary;
  duration_minutes?: number;
  rating?: number;
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

export const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PodcastPost | null>(null);
  const [importedData, setImportedData] = useState<ImportedPodcast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingArrays, setEditingArrays] = useState({
    tags: [] as string[],
    key_takeaways: [] as string[],
    actionable_advice: [] as string[],
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed: ImportedPodcast = JSON.parse(text);

      if (!parsed.title || !parsed.podcast_name || !parsed.creator || !parsed.summary) {
        setError("Invalid JSON format. Missing required fields.");
        return;
      }

      setImportedData(parsed);
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
      const dataToSave = {
        ...formData,
        summary: {
          main_topic: formData.summary.main_topic,
          content: formData.summary.content,
          key_takeaways: editingArrays.key_takeaways.filter((item) => item.trim()),
          actionable_advice: editingArrays.actionable_advice.filter((item) => item.trim()),
          resources_mentioned: formData.summary.resources_mentioned,
        },
        tags: editingArrays.tags.filter((item) => item.trim()),
        user_id: user?.id || "",
      };

      const { error: insertError } = await supabase
        .from("podcast_posts")
        .insert([dataToSave]);

      if (insertError) throw insertError;

      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save podcast");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            📤 Upload Podcast
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
                <label htmlFor="json-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="text-4xl">📄</div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Drop JSON file here or click</p>
                    <p className="text-sm text-gray-600">Upload the podcast_summary.json file</p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Loaded:</span> {importedData?.title}
                </p>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Podcast Name</label>
                  <input
                    type="text"
                    value={formData.podcast_name}
                    onChange={(e) => handleFormChange("podcast_name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Creator</label>
                  <input
                    type="text"
                    value={formData.creator}
                    onChange={(e) => handleFormChange("creator", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">YouTube Link</label>
                  <input
                    type="url"
                    value={formData.source_link}
                    onChange={(e) => handleFormChange("source_link", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes || ""}
                    onChange={(e) => handleFormChange("duration_minutes", parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Rating (1-5)</label>
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Main Topic</label>
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Content</label>
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
                <label className="block text-sm font-semibold text-gray-900 mb-3">Tags</label>
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
                <label className="block text-sm font-semibold text-gray-900 mb-3">Key Takeaways</label>
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
                <label className="block text-sm font-semibold text-gray-900 mb-3">Actionable Advice</label>
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
      </main>
    </div>
  );
};