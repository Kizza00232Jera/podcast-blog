import React, { createContext, useContext, useState, useEffect } from "react";
import { PodcastEntry } from "../types/podcast";
import { supabase } from "../lib/supabase";

interface PodcastContextType {
  podcasts: PodcastEntry[];
  addPodcast: (podcast: PodcastEntry) => Promise<void>;
  deletePodcast: (id: string) => Promise<void>;
  updatePodcast: (id: string, podcast: Partial<PodcastEntry>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [podcasts, setPodcasts] = useState<PodcastEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch podcasts from Supabase on mount
  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("podcasts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Transform database rows to PodcastEntry format
      const transformedPodcasts = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        podcastName: row.podcast_name,
        creator: row.creator,
        guestName: row.guest_name,
        sourceLink: row.source_link,
        createdAt: row.created_at,
        publishedAt: row.published_at,
        durationMinutes: row.duration_minutes,
        rating: row.rating,
        tags: row.tags,
        yourNotes: row.your_notes,
        summary: row.summary,
      }));

      setPodcasts(transformedPodcasts);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch podcasts";
      setError(message);
      console.error("Error fetching podcasts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addPodcast = async (podcast: PodcastEntry) => {
    try {
      setError(null);

      const { error: insertError } = await supabase.from("podcasts").insert([
        {
          id: podcast.id,
          title: podcast.title,
          podcast_name: podcast.podcastName,
          creator: podcast.creator,
          guest_name: podcast.guestName || null,
          source_link: podcast.sourceLink,
          created_at: podcast.createdAt,
          published_at: podcast.publishedAt || null,
          duration_minutes: podcast.durationMinutes || null,
          rating: podcast.rating || null,
          tags: podcast.tags,
          your_notes: podcast.yourNotes || null,
          summary: podcast.summary,
        },
      ]);

      if (insertError) throw insertError;

      // Add to local state
      setPodcasts((prev) => [podcast, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add podcast";
      setError(message);
      console.error("Error adding podcast:", err);
      throw err;
    }
  };

  const deletePodcast = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from("podcasts")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setPodcasts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete podcast";
      setError(message);
      console.error("Error deleting podcast:", err);
      throw err;
    }
  };

  const updatePodcast = async (id: string, updates: Partial<PodcastEntry>) => {
    try {
      setError(null);

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.podcastName) updateData.podcast_name = updates.podcastName;
      if (updates.creator) updateData.creator = updates.creator;
      if (updates.guestName !== undefined) updateData.guest_name = updates.guestName;
      if (updates.sourceLink) updateData.source_link = updates.sourceLink;
      if (updates.durationMinutes !== undefined)
        updateData.duration_minutes = updates.durationMinutes;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.yourNotes !== undefined) updateData.your_notes = updates.yourNotes;
      if (updates.summary) updateData.summary = updates.summary;
      if (updates.publishedAt) updateData.published_at = updates.publishedAt;

      const { error: updateError } = await supabase
        .from("podcasts")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      // Update local state
      setPodcasts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update podcast";
      setError(message);
      console.error("Error updating podcast:", err);
      throw err;
    }
  };

  return (
    <PodcastContext.Provider
      value={{
        podcasts,
        addPodcast,
        deletePodcast,
        updatePodcast,
        isLoading,
        error,
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcasts = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error("usePodcasts must be used within PodcastProvider");
  }
  return context;
};
