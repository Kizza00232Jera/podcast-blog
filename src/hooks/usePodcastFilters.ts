import { useState, useMemo } from "react";
import { PodcastEntry } from "../types/podcast";

export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  sortBy: "date-newest" | "date-oldest" | "rating-high" | "rating-low" | "duration-long" | "duration-short";
}

export const usePodcastFilters = (podcasts: PodcastEntry[]) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedTags: [],
    sortBy: "date-newest",
  });

  // Get all unique tags from podcasts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    podcasts.forEach((podcast) => {
      podcast.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [podcasts]);

  // Filter and sort podcasts
  const filteredPodcasts = useMemo(() => {
    let result = [...podcasts];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(query) ||
          podcast.creator.toLowerCase().includes(query) ||
          podcast.podcastName.toLowerCase().includes(query) ||
          (podcast.guestName?.toLowerCase().includes(query) ?? false)
      );
    }

    // Tag filter
    if (filters.selectedTags.length > 0) {
      result = result.filter((podcast) =>
        filters.selectedTags.some((tag) => podcast.tags.includes(tag))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "date-newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "rating-high":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "rating-low":
          return (a.rating ?? 0) - (b.rating ?? 0);
        case "duration-long":
          return (b.durationMinutes ?? 0) - (a.durationMinutes ?? 0);
        case "duration-short":
          return (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [podcasts, filters]);

  const updateSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const setSortBy = (sortBy: FilterState["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      selectedTags: [],
      sortBy: "date-newest",
    });
  };

  return {
    filters,
    filteredPodcasts,
    allTags,
    updateSearchQuery,
    toggleTag,
    setSortBy,
    clearFilters,
  };
};
