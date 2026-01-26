import React, { useState } from "react";
import { AddPodcastModal } from "../Podcast/AddPodcastModal";

export const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🎙️ Podcast Blog
            </h1>
            <p className="text-sm text-gray-500">
              Your personal podcast summary library
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Podcast
          </button>
        </div>
      </header>

      <AddPodcastModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
