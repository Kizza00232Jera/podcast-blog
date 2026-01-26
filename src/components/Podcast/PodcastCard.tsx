import React from "react";
import { PodcastEntry } from "../../types/podcast";

interface PodcastCardProps {
  podcast: PodcastEntry;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  const formattedDate = new Date(podcast.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{podcast.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <div>
            <p>
              <span className="font-semibold">{podcast.podcastName}</span> by{" "}
              {podcast.creator}
            </p>
            {podcast.guestName && (
              <p className="text-gray-500">Guest: {podcast.guestName}</p>
            )}
          </div>
          <div className="text-right">
            <p>{formattedDate}</p>
            {podcast.durationMinutes && (
              <p className="text-gray-500">{podcast.durationMinutes} min</p>
            )}
          </div>
        </div>
      </div>

      {/* Rating */}
      {podcast.rating && (
        <div className="mb-4">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i < podcast.rating! ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 space-y-3">
        {/* Key Takeaways */}
        {podcast.summary.keyTakeaways.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">
              Key Takeaways
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {podcast.summary.keyTakeaways.slice(0, 3).map((takeaway, i) => (
                <li key={i} className="text-sm text-gray-700">
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Topic */}
        <div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            Main Topic
          </h4>
          <p className="text-sm text-gray-700">{podcast.summary.mainTopic}</p>
        </div>

        {/* Core Insights Preview (first one) */}
        {podcast.summary.coreInsights.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              Key Insights
            </h4>
            <p className="text-sm text-gray-700 line-clamp-3">
              {podcast.summary.coreInsights[0]}
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {podcast.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <a
          href={podcast.sourceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          View on YouTube →
        </a>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Read Full Summary
        </button>
      </div>
    </article>
  );
};
