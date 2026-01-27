import React, { useState } from "react";
import { AddPodcastModal } from "../Podcast/AddPodcastModal";
import { Link } from "react-router-dom";

export const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          {/* Logo / Title */}
          <Link to="/" className="flex flex-col gap-1 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-serif font-bold text-gray-900">
              PodNotes
            </h1>
            <p className="text-xs text-gray-500 font-light tracking-wide">
              Curated podcast summaries
            </p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/upload"
              className="text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              New
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            +
          </button>

          {/* Desktop Add Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Add Podcast
          </button>
        </div>
      </header>

      <AddPodcastModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};