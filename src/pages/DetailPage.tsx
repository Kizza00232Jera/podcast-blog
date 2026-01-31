import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";


interface Summary {
  main_topic: string;
  content: string;
  key_takeaways?: string[];
  actionable_advice?: string[];
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
  thumbnail_url?: string;
  duration_minutes?: number;
  rating?: number;
  user_id: string;
  created_at: string;
}


// Helper function to extract YouTube thumbnail from URL
const getYouTubeThumbnail = (youtubeUrl: string): string | null => {
  try {
    const videoId = youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
    )?.[1];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  } catch (e) {
    console.error("Error extracting YouTube thumbnail:", e);
  }
  return null;
};


// Helper function to render rating stars
const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "★".repeat(fullStars);
  if (hasHalfStar) stars += "½";
  stars += "☆".repeat(5 - Math.ceil(rating));
  return stars;
};


// Parse content into sections (chapters, quotes, paragraphs)
interface ContentSection {
  type: "heading" | "paragraph" | "quote";
  content?: string;
  quoteText?: string;
  author?: string;
}


const parseContent = (text: string): ContentSection[] => {
  if (!text) return [];


  const sections: ContentSection[] = [];
  const parts = text.split("\n\n");


  parts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;


    // Check for chapter headers (## Chapter Title)
    if (trimmed.startsWith("##")) {
      sections.push({
        type: "heading",
        content: trimmed.replace(/^##\s*/, "").trim(),
      });
    }
    // Check for quotes ("Quote text" --- Author Name or --- Author Name)
    else if (
      (trimmed.includes(" --- ") || trimmed.includes(" — ")) &&
      trimmed.includes('"')
    ) {
      // Try to match quotes with --- (three dashes)
      let quoteMatch = trimmed.match(/"([^"]+)"\s*---\s*(.+)$/);
      
      // If no match, try with — (em dash)
      if (!quoteMatch) {
        quoteMatch = trimmed.match(/"([^"]+)"\s*—\s*(.+)$/);
      }
      
      if (quoteMatch) {
        sections.push({
          type: "quote",
          quoteText: quoteMatch[1],
          author: quoteMatch[2].trim(),
        });
      } else {
        // If it looks like a quote but didn't parse, treat as paragraph
        sections.push({
          type: "paragraph",
          content: trimmed,
        });
      }
    }
    // Regular paragraph
    else {
      sections.push({
        type: "paragraph",
        content: trimmed,
      });
    }
  });


  return sections;
};



export const DetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PodcastPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    fetchPost();
  }, [slug]);


  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("podcast_posts")
        .select("*")
        .eq("slug", slug as string)
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
        .eq("slug", slug as string);


      if (error) throw error;
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }


  if (!post) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <p className="text-lg text-gray-600">Podcast not found</p>
        </div>
      </main>
    );
  }


  // Get thumbnail URL (from field or extracted from YouTube URL)
  const thumbnailUrl =
    post.thumbnail_url || getYouTubeThumbnail(post.source_link);


  // Parse content for chapters and quotes
  const contentSections = parseContent(post.summary.content);


  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors inline-block"
        >
          ← Back
        </button>


        {/* Article Content */}
        <article className="max-w-2xl mx-auto">
          {/* Title */}
          <header className="mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 leading-tight mb-6">
              {post.title}
            </h1>


            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600 border-b border-gray-200 pb-6">
              <div className="flex flex-col gap-2">
                <p>
                  <span className="font-medium text-gray-900">Podcast:</span>{" "}
                  {post.podcast_name}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Creator:</span>{" "}
                  {post.creator}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:text-right">
                <div className="flex flex-col gap-2 items-end">
                  {post.duration_minutes && (
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">
                        Duration:
                      </span>{" "}
                      {post.duration_minutes} min
                    </p>
                  )}
                  {post.rating && (
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">Rating:</span>{" "}
                      <span className="ml-2 text-yellow-600">
                        {Array(Math.floor(post.rating)).fill("★").join("")}
                        {post.rating % 1 !== 0 ? "½" : ""}
                        {Array(5 - Math.ceil(post.rating))
                          .fill("☆")
                          .join("")}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </header>


          {thumbnailUrl && (
            <div className="mb-12 sm:mb-16 -mx-4 sm:mx-0">
              <img
                src={thumbnailUrl}
                alt={post.title}
                className="w-full h-auto max-h-96 object-cover rounded-lg shadow-md"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}


          {/* Main Topic / Overview */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-4">
              Overview
            </h2>
            <p className="text-lg text-gray-700 leading-8 font-light">
              {post.summary.main_topic}
            </p>
          </section>


          {/* Full Content with Parsed Sections */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6">
              Full Content
            </h2>
            <div className="space-y-6">
              {contentSections.length > 0 ? (
                contentSections.map((section, i) => {
                  if (section.type === "heading") {
                    return (
                      <h3
                        key={i}
                        className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mt-8 mb-4 pt-4"
                      >
                        {section.content}
                      </h3>
                    );
                  } else if (section.type === "quote") {
                    return (
                      <blockquote
                        key={i}
                        className="quote-styled"
                        style={{
                          background: "#f8f9fa",
                          borderLeft: "4px solid #6b7280",
                          padding: "20px 25px",
                          margin: "25px 0",
                          fontStyle: "italic",
                          color: "#1f2937",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "5px",
                            fontSize: "40px",
                            color: "#6b7280",
                            opacity: 0.3,
                            fontFamily: "Georgia, serif",
                          }}
                        >
                          "
                        </div>
                        <p
                          className="text-lg font-light leading-8 mb-3"
                          style={{ paddingLeft: "20px", color: "#1f2937" }}
                        >
                          {section.quoteText}
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{
                            textAlign: "right",
                            marginTop: "15px",
                            color: "#6b7280",
                          }}
                        >
                          — {section.author}
                        </p>
                      </blockquote>
                    );
                  } else {
                    return (
                      <p
                        key={i}
                        className="text-gray-700 leading-8 font-light whitespace-pre-wrap"
                      >
                        {section.content}
                      </p>
                    );
                  }
                })
              ) : (
                <p className="text-gray-700 leading-8 font-light whitespace-pre-wrap">
                  {post.summary.content}
                </p>
              )}
            </div>
          </section>


          {/* Key Takeaways */}
          {post.summary.key_takeaways &&
            post.summary.key_takeaways.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6">
                  Key Takeaways
                </h2>
                <ul className="space-y-4">
                  {post.summary.key_takeaways.map((takeaway, i) => (
                    <li
                      key={i}
                      className="flex gap-4 text-gray-700 leading-7 font-light"
                    >
                      <span className="text-gray-400 font-serif text-xl flex-shrink-0 mt-1">
                        •
                      </span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}


          {/* Actionable Advice */}
          {post.summary.actionable_advice &&
            post.summary.actionable_advice.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6">
                  Actionable Advice
                </h2>
                <ul className="space-y-4">
                  {post.summary.actionable_advice.map((advice, i) => (
                    <li
                      key={i}
                      className="flex gap-4 text-gray-700 leading-7 font-light"
                    >
                      <span className="text-gray-400 font-serif text-xl flex-shrink-0 mt-1">
                        •
                      </span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}


          {/* Resources Mentioned */}
          {post.summary.resources_mentioned &&
            post.summary.resources_mentioned.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6">
                  Resources Mentioned
                </h2>
                <ul className="space-y-2">
                  {post.summary.resources_mentioned.map((resource, i) => (
                    <li
                      key={i}
                      className="text-gray-700 leading-7 font-light flex gap-3"
                    >
                      <span className="text-gray-400">−</span>
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}


          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <section className="mb-12 sm:mb-16">
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}


          {/* Source Link */}
          {post.source_link && (
            <section className="mb-12 sm:mb-16 pt-8 border-t border-gray-200">
              <a
                href={post.source_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors"
              >
                Listen on Source
              </a>
            </section>
          )}


          {/* Delete Section */}
          <section className="pt-8 border-t border-gray-200">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Delete Article
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded">
                <div>
                  <p className="font-medium text-red-900 mb-2">
                    Are you sure you want to delete this article?
                  </p>
                  <p className="text-sm text-red-700">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
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
