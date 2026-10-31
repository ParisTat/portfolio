import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GitHubActivity from './GitHubActivity';
import { githubStatsFixture } from './__fixtures__/githubStatsFixture';

describe('GitHubActivity', () => {
  it('renders the heatmap and languages from loaded stats', () => {
    render(<GitHubActivity state={{ status: 'success', data: githubStatsFixture }} />);

    expect(screen.getByRole('heading', { name: /GitHub Activity/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /15 contributions in the last year/i })).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('renders nothing while the stats are loading', () => {
    const { container } = render(<GitHubActivity state={{ status: 'loading' }} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the stats failed to load or validate', () => {
    const { container } = render(<GitHubActivity state={{ status: 'error' }} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: /GitHub Activity/i })).not.toBeInTheDocument();
  });
});
