import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

interface Summary {
  main_topic: string;
  content: string;
  key_takeaways?: string[];
  actionable_advice?: string[];
  resources_mentioned?: string[];
}

interface PodcastPost {
  id: string;
  slug: string;
  title: string;
  podcast_name: string;
  creator: string;
  source_link: string;
  tags: string[];
  summary: Summary;
  thumbnail_url?: string;
  duration_minutes?: number;
  rating?: number;
  user_id: string;
  created_at: string;
}


export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PodcastPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PodcastPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [creators, setCreators] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Apply filters whenever posts, search, creators, or tags change
  useEffect(() => {
    applyFilters();
  }, [posts, searchQuery, selectedCreators, selectedTags]);

  const fetchPosts = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('podcast_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
      
      const postsData = data || [];
      setPosts(postsData);

      // Extract unique creators
      const uniqueCreators = Array.from(
        new Set(postsData.map((p) => p.creator))
      ).sort();
      setCreators(uniqueCreators);

      // Extract all unique tags
      const uniqueTags = Array.from(
        new Set(postsData.flatMap((p) => p.tags || []))
      ).sort();
      setAllTags(uniqueTags);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const applyFilters = () => {
    let filtered = posts;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.summary.main_topic.toLowerCase().includes(query) ||
          post.summary.content.toLowerCase().includes(query)
      );
    }

    // Filter by creators
    if (selectedCreators.length > 0) {
      filtered = filtered.filter((post) =>
        selectedCreators.includes(post.creator)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.some((tag) => (post.tags || []).includes(tag))
      );
    }

    setFilteredPosts(filtered);
  };

  const toggleCreator = (creator: string) => {
    setSelectedCreators((prev) =>
      prev.includes(creator)
        ? prev.filter((c) => c !== creator)
        : [...prev, creator]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="🔍 Search podcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Creator Filter */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                <h3 className="font-bold text-lg text-gray-900 mb-4">👤 Creators</h3>
                <div className="space-y-2">
                  {creators.map((creator) => (
                    <label key={creator} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCreators.includes(creator)}
                        onChange={() => toggleCreator(creator)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{creator}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tag Filter */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                <h3 className="font-bold text-lg text-gray-900 mb-4">🏷️ Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        selectedTags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              {(selectedCreators.length > 0 || selectedTags.length > 0 || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCreators([]);
                    setSelectedTags([]);
                  }}
                  className="w-full px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="lg:col-span-3">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-2xl backdrop-blur-xl border border-gray-200">
                <p className="text-xl text-gray-600">No podcasts found</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/podcast/${post.slug}`}
                    className="group bg-white/70 backdrop-blur-xl rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/50 hover:border-blue-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition flex-1">
                        {post.title}
                      </h3>
                      {post.rating && (
                        <div className="flex gap-1">
                          {Array.from({ length: post.rating }).map((_, i) => (
                            <span key={i} className="text-yellow-400 text-lg">
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Podcast:</span> {post.podcast_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Creator:</span> {post.creator}
                        </p>
                      </div>
                      <div className="text-right">
                        {post.duration_minutes && (
                          <p className="text-sm text-gray-500">⏱️ {post.duration_minutes} min</p>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.summary.main_topic}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags && post.tags.length > 3 && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-blue-600 font-semibold group-hover:text-blue-700">
                        Read Full Article →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};