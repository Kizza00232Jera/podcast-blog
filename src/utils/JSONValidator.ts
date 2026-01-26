import { PodcastEntry } from "../types/podcast";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: PodcastEntry;
}

/**
 * Validates if a podcast object has all required fields
 */
export const validatePodcastData = (
  data: unknown
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: [{ field: "root", message: "Data must be a valid JSON object" }],
    };
  }

  const podcast = data as Record<string, unknown>;

  // Required fields
  if (!podcast.title || typeof podcast.title !== "string") {
    errors.push({ field: "title", message: "Title is required and must be a string" });
  }

  if (!podcast.podcastName || typeof podcast.podcastName !== "string") {
    errors.push({ field: "podcastName", message: "Podcast name is required and must be a string" });
  }

  if (!podcast.creator || typeof podcast.creator !== "string") {
    errors.push({ field: "creator", message: "Creator is required and must be a string" });
  }

  if (!podcast.sourceLink || typeof podcast.sourceLink !== "string") {
    errors.push({ field: "sourceLink", message: "Source link is required and must be a string" });
  }

  // Tags validation (required, must have at least 1)
  if (!Array.isArray(podcast.tags) || podcast.tags.length === 0) {
    errors.push({ field: "tags", message: "At least 1 tag is required" });
  } else if (!podcast.tags.every((tag) => typeof tag === "string")) {
    errors.push({ field: "tags", message: "All tags must be strings" });
  }

  // Summary validation
  if (!podcast.summary || typeof podcast.summary !== "object") {
    errors.push({ field: "summary", message: "Summary is required and must be an object" });
  } else {
    const summary = podcast.summary as Record<string, unknown>;

    if (!Array.isArray(summary.keyTakeaways)) {
      errors.push({ field: "summary.keyTakeaways", message: "Key takeaways must be an array" });
    }

    if (!summary.mainTopic || typeof summary.mainTopic !== "string") {
      errors.push({ field: "summary.mainTopic", message: "Main topic is required and must be a string" });
    }

    if (!Array.isArray(summary.coreInsights)) {
      errors.push({ field: "summary.coreInsights", message: "Core insights must be an array" });
    }

    if (!Array.isArray(summary.actionableAdvice)) {
      errors.push({ field: "summary.actionableAdvice", message: "Actionable advice must be an array" });
    }

    if (!Array.isArray(summary.resourcesMentioned)) {
      errors.push({ field: "summary.resourcesMentioned", message: "Resources mentioned must be an array" });
    }
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // All validations passed
  return {
    isValid: true,
    errors: [],
    data: podcast as unknown as PodcastEntry,

  };
};

/**
 * Parses JSON string and validates it
 */
export const parseAndValidateJSON = (jsonString: string): ValidationResult => {
  try {
    const parsed = JSON.parse(jsonString);
    return validatePodcastData(parsed);
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          field: "json",
          message: `Invalid JSON format: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
};
