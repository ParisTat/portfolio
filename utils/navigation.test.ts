import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNavigationItems, handleNavigation, smoothScrollToElement } from './navigation';

describe('smoothScrollToElement', () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    scrollToSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('scrolls to the target element position minus the offset', () => {
    const target = document.createElement('div');
    target.id = 'section';
    document.body.appendChild(target);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 200 } as DOMRect);

    smoothScrollToElement('#section', 80);

    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    const [callArg, secondArg] = scrollToSpy.mock.calls[0] as unknown[];
    if (typeof callArg === 'object' && callArg !== null) {
      expect(callArg).toMatchObject({ top: 120 });
    } else {
      expect(secondArg).toBe(120);
    }
  });

  it('warns and does not scroll when the selector does not match anything', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    smoothScrollToElement('#missing');

    expect(scrollToSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('handleNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('invokes the onNavigate callback immediately, then scrolls after a short delay', () => {
    const onNavigate = vi.fn();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const target = document.createElement('div');
    target.id = 'projects';
    document.body.appendChild(target);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);

    handleNavigation('#projects', onNavigate);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(scrollToSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    scrollToSpy.mockRestore();
  });

  it('works without an onNavigate callback', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const target = document.createElement('div');
    target.id = 'hero';
    document.body.appendChild(target);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);

    expect(() => handleNavigation('#hero')).not.toThrow();
    vi.advanceTimersByTime(100);
    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    scrollToSpy.mockRestore();
  });
});

describe('getNavigationItems', () => {
  it('returns the hero, projects, activity and contact links', () => {
    expect(getNavigationItems()).toEqual([
      { href: '#hero', label: 'Home' },
      { href: '#projects', label: 'Projects' },
      { href: '#activity', label: 'Activity' },
      { href: '#contact', label: 'Contact' },
    ]);
  });
});
