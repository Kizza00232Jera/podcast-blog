import React, { createContext, useContext, useState } from "react";
import { PodcastEntry } from "../types/podcast";
import { samplePodcasts } from "../utils/sampleData";

interface PodcastContextType {
  podcasts: PodcastEntry[];
  addPodcast: (podcast: PodcastEntry) => void;
  deletePodcast: (id: string) => void;
  updatePodcast: (id: string, podcast: PodcastEntry) => void;
  getAllTags: () => { tag: string; count: number }[];
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [podcasts, setPodcasts] = useState<PodcastEntry[]>(samplePodcasts);

  const addPodcast = (podcast: PodcastEntry) => {
    setPodcasts([podcast, ...podcasts]); // New ones on top (by date)
  };

  const deletePodcast = (id: string) => {
    setPodcasts(podcasts.filter((p) => p.id !== id));
  };

  const updatePodcast = (id: string, updatedPodcast: PodcastEntry) => {
    setPodcasts(podcasts.map((p) => (p.id === id ? updatedPodcast : p)));
  };

  // Get all tags with their frequency count
  const getAllTags = (): { tag: string; count: number }[] => {
    const tagCounts: { [key: string]: number } = {};

    podcasts.forEach((podcast) => {
      podcast.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count (descending)
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  };

  return (
    <PodcastContext.Provider
      value={{ podcasts, addPodcast, deletePodcast, updatePodcast, getAllTags }}
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
