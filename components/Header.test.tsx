import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    render(<Header hasActivity />);

    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Projects' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Contact' }).length).toBeGreaterThan(0);
  });

  it('shows the Activity link in the desktop and mobile navs when activity is available', () => {
    render(<Header hasActivity />);

    const desktopNav = screen.getByRole('navigation', { name: 'Main' });
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });

    expect(within(desktopNav).getByRole('link', { name: 'Activity' })).toHaveAttribute('href', '#activity');
    expect(within(mobileNav).getByRole('link', { name: 'Activity' })).toHaveAttribute('href', '#activity');
  });

  it('hides the Activity link from both navs when activity is unavailable', () => {
    render(<Header hasActivity={false} />);

    const desktopNav = screen.getByRole('navigation', { name: 'Main' });
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });

    expect(within(desktopNav).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
    expect(within(mobileNav).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
    expect(within(desktopNav).getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(within(mobileNav).getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('toggles the mobile menu open state when the burger button is clicked', () => {
    render(<Header hasActivity />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  // userEvent sends the full pointerdown/mousedown/click sequence of a real tap. fireEvent.click
  // sends only the click, which hid a bug where mousedown closed the menu and click reopened it.
  it('closes the open mobile menu when the X (toggle) button is tapped', async () => {
    const user = userEvent.setup();
    render(<Header hasActivity />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the mobile menu open when a tap lands inside the panel', async () => {
    const user = userEvent.setup();
    render(<Header hasActivity />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    await user.click(toggle);
    await user.click(screen.getByRole('navigation', { name: 'Mobile' }));

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the mobile menu when Escape is pressed', () => {
    render(<Header hasActivity />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('scrolls to the matching section when a desktop nav link is clicked', () => {
    vi.useFakeTimers();
    render(<Header hasActivity />);

    const scrollToSpy = window.scrollTo as unknown as ReturnType<typeof vi.fn>;
    fireEvent.click(screen.getAllByRole('link', { name: 'Projects' })[0]);
    vi.advanceTimersByTime(150);

    expect(scrollToSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('scrolls to the hero section when the logo is clicked', () => {
    vi.useFakeTimers();
    render(<Header hasActivity />);

    fireEvent.click(screen.getByRole('link', { name: /devfolio/i }));
    vi.advanceTimersByTime(150);

    expect(window.scrollTo).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('closes the mobile menu and navigates when a mobile-only link is clicked', () => {
    vi.useFakeTimers();
    render(<Header hasActivity />);
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
    render(<Header hasActivity />);
    const toggle = screen.getByRole('button', { name: /toggle mobile menu/i });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const backdrop = screen.getByTestId('mobile-menu-backdrop');
    fireEvent.click(backdrop);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
