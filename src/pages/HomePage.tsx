import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const POSTS_PER_PAGE = 12;

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver>();
  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  // Fetch posts with pagination
  useEffect(() => {
    fetchPosts();
  }, [page]);

  // Apply search filter
  useEffect(() => {
    applyFilters();
  }, [posts, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("podcast_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;

      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }

      setPosts((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = posts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.summary.main_topic.toLowerCase().includes(query) ||
          post.summary.content.toLowerCase().includes(query),
      );
    }

    setFilteredPosts(filtered);
  };

  const truncateTitle = (title: string, maxLength = 80) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  const renderStars = (rating?: number) => {
    return "⭐".repeat(rating || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎙️ PodNotes</h1>
          <p className="text-gray-600">Discover and explore podcast episodes</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Search podcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Articles Grid - Layout 1: 3 columns desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <div
              key={post.id}
              ref={
                filteredPosts.length === index + 1 && hasMore
                  ? lastPostRef
                  : null
              }
            >
              <Link
                to={`/podcast/${post.slug}`}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden 
                 transition-all duration-300 hover:-translate-y-1 
                 hover:shadow-xl cursor-pointer block"
              >
                {/* Image - Gradient fallback */}
                <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
                    {truncateTitle(post.title)}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-2 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Podcast:</span>{" "}
                      {post.podcast_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Creator:</span>{" "}
                      {post.creator}
                    </p>
                  </div>

                  {/* Duration & Rating on same line */}
                  <div className="flex justify-between items-center mb-3">
                    {post.duration_minutes ? (
                      <p className="text-sm text-gray-600">
                        ⏱️ {post.duration_minutes} min
                      </p>
                    ) : (
                      <div></div>
                    )}
                    {post.rating && (
                      <div className="text-yellow-400 text-sm">
                        {renderStars(post.rating)}
                      </div>
                    )}
                  </div>

                  {/* Preview/Summary */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                    {post.summary.main_topic}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags && post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="pt-3 border-t border-gray-200 flex gap-2.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/podcast/${post.slug}`;
                      }}
                      className="flex-1 bg-indigo-600 text-white py-2 px-3 
                       rounded-md text-sm font-medium 
                       hover:bg-indigo-700 transition-colors"
                    >
                      Read Full Article →
                    </button>

                    {post.source_link && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(post.source_link, "_blank");
                        }}
                        className="flex-1 bg-red-500 text-white py-2 px-3 
                         rounded-md text-sm font-medium 
                         hover:bg-red-600 transition-colors"
                      >
                        ▶️ YouTube
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* End of Results Message */}
        {!hasMore && filteredPosts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            You've reached the end! 🎉
          </div>
        )}

        {/* No Results */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No podcasts found
          </div>
        )}
      </div>
    </div>
  );
};
