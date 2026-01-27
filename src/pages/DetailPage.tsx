import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  duration_minutes?: number;
  rating?: number;
}

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PodcastPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("podcast_posts")
        .select()
        .eq("id", id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("podcast_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            ← Back
          </button>
          <p className="text-xl text-gray-600">Podcast not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          ← Back to Home
        </button>

        {/* Content */}
        <article className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/50">
          {/* Title & Meta */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
              {/* Podcast Name */}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Podcast</span>
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {post.podcast_name}
                </p>
              </div>

              {/* Creator */}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Creator</span>
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {post.creator}
                </p>
              </div>

              {/* Duration & Rating */}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Duration & Rating</span>
                </p>
                <div className="flex items-center gap-3">
                  {post.duration_minutes && (
                    <span className="text-lg font-semibold text-gray-900">
                      {post.duration_minutes} min
                    </span>
                  )}
                  {post.rating && (
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-yellow-400 text-2xl ${
                            i < post.rating! ? "" : "opacity-30"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Topic */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📌 Overview</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {post.summary.main_topic}
            </p>
          </section>

          {/* Content */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📖 Full Content</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-8 whitespace-pre-wrap">
                {post.summary.content}
              </p>
            </div>
          </section>

          {/* Key Takeaways */}
          {post.summary.key_takeaways && post.summary.key_takeaways.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ✨ Key Takeaways
              </h2>
              <ul className="space-y-4">
                {post.summary.key_takeaways.map((takeaway, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-green-500 font-bold text-2xl flex-shrink-0 mt-1">
                      ✓
                    </span>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {takeaway}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Actionable Advice */}
          {post.summary.actionable_advice &&
            post.summary.actionable_advice.length > 0 && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  💡 Actionable Advice
                </h2>
                <ul className="space-y-4">
                  {post.summary.actionable_advice.map((advice, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="text-orange-500 font-bold text-2xl flex-shrink-0 mt-1">
                        💡
                      </span>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {advice}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {/* Resources */}
          {post.summary.resources_mentioned &&
            post.summary.resources_mentioned.length > 0 && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  📚 Resources Mentioned
                </h2>
                <ul className="space-y-2">
                  {post.summary.resources_mentioned.map((resource, i) => (
                    <li key={i} className="text-gray-700 text-lg">
                      • {resource}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {/* Tags */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* YouTube Link */}
          {post.source_link && (
            <section className="pt-8 border-t border-gray-200 mb-8">
              <a
                href={post.source_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                ▶️ Listen on YouTube
              </a>
            </section>
          )}

          {/* Delete Section */}
          <section className="pt-8 border-t border-gray-200">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                🗑️ Delete Article
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-800 mb-2">
                    ⚠️ Are you sure you want to delete this article?
                  </p>
                  <p className="text-red-700 text-sm">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </article>
      </main>
    </div>
  );
};