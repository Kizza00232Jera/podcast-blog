import React, { useState } from "react";
import { usePodcasts } from "../../context/PodcastContext";
import { PodcastCard } from "./PodcastCard";
import { Sidebar } from "../Layout/Sidebar";

export const PodcastList: React.FC = () => {
  const { podcasts } = usePodcasts();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter podcasts by selected tag
  const filteredPodcasts = selectedTag
    ? podcasts.filter((p) => p.tags.includes(selectedTag))
    : podcasts;

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <Sidebar onTagSelect={setSelectedTag} selectedTag={selectedTag} />

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedTag ? `Podcasts tagged: ${selectedTag}` : "All Podcasts"}
          </h2>
          <p className="text-gray-600">
            {filteredPodcasts.length}{" "}
            {filteredPodcasts.length === 1 ? "podcast" : "podcasts"}
          </p>
        </div>

        {filteredPodcasts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No podcasts found. Start by adding one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {filteredPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
