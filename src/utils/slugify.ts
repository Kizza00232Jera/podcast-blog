export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Generate slug with short ID for URL
export const generateUrlSlug = (title: string, id: string): string => {
  const slug = slugify(title);
  const shortId = id.substring(0, 8); // Use first 8 chars of UUID
  return `${slug}-${shortId}`;
};

// Extract FULL UUID from slug by searching database
// This returns the SHORT ID which you'll use to query: id LIKE 'shortId%'
export const extractIdFromSlug = (slug: string): string => {
  const parts = slug.split('-');
  const shortId = parts[parts.length - 1]; // Get last part (8 chars)
  return shortId; // Return SHORT ID for pattern matching
};
