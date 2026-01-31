import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface PodcastRequest {
  youtubeUrl: string;
  videoTitle?: string;
  videoAuthor?: string;
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { youtubeUrl, videoTitle, videoAuthor }: PodcastRequest = await req.json();

    if (!youtubeUrl) {
      return new Response(
        JSON.stringify({ error: 'YouTube URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📺 Processing:', youtubeUrl);
    console.log('📝 Title:', videoTitle);
    console.log('👤 Author:', videoAuthor);

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // Build the search query with specific video details
    const searchQuery = `Find and analyze the YouTube video at ${youtubeUrl}${videoTitle ? ` titled "${videoTitle}"` : ''}${videoAuthor ? ` by ${videoAuthor}` : ''}. Get the full transcript and video details.`;

    console.log('🤖 Calling Perplexity with search query...');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a podcast content analyzer. Search for and analyze the specific YouTube video provided.

Return ONLY valid JSON (no markdown code blocks, no explanatory text) in this exact format:
{
  "title": "descriptive title",
  "podcast_name": "channel or series name",
  "creator": "creator name",
  "youtubelink": "${youtubeUrl}",
  "estimateddurationminutes": 30,
  "estimatedreadingtimeminutes": 10,
  "summary": {
    "main_topic": "1-2 sentence description",
    "content": "Create 4-6 sections with ## headers. Each section 200-400 words. Include direct quotes from the video using format: \\"quote\\" --- Speaker Name",
    "key_takeaways": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5", "insight 6", "insight 7"],
    "actionable_advice": ["advice 1", "advice 2", "advice 3", "advice 4", "advice 5"],
    "resources_mentioned": ["resource 1", "resource 2", "resource 3", "resource 4", "resource 5"]
  }
}`
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze video', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('✅ Got response from Perplexity');
    console.log('Raw content:', generatedContent.substring(0, 500));

    let podcastData;
    try {
      // Clean the response
      const cleanContent = generatedContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^[^{]*/, '') // Remove any text before first {
        .replace(/[^}]*$/, '') // Remove any text after last }
        .trim();
      
      console.log('Cleaned content:', cleanContent.substring(0, 300));
      
      podcastData = JSON.parse(cleanContent);

      // Force correct metadata
      podcastData.youtubelink = youtubeUrl;
      if (videoTitle) podcastData.title = videoTitle;
      if (videoAuthor) {
        podcastData.creator = videoAuthor;
        podcastData.podcast_name = videoAuthor;
      }

      // Validate structure
      if (!podcastData.summary?.content) {
        throw new Error('Invalid response structure - missing content');
      }

    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      console.error('Full content:', generatedContent);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response',
          details: parseError.message,
          rawContent: generatedContent.substring(0, 1000)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Successfully generated:', podcastData.title);

    return new Response(
      JSON.stringify(podcastData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
