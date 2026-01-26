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
