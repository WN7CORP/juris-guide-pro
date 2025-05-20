
/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the provided function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): T & { cancel: () => void } {
  let timeout: number | undefined;
  
  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      timeout = undefined;
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };

  // Add cancel method
  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced as T & { cancel: () => void };
}
