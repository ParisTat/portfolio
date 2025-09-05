/**
 * Smoothly scrolls to a target element by selector
 * @param selector CSS selector for the target element
 * @param offset Optional offset from the top (default: 0)
 */
export const smoothScrollToElement = (selector: string, offset: number = 0): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element with selector "${selector}" not found`);
      return;
    }

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    // Use modern smooth scrolling if supported
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback for older browsers
      window.scrollTo(0, offsetPosition);
    }
  } catch (error) {
    console.error('Error during smooth scroll:', error);
    // Fallback: try to scroll to top if selector fails
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

/**
 * Navigation handler for header links
 * @param href The target selector (e.g., '#hero', '#projects')
 * @param onNavigate Optional callback to execute after navigation (e.g., close mobile menu)
 */
export const handleNavigation = (href: string, onNavigate?: () => void): void => {
  // Execute callback first (e.g., close mobile menu)
  if (onNavigate) {
    onNavigate();
  }

  // Small delay to allow menu close animation to start
  setTimeout(() => {
    smoothScrollToElement(href, 80); // 80px offset for fixed header
  }, 100);
};

/**
 * Get navigation items configuration
 */
export const getNavigationItems = () => [
  { href: '#hero', label: 'Home' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' }
];
