import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ScrollDirection,
  debounce,
  getCurrentScrollY,
  getScrollDirection,
  isElementInViewport,
  throttle,
} from './scrollUtils';

describe('throttle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('invokes the function immediately on the first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignores calls made within the throttle window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('allows another call once the window has elapsed', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    vi.advanceTimersByTime(100);
    throttled();

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('delays invocation until after the wait time', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer on repeated calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('getCurrentScrollY', () => {
  it('returns the current window scroll position', () => {
    Object.defineProperty(window, 'pageYOffset', { value: 240, configurable: true });

    expect(getCurrentScrollY()).toBe(240);

    Object.defineProperty(window, 'pageYOffset', { value: 0, configurable: true });
  });
});

describe('isElementInViewport', () => {
  it('returns true when the element rect is fully within the viewport', () => {
    const element = document.createElement('div');
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      left: 10,
      bottom: 100,
      right: 100,
    } as DOMRect);

    expect(isElementInViewport(element)).toBe(true);
  });

  it('returns false when the element is above the viewport', () => {
    const element = document.createElement('div');
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: -500,
      left: 10,
      bottom: -400,
      right: 100,
    } as DOMRect);

    expect(isElementInViewport(element)).toBe(false);
  });
});

describe('getScrollDirection', () => {
  it('returns DOWN when the scroll position increases', () => {
    expect(getScrollDirection(200, 100)).toBe(ScrollDirection.DOWN);
  });

  it('returns UP when the scroll position decreases', () => {
    expect(getScrollDirection(100, 200)).toBe(ScrollDirection.UP);
  });

  it('returns NONE when the scroll position is unchanged', () => {
    expect(getScrollDirection(150, 150)).toBe(ScrollDirection.NONE);
  });
});
