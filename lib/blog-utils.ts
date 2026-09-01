/**
 * Blog & Article Utility Functions
 * Clean Code Principle: Pure functions with predictable output & robust fallbacks.
 */

/**
 * Calculates estimated reading time in Indonesian format.
 * Average reading speed: 200 words per minute.
 */
export function calculateReadTime(content: string): string {
  if (!content) return '2 mnt baca';
  const cleanText = content.replace(/<[^>]+>/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} mnt baca`;
}

/**
 * Extracts a clean plain-text excerpt from raw HTML content.
 */
export function extractExcerpt(content: string, maxLength = 140): string {
  if (!content) return '';
  const cleanText = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length <= maxLength) return cleanText;
  
  // Cut at closest word boundary
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Formats date into standard Indonesian locale.
 */
export function formatIndonesianDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Categorizes an article based on its topic or title keywords.
 */
export function inferArticleCategory(article: { topic?: string | null; title?: string }): string {
  if (article.topic && article.topic.trim()) {
    return article.topic.split(',')[0].trim();
  }

  const titleLower = (article.title || '').toLowerCase();
  if (titleLower.includes('gula') || titleLower.includes('diabetes') || titleLower.includes('insulin')) {
    return 'Gula Darah & Nutrisi';
  }
  if (titleLower.includes('urat') || titleLower.includes('sendi') || titleLower.includes('rematik')) {
    return 'Kesehatan Sendi';
  }
  if (titleLower.includes('herbal') || titleLower.includes('ekstrak') || titleLower.includes('jamu')) {
    return 'Edukasi Herbal';
  }
  if (titleLower.includes('lambung') || titleLower.includes('maag') || titleLower.includes('gerd')) {
    return 'Kesehatan Pencernaan';
  }
  if (titleLower.includes('jantung') || titleLower.includes('kolesterol') || titleLower.includes('tensi')) {
    return 'Kardiovaskular';
  }

  return 'Edukasi Herbal';
}
