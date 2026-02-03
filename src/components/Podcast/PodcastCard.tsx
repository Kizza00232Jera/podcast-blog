import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PodcastCardProps {
  podcast: {
    id: string;
    title: string;
    podcast_name: string;
    creator: string;
    guest_name?: string;
    duration_minutes?: number;
    rating?: number;
    summary: {
      main_topic: string;
      key_takeaways?: string[];
      core_insights?: string[];
    };
    your_notes?: string;
    created_at: string;
  };
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  const navigate = useNavigate();

  // Truncate title if too long
  const truncateTitle = (title: string, maxLength = 80) => {
    return title.length > maxLength 
      ? title.substring(0, maxLength) + '...' 
      : title;
  };

  // Generate star rating
  const renderStars = (rating?: number) => {
    return '⭐'.repeat(rating || 0);
  };

  // Format preview text from summary
  const getPreviewText = () => {
    if (podcast.summary.main_topic) {
      return podcast.summary.main_topic;
    }
    if (podcast.summary.key_takeaways && podcast.summary.key_takeaways.length > 0) {
      return podcast.summary.key_takeaways[0];
    }
    return 'No summary available';
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden 
                    transition-all duration-300 hover:-translate-y-1 
                    hover:shadow-xl cursor-pointer">
      
      {/* Article Image - Gradient fallback */}
      <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 
                      relative overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
      </div>

      {/* Card Content */}
      <div className="p-5">
        
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-3 
                       line-clamp-2 leading-snug">
          {truncateTitle(podcast.title)}
        </h3>

        {/* Metadata */}
        <div className="space-y-2 mb-3">
          <p className="text-sm text-gray-600">
            Podcast: {podcast.podcast_name}
          </p>
          <p className="text-sm text-gray-600">
            Creator: {podcast.creator}
            {podcast.guest_name && ` • Guest: ${podcast.guest_name}`}
          </p>
          {podcast.duration_minutes && (
            <p className="text-sm text-gray-600">
              ⏱️ {podcast.duration_minutes} min
            </p>
          )}
        </div>

        {/* Rating */}
        {podcast.rating && (
          <div className="text-yellow-400 mb-3 text-sm">
            {renderStars(podcast.rating)}
          </div>
        )}

        {/* Preview/Summary */}
        <p className="text-sm text-gray-700 leading-relaxed mb-4 
                      line-clamp-3">
          {getPreviewText()}
        </p>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate(`/podcast/${podcast.id}`)}
            className="flex-1 bg-indigo-600 text-white py-2 px-3 
                       rounded-md text-sm font-medium 
                       hover:bg-indigo-700 transition-colors"
          >
            Read Full Article →
          </button>
          
          {podcast.your_notes && (
            <button
              onClick={() => window.open(podcast.your_notes, '_blank')}
              className="flex-1 bg-red-500 text-white py-2 px-3 
                         rounded-md text-sm font-medium 
                         hover:bg-red-600 transition-colors"
            >
              ▶️ YouTube
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default PodcastCard;
