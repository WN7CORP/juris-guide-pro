
/**
 * Formats time in seconds to MM:SS format
 * 
 * @param seconds Time in seconds
 * @returns Formatted time as MM:SS
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
