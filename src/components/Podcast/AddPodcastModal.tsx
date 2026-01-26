import React, { useState } from "react";
import { usePodcasts } from "../../context/PodcastContext";
import { parseAndValidateJSON } from "../../utils/JSONValidator";
import { PodcastEntry } from "../../types/podcast";

interface AddPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPodcastModal: React.FC<AddPodcastModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addPodcast } = usePodcasts();
  const [jsonInput, setJsonInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPodcast = () => {
    setErrors([]);
    setIsLoading(true);

    // Parse and validate JSON
    const validation = parseAndValidateJSON(jsonInput);

    if (!validation.isValid) {
      setErrors(validation.errors.map((e) => `${e.field}: ${e.message}`));
      setIsLoading(false);
      return;
    }

    // Create podcast entry with generated fields
    const newPodcast: PodcastEntry = {
      ...validation.data!,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    // Add to app
    addPodcast(newPodcast);

    // Reset and close
    setJsonInput("");
    setErrors([]);
    setIsLoading(false);
    onClose();
  };

  const generateId = (): string => {
  // Generate a proper UUID v4 format
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};


  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add Podcast</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📋 Paste your podcast JSON here
              </h3>
              <p className="text-sm text-blue-800">
                Copy the JSON summary from the chat and paste it below. Make sure it includes:
                title, podcastName, creator, sourceLink, tags (minimum 1), and summary.
              </p>
            </div>

            {/* JSON Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Podcast JSON
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'{\n  "title": "...",\n  "podcastName": "...",\n  ...'}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Validation Errors:</h4>
                <ul className="space-y-1">
                  {errors.map((error, i) => (
                    <li key={i} className="text-sm text-red-800">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Message */}
            {jsonInput && errors.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ JSON looks valid! Click "Add Podcast" to save.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPodcast}
              disabled={isLoading || !jsonInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition font-medium"
            >
              {isLoading ? "Adding..." : "Add Podcast"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
