/**
 * Utility functions for scroll-related operations
 */

/**
 * Throttle function to limit the frequency of function calls
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Debounce function to delay function execution
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Get current scroll position safely
 * @returns Current scroll Y position or 0 if not in browser
 */
export const getCurrentScrollY = (): number => {
  if (typeof window === 'undefined') return 0;
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Check if an element is in viewport
 * @param element HTML element to check
 * @param offset Optional offset for the check
 * @returns Boolean indicating if element is in viewport
 */
export const isElementInViewport = (element: HTMLElement, offset: number = 0): boolean => {
  if (typeof window === 'undefined') return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
};

/**
 * Scroll direction detection
 */
export enum ScrollDirection {
  UP = 'up',
  DOWN = 'down',
  NONE = 'none'
}

/**
 * Get scroll direction based on current and previous scroll positions
 * @param currentScrollY Current scroll position
 * @param previousScrollY Previous scroll position
 * @returns Scroll direction
 */
export const getScrollDirection = (
  currentScrollY: number,
  previousScrollY: number
): ScrollDirection => {
  if (currentScrollY > previousScrollY) {
    return ScrollDirection.DOWN;
  } else if (currentScrollY < previousScrollY) {
    return ScrollDirection.UP;
  }
  return ScrollDirection.NONE;
};
