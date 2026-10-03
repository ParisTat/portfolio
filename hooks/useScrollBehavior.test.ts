import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScrollBehavior } from './useScrollBehavior';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
}

describe('useScrollBehavior', () => {
  afterEach(() => {
    setScrollY(0);
  });

  it('starts not scrolled and visible', () => {
    const { result } = renderHook(() => useScrollBehavior());
    expect(result.current.isScrolled).toBe(false);
    expect(result.current.isVisible).toBe(true);
  });

  it('marks scrolled once past the threshold', () => {
    const { result } = renderHook(() => useScrollBehavior());

    act(() => {
      setScrollY(50);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isScrolled).toBe(true);
  });

  it('hides the header when scrolling down past 100px', () => {
    const { result } = renderHook(() => useScrollBehavior());

    act(() => {
      setScrollY(150);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('shows the header again when scrolling back up', () => {
    const { result } = renderHook(() => useScrollBehavior());

    act(() => {
      setScrollY(150);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isVisible).toBe(false);

    act(() => {
      setScrollY(50);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('removes the scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollBehavior());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeSpy.mockRestore();
  });
});
