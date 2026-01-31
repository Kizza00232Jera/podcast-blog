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

    const searchQuery = `Find and analyze the YouTube video at ${youtubeUrl}${videoTitle ? ` titled "${videoTitle}"` : ''}${videoAuthor ? ` by ${videoAuthor}` : ''}. Get the full transcript, identify chapters or timestamps if available, and extract direct quotes from speakers.`;

    console.log('🤖 Calling Perplexity...');

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
            content: `You are a professional podcast content analyzer. Search for and analyze the specific YouTube video provided.

CRITICAL RULES:
- Return ONLY valid JSON (no markdown code blocks, no explanatory text)
- DO NOT include citation numbers like [1], [2], [3] anywhere in the content
- DO NOT use reference brackets or superscripts
- Write naturally without any citation markers
- Quotes should be on their own lines for proper formatting

REQUIRED JSON FORMAT:
{
  "title": "Engaging, descriptive title with key insight",
  "podcast_name": "Podcast series name or channel name",
  "creator": "Host/Creator name",
  "youtubelink": "${youtubeUrl}",
  "estimateddurationminutes": 30,
  "estimatedreadingtimeminutes": 12,
  "summary": {
    "main_topic": "1-2 sentence core topic description",
    "content": "[FULL MARKDOWN FORMATTED ARTICLE]",
    "key_takeaways": ["7 specific insights with details"],
    "actionable_advice": ["5-7 practical tips starting with action verbs"],
    "resources_mentioned": ["Resource Name -- Brief description"]
  }
}

CRITICAL FORMATTING RULES FOR "content" FIELD:

⚠️ ABSOLUTE RULE: NO CITATION NUMBERS [1], [2], [3] - Never use reference numbers anywhere in text

1. MARKDOWN STRUCTURE:
   - Section headers: ## Section Title (use ## NOT #)
   - Bold: **text**
   - Paragraphs: \\n\\n (double newline between paragraphs)
   - Each section: 200-400 words

2. QUOTE FORMAT (MANDATORY):
   - Pattern: "Quote text from speaker." --- Speaker Name
   - Always include em-dash (---) before speaker attribution
   - Include 2-3 quotes per section minimum
   - Quotes must be on their own line, separated from paragraphs
   - Place blank lines before and after quotes

   CORRECT FORMAT:
   Context paragraph here.
   
   "This is a quote from the video." --- Speaker Name
   
   Analysis paragraph here.

3. SECTION STRUCTURE (4-6 sections):
   - ## Opening Hook (Main topic introduction)
   - ## Key Discussion Point 1
   - ## Key Discussion Point 2
   - ## Key Discussion Point 3
   - ## Notable Insights (Standout moments)
   - ## Conclusion (Summary and implications)

4. PARAGRAPH FLOW PATTERN:
   [Context paragraph introducing the topic - NO CITATIONS]
   
   "Direct quote from transcript that supports the point." --- Speaker Name
   
   [Analysis paragraph explaining significance - NO CITATIONS]

5. CONTENT REQUIREMENTS:
   - Professional but conversational tone
   - Specific details: names, numbers, statistics, examples
   - If video has chapters/timestamps, summarize each
   - Connect ideas logically between sections
   - NO citation numbers [1][2][3] anywhere
   - NO reference brackets of any kind
   - NO generic statements - be specific
   - Write as a flowing article without academic citations

6. KEY TAKEAWAYS FORMAT:
   - 1-2 sentence statements
   - Include specific details (names, numbers, concepts)
   - Focus on learnable insights
   - NO citation numbers
   - Example: "PARIVISION's clinical 3-0 sweep and tournament-wide consistency (dropping only one map) showcased dominant performance"

7. ACTIONABLE ADVICE FORMAT:
   - Start with action verbs: Study, Analyze, Watch, Review, etc.
   - Specific and implementable
   - 1-2 sentences each
   - Example: "Study PARIVISION's map control strategies on Inferno for insights into modern defensive systems"

8. RESOURCES FORMAT:
   - "Resource Name -- Brief contextual description"
   - Example: "BLAST Premier Bounty 2026 -- Official Tournament held in Malta"

EXAMPLE SECTION WITH PROPER QUOTE FORMATTING:

## The Core Challenge

Brian Cox and a panel of neuroscience experts gathered to tackle one of science's most elusive questions: what is consciousness? The discussion brought together perspectives from cognitive neuroscience, psychiatry, and philosophy to explore how subjective experience emerges from physical brain processes.

"For a conscious organism, there is something it is like to be that organism. It feels like something to be me, feels like something to be you." --- Anil Seth

This definition, borrowed from philosopher Thomas Nagel, sets the foundation for understanding consciousness as fundamentally about subjective experience. The challenge lies in bridging the gap between objective brain measurements and the felt quality of experience.

"It's really in this most basic sense as the fundamental felt experience that we know comes into being in the universe from our own experience." --- Panel Discussion

The panelists explored how modern neuroscience attempts to measure and quantify something inherently subjective, creating fascinating tensions between scientific methodology and phenomenological experience.

VALIDATION CHECKLIST:
✅ Content has 4-6 ## sections
✅ Each section has 2-3 properly formatted quotes
✅ Quotes use "text" --- Speaker Name format
✅ Quotes are on separate lines with blank lines before/after
✅ Paragraphs separated by \\n\\n
✅ NO citation numbers [1][2][3] anywhere
✅ 5-7 specific key takeaways
✅ 5-7 actionable advice items
✅ Resources include context
✅ NO # (h1) headers, only ## (h2)
✅ Professional tone throughout
✅ Specific details, not generic statements
✅ Natural writing without reference markers`
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

    let podcastData;
    try {
      // Clean the response - remove any markdown formatting or extra text
      const cleanContent = generatedContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^[^{]*/, '') // Remove text before first {
        .replace(/[^}]*$/, '') // Remove text after last }
        .trim();
      
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
        throw new Error('Invalid response - missing content');
      }

      // Validation warnings
      if (!podcastData.summary.content.includes('##')) {
        console.warn('⚠️ Content missing section headers');
      }
      if (!podcastData.summary.content.includes('---')) {
        console.warn('⚠️ Content missing quotes');
      }
      if (!Array.isArray(podcastData.summary.key_takeaways) || podcastData.summary.key_takeaways.length < 5) {
        console.warn('⚠️ Insufficient key takeaways');
      }

      // Remove any remaining citation numbers from content as fallback
      if (podcastData.summary.content) {
        podcastData.summary.content = podcastData.summary.content.replace(/\[\d+\]/g, '');
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
    console.log('📊 Content length:', podcastData.summary.content.length);
    console.log('📊 Takeaways:', podcastData.summary.key_takeaways?.length || 0);
    console.log('📊 Advice items:', podcastData.summary.actionable_advice?.length || 0);

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
