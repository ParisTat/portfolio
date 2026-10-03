import React, { useEffect, useState } from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';

// Roughly one screen below the hero, so the button never shows on first view.
const SHOW_AFTER_PX = 600;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > SHOW_AFTER_PX);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const visibilityClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-4 invisible pointer-events-none';

  // While hidden it stays mounted (for the fade) but is removed from the tab order and a11y tree.
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-[opacity,translate,visibility,background-color,box-shadow] duration-300 motion-reduce:transition-none ${visibilityClasses}`}
    >
      <ArrowUpIcon aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
