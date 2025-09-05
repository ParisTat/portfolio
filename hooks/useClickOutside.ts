import { useEffect, useRef } from 'react';

/**
 * Custom hook that handles clicks outside of a referenced element
 * @param callback Function to call when clicking outside
 * @returns React ref to attach to the element
 */
export const useClickOutside = <T extends HTMLElement>(
  callback: () => void
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
};
