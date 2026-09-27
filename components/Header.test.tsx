import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  document.body.innerHTML = '';
  ['hero', 'projects', 'contact'].forEach((id) => {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  });
});

describe('Header', () => {
  it('renders navigation links for each section', () => {
    render(<Header />);

    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Projects' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Contact' }).length).toBeGreaterThan(0);
  });

  it('toggles the mobile menu open state when the burger button is clicked', () => {
    render(<Header />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the mobile menu when Escape is pressed', () => {
    render(<Header />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('scrolls to the matching section when a desktop nav link is clicked', () => {
    vi.useFakeTimers();
    render(<Header />);

    const scrollToSpy = window.scrollTo as unknown as ReturnType<typeof vi.fn>;
    fireEvent.click(screen.getAllByRole('link', { name: 'Projects' })[0]);
    vi.advanceTimersByTime(150);

    expect(scrollToSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('scrolls to the hero section when the logo is clicked', () => {
    vi.useFakeTimers();
    render(<Header />);

    fireEvent.click(screen.getByRole('link', { name: /devfolio/i }));
    vi.advanceTimersByTime(150);

    expect(window.scrollTo).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('closes the mobile menu and navigates when a mobile-only link is clicked', () => {
    vi.useFakeTimers();
    render(<Header />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const mobileContactLinks = screen.getAllByRole('link', { name: 'Contact' });
    fireEvent.click(mobileContactLinks[mobileContactLinks.length - 1]);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    vi.advanceTimersByTime(150);
    expect(window.scrollTo).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('closes the mobile menu when the backdrop is clicked', () => {
    render(<Header />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const backdrop = screen.getByTestId('mobile-menu-backdrop');
    fireEvent.click(backdrop);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
