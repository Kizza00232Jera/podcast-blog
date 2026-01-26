import React from "react";
import { FilterState } from "../../hooks/usePodcastFilters";

interface PodcastFiltersProps {
  filters: FilterState;
  allTags: string[];
  onSearchChange: (query: string) => void;
  onTagToggle: (tag: string) => void;
  onSortChange: (sortBy: FilterState["sortBy"]) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export const PodcastFilters: React.FC<PodcastFiltersProps> = ({
  filters,
  allTags,
  onSearchChange,
  onTagToggle,
  onSortChange,
  onClearFilters,
  resultCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery || filters.selectedTags.length > 0 || filters.sortBy !== "date-newest";

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="🔍 Search by title, creator, podcast name..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Sort:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value as FilterState["sortBy"])}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="date-newest">Newest First</option>
              <option value="date-oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="duration-long">Longest Duration</option>
              <option value="duration-short">Shortest Duration</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {resultCount} {resultCount === 1 ? "podcast" : "podcasts"}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Filter by tags:</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    filters.selectedTags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {filters.selectedTags.length > 0 && (
          <div className="text-sm text-gray-600">
            Active tags: {filters.selectedTags.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};
