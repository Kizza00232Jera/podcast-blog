import React from "react";
import { usePodcasts } from "../context/PodcastContext";
import { usePodcastFilters } from "../hooks/usePodcastFilters";
import { PodcastFilters } from "../components/Podcast/PodcastFilters";
import { PodcastCard } from "../components/Podcast/PodcastCard";

export const Home: React.FC = () => {
  const { podcasts } = usePodcasts();
  const {
    filters,
    filteredPodcasts,
    allTags,
    updateSearchQuery,
    toggleTag,
    setSortBy,
    clearFilters,
  } = usePodcastFilters(podcasts);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Filters */}
      <PodcastFilters
        filters={filters}
        allTags={allTags}
        onSearchChange={updateSearchQuery}
        onTagToggle={toggleTag}
        onSortChange={setSortBy}
        onClearFilters={clearFilters}
        resultCount={filteredPodcasts.length}
      />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPodcasts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No podcasts found
            </h3>
            <p className="text-gray-600">
              {podcasts.length === 0
                ? "Add your first podcast to get started!"
                : "Try adjusting your filters or search query."}
            </p>
            {filters.searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                Searching for: <strong>"{filters.searchQuery}"</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
