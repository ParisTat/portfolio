import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useMobileMenu } from './useMobileMenu';

describe('useMobileMenu', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('starts closed', () => {
    const { result } = renderHook(() => useMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('opens and locks body scroll', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => result.current.openMobileMenu());

    expect(result.current.isMobileMenuOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes and restores body scroll', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => result.current.openMobileMenu());
    act(() => result.current.closeMobileMenu());

    expect(result.current.isMobileMenuOpen).toBe(false);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('toggles the open state', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => result.current.toggleMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(true);

    act(() => result.current.toggleMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('closes when Escape is pressed while open', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => result.current.openMobileMenu());
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('restores body scroll on unmount', () => {
    const { result, unmount } = renderHook(() => useMobileMenu());
    act(() => result.current.openMobileMenu());
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });
});
