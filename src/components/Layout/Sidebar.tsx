import React from "react";
import { usePodcasts } from "../../context/PodcastContext";

interface SidebarProps {
  onTagSelect: (tag: string | null) => void;
  selectedTag: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onTagSelect,
  selectedTag,
}) => {
  const { getAllTags } = usePodcasts();
  const tags = getAllTags();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6 sticky top-20 h-fit">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Tags</h2>

      {tags.length === 0 ? (
        <p className="text-sm text-gray-500">No tags yet</p>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => onTagSelect(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition ${
              selectedTag === null
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Podcasts ({tags.reduce((sum, t) => sum + t.count, 0)})
          </button>

          {tags.map((tagObj) => (
            <button
              key={tagObj.tag}
              onClick={() => onTagSelect(tagObj.tag)}
              className={`w-full text-left px-3 py-2 rounded-lg transition text-sm flex justify-between items-center ${
                selectedTag === tagObj.tag
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{tagObj.tag}</span>
              <span className="text-xs bg-gray-300 rounded-full px-2 py-1">
                {tagObj.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};
