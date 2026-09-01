import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Strips dangerous scripts while preserving safe formatting tags.
 *
 * @param html - Raw HTML string from database (e.g., Tiptap content)
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    // Allowed tags for rich text content
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'strong', 'em', 'b', 'i', 'u', 's',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
    ],
    // Allowed attributes
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'id',
      'width', 'height',
    ],
    // Force all links to open in new tab safely
    ADD_ATTR: ['target'],
    // Allow data URIs only for images (if needed)
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize and configure external links.
 * Adds rel="noopener noreferrer" and target="_blank" to external links.
 */
export function sanitizeHTMLWithSafeLinks(html: string): string {
  const sanitized = sanitizeHTML(html);

  // Add safety attributes to all links
  return sanitized.replace(
    /<a\s+href="(https?:\/\/[^"]+)"/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
}
