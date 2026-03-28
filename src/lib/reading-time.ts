// Hebrew reading speed: approximately 200 words per minute
const HEBREW_WORDS_PER_MINUTE = 200;

export function calculateReadingTime(text: string): number {
  if (!text) return 0;

  // Count words by splitting on whitespace
  const words = text.trim().split(/\s+/).length;

  // Calculate minutes and round up
  return Math.ceil(words / HEBREW_WORDS_PER_MINUTE);
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 0) return "פחות מדקה";
  if (minutes === 1) return "דקה";
  return `${minutes} דקות`;
}

export function getReadingTimeLabel(text: string): string {
  const minutes = calculateReadingTime(text);
  return formatReadingTime(minutes);
}
