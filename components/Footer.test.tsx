import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('renders external profile links with safe target/rel attributes', () => {
    render(<Footer />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);

    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('shows the current year in the copyright line', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();

    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
