import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectsSection from './ProjectsSection';

describe('ProjectsSection', () => {
  it('renders the section heading', () => {
    render(<ProjectsSection />);

    expect(screen.getByRole('heading', { name: /featured projects/i })).toBeInTheDocument();
  });

  it('renders one card heading per project', () => {
    render(<ProjectsSection />);

    const cardHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(cardHeadings.length).toBeGreaterThan(0);
  });
});
