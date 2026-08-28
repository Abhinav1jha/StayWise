/**
 * Format a number as Indian Rupees (₹).
 */
export function formatRupees(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
