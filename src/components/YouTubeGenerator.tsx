import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface PodcastSummary {
  main_topic: string;
  content: string;
  key_takeaways: string[];
  actionable_advice: string[];
  resources_mentioned: string[];
}

interface PodcastData {
  title: string;
  podcast_name: string;
  creator: string;
  youtubelink: string;
  estimateddurationminutes: number;
  estimatedreadingtimeminutes: number;
  summary: PodcastSummary;
}

export const YouTubeGenerator: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PodcastData | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      console.log('🚀 Calling Edge Function with URL:', youtubeUrl);

      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('generate-podcast', {
        body: { youtubeUrl },
      });

      console.log('📦 Response:', data);

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setPreview(data);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    try {
      const { error: saveError } = await supabase
        .from('podcasts')
        .insert([preview]);

      if (saveError) {
        console.error('Save error:', saveError);
        throw saveError;
      }

      alert('✅ Podcast saved successfully!');
      setYoutubeUrl('');
      setPreview(null);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save podcast');
    }
  };

  const updatePreview = (field: keyof PodcastData, value: any) => {
    if (!preview) return;
    setPreview({ ...preview, [field]: value });
  };

  const updateSummaryField = (field: keyof PodcastSummary, value: any) => {
    if (!preview) return;
    setPreview({
      ...preview,
      summary: { ...preview.summary, [field]: value }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-2">Generate Podcast from YouTube</h2>
      <p className="text-gray-600 mb-6">
        Paste a YouTube podcast URL and AI will automatically extract the full structured summary with quotes, analysis, and key takeaways.
      </p>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !youtubeUrl.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors text-lg"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ⏱️ Processing takes 45-90 seconds due to rich content generation. Please be patient!
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Analyzing podcast with AI...</p>
          <p className="text-gray-600 text-sm mt-2">Extracting quotes, creating sections, generating insights...</p>
          <p className="text-gray-500 text-xs mt-1">This usually takes 45-90 seconds</p>
        </div>
      )}

      {/* Preview Section */}
      {preview && !loading && (
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2">
            <h3 className="text-2xl font-bold text-gray-800">Preview & Edit</h3>
            <span className="text-xs text-gray-500 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
              ✏️ All fields editable
            </span>
          </div>

          <div className="space-y-6">
            {/* Basic Info Section */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-3 text-lg">📝 Basic Information</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={preview.title}
                    onChange={(e) => updatePreview('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Podcast Name
                    </label>
                    <input
                      type="text"
                      value={preview.podcast_name}
                      onChange={(e) => updatePreview('podcast_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Creator/Host <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={preview.creator}
                      onChange={(e) => updatePreview('creator', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={preview.estimateddurationminutes}
                      onChange={(e) => updatePreview('estimateddurationminutes', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reading Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={preview.estimatedreadingtimeminutes}
                      onChange={(e) => updatePreview('estimatedreadingtimeminutes', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-3 text-lg">📋 Summary</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Topic <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={preview.summary.main_topic}
                    onChange={(e) => updateSummaryField('main_topic', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content (Markdown with ## sections and quotes) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={preview.summary.content}
                    onChange={(e) => updateSummaryField('content', e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder={'## Section Title\n\nContent here...\n\n"Quote here." --- Speaker Name'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {preview.summary.content.length} characters • Contains quotes with "---" format
                  </p>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-3 text-lg">💡 Key Takeaways</h4>
              <textarea
                value={preview.summary.key_takeaways.join('\n')}
                onChange={(e) => updateSummaryField('key_takeaways', e.target.value.split('\n').filter(Boolean))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="One takeaway per line"
              />
              <p className="text-xs text-gray-500 mt-1">
                {preview.summary.key_takeaways.length} takeaways (one per line)
              </p>
            </div>

            {/* Actionable Advice */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-3 text-lg">🎯 Actionable Advice</h4>
              <textarea
                value={preview.summary.actionable_advice.join('\n')}
                onChange={(e) => updateSummaryField('actionable_advice', e.target.value.split('\n').filter(Boolean))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="One action item per line"
              />
              <p className="text-xs text-gray-500 mt-1">
                {preview.summary.actionable_advice.length} action items (one per line)
              </p>
            </div>

            {/* Resources */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-3 text-lg">📚 Resources Mentioned</h4>
              <textarea
                value={preview.summary.resources_mentioned.join('\n')}
                onChange={(e) => updateSummaryField('resources_mentioned', e.target.value.split('\n').filter(Boolean))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Resource Name -- Brief description (one per line)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {preview.summary.resources_mentioned.length} resources (one per line)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t-2">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                <span>✓</span>
                Save to Database
              </button>
              <button
                onClick={() => {
                  setPreview(null);
                  setYoutubeUrl('');
                }}
                className="px-6 py-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
