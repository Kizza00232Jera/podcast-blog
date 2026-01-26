import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface PodcastPost {
  id: string;
  title: string;
  podcast_name: string;
  creator: string;
  source_link: string;
  tags: string[];
  summary: {
    main_topic: string;
    key_takeaways: string[];
    core_insights: string[];
    actionable_advice: string[];
    resources_mentioned: Array<{ title: string; link?: string }>;
  };
  guest_name?: string;
  duration_minutes?: number;
  rating?: number;
  user_id: string;
  created_at: string;
}

export const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<PodcastPost[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts
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

  const analyzePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAnalyzing(true);

    try {
      // TODO: AI Analysis (next step)
      // For now: fake structured data
      const fakePost: Omit<PodcastPost, "id" | "user_id" | "created_at"> = {
        title: "AI Podcast Analysis Demo",
        podcast_name: "Tech Talks 2026",
        creator: "AI Assistant",
        source_link: youtubeUrl,
        tags: ["AI", "Demo", "Podcast"],
        summary: {
          main_topic: "How AI transforms podcast analysis",
          key_takeaways: [
            "AI extracts structured insights automatically",
            "No more manual note-taking",
            "Save hours per episode"
          ],
          core_insights: [
            "The future of podcast consumption is structured, searchable insights rather than raw audio",
            "AI can identify patterns across hundreds of episodes instantly"
          ],
          actionable_advice: [
            "Always include timestamps in your podcast notes",
            "Tag episodes by topic for better discoverability",
            "Review AI insights and add your personal takeaways"
          ],
          resources_mentioned: [
            { title: "Supabase Documentation", link: "https://supabase.com/docs" },
            { title: "OpenAI API" }
          ]
        },
        guest_name: "Demo Guest",
        duration_minutes: 45,
        rating: 5
      };

      const { error: insertError } = await supabase.from("podcast_posts").insert([
        {
          ...fakePost,
          user_id: user?.id,
        },
      ]);

      if (insertError) throw insertError;

      setYoutubeUrl("");
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
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
        {/* AI Podcast Analyzer */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-12 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            ✨ Analyze Podcast
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={analyzePodcast} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                YouTube Podcast URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-lg transition-all"
                disabled={isAnalyzing}
              />
            </div>
            
            <button
              type="submit"
              disabled={isAnalyzing || !youtubeUrl}
              className="w-full py-6 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing with AI...
                </>
              ) : (
                "🎙️ Generate Structured Notes"
              )}
            </button>
          </form>
        </div>

        {/* Posts Feed */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">📚 Your Notes</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-2xl backdrop-blur-xl border border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <span className="text-3xl">🎙️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No notes yet</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                Paste a YouTube podcast URL above and watch AI generate structured notes automatically!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white/70 backdrop-blur-xl rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/50 hover:border-blue-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {post.title}
                    </h3>
                    <div className="flex gap-2">
                      {post.user_id === user?.id && (
                        <button
                          onClick={() => deletePost(post.id)}
                          className="px-4 py-2 text-red-600 font-semibold hover:text-red-700 rounded-xl hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      )}
                      <a
                        href={post.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                      >
                        🎧 Listen
                      </a>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Podcast:</span> {post.podcast_name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Creator:</span> {post.creator}
                      </p>
                      {post.guest_name && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Guest:</span> {post.guest_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {post.duration_minutes && (
                        <p className="text-sm text-gray-500">
                          ⏱️ {post.duration_minutes} min
                        </p>
                      )}
                      {post.rating && (
                        <div className="flex justify-end gap-1 mt-2">
                          {Array.from({ length: post.rating }, (_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-3">
                      🎯 Main Topic
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{post.summary.main_topic}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-bold text-blue-600 mb-3 text-lg">💡 Key Takeaways</h5>
                      <ul className="space-y-2">
                        {post.summary.key_takeaways.map((takeaway, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-500 font-bold mt-0.5">•</span>
                            {takeaway}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-purple-600 mb-3 text-lg">⚡ Action Items</h5>
                      <ul className="space-y-2">
                        {post.summary.actionable_advice.map((advice, i) => (
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
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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
