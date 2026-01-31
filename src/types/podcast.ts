export interface Resource {
  title: string;
  link?: string;
}

export interface PodcastSummary {
  keyTakeaways: string[];
  mainTopic: string;
  coreInsights: string[];
  actionableAdvice: string[];
  resourcesMentioned: Resource[];
}

export interface PodcastEntry {
  id: string;
  slug: string; 
  title: string;
  podcastName: string;
  creator: string;
  guestName?: string;
  sourceLink: string;
  createdAt: string;
  publishedAt?: string;
  durationMinutes?: number;
  rating?: number;
  tags: string[];
  yourNotes?: string;
  summary: PodcastSummary;
}

export interface Summary {
  main_topic: string;
  content: string;
  key_takeaways?: string[];
  actionable_advice?: string[];
  resources_mentioned?: string[];
}

export interface PodcastPost {
  id: string;
  slug: string; // ← Add once here
  title: string;
  podcast_name: string;
  creator: string;
  source_link: string;
  tags: string[];
  summary: Summary;
  thumbnail_url?: string;
  duration_minutes?: number;
  rating?: number;
  user_id: string;
  created_at: string;
}
