import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BackToTop from './BackToTop';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
}

function scrollPageTo(value: number) {
  act(() => {
    setScrollY(value);
    window.dispatchEvent(new Event('scroll'));
  });
}

function mockReducedMotion(isReduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isReduced && query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

// Role queries give aria-hidden elements an empty name, so find the (possibly hidden) button by label.
const getButton = () => screen.getByLabelText('Back to top');

describe('BackToTop', () => {
  beforeEach(() => {
    setScrollY(0);
    mockReducedMotion(false);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is hidden and out of the tab order at the top of the page', () => {
    render(<BackToTop />);

    expect(getButton()).toHaveAttribute('aria-hidden', 'true');
    expect(getButton()).toHaveAttribute('tabindex', '-1');
  });

  it('appears after scrolling down and hides again near the top', () => {
    render(<BackToTop />);

    scrollPageTo(1200);
    expect(screen.getByRole('button', { name: 'Back to top' })).not.toHaveAttribute('aria-hidden', 'true');
    expect(getButton()).toHaveAttribute('tabindex', '0');

    scrollPageTo(100);
    expect(getButton()).toHaveAttribute('aria-hidden', 'true');
  });

  it('is visible on mount when the page loads already scrolled down', () => {
    setScrollY(2000);
    render(<BackToTop />);

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('smoothly scrolls to the top when clicked', async () => {
    const user = userEvent.setup();
    render(<BackToTop />);
    scrollPageTo(1200);

    await user.click(screen.getByRole('button', { name: 'Back to top' }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('jumps without animation when the user prefers reduced motion', async () => {
    mockReducedMotion(true);
    const user = userEvent.setup();
    render(<BackToTop />);
    scrollPageTo(1200);

    await user.click(screen.getByRole('button', { name: 'Back to top' }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });
});
