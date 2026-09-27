import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '../types';
import ProjectCard from './ProjectCard';

const baseProject: Project = {
  id: 1,
  title: 'Demo Project',
  description: 'A demo project used in tests.',
  imageUrl: 'https://example.com/image.png',
  tags: ['React', 'TypeScript'],
};

describe('ProjectCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the title, description and tags', () => {
    render(<ProjectCard project={baseProject} />);

    expect(screen.getByRole('heading', { name: 'Demo Project' })).toBeInTheDocument();
    expect(screen.getByText('A demo project used in tests.')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders live site and source links with safe target/rel attributes', () => {
    const project: Project = {
      ...baseProject,
      liveUrl: 'https://example.com/live',
      sourceUrl: 'https://github.com/example/repo',
    };
    render(<ProjectCard project={project} />);

    const liveLink = screen.getByRole('link', { name: /live website/i });
    expect(liveLink).toHaveAttribute('href', 'https://example.com/live');
    expect(liveLink).toHaveAttribute('target', '_blank');
    expect(liveLink).toHaveAttribute('rel', 'noopener noreferrer');

    const sourceLink = screen.getByRole('link', { name: /source code/i });
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/example/repo');
    expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render optional links when the project has no matching urls', () => {
    render(<ProjectCard project={baseProject} />);

    expect(screen.queryByRole('link', { name: /live website/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /source code/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/download apk/i)).not.toBeInTheDocument();
  });

  it('shows a loading state for the APK link while the release is being fetched', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {}))
    );
    const project: Project = { ...baseProject, apkUrl: 'https://github.com/example/repo' };

    render(<ProjectCard project={project} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('links to the matching release asset once the APK release resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tag_name: 'v2.0.0',
          assets: [
            {
              name: 'app-release.apk',
              browser_download_url: 'https://github.com/example/repo/releases/download/v2.0.0/app-release.apk',
            },
          ],
        }),
      })
    );
    const project: Project = { ...baseProject, apkUrl: 'https://github.com/example/repo' };

    render(<ProjectCard project={project} />);

    const link = await screen.findByText(/download apk/i);
    expect(link.closest('a')).toHaveAttribute(
      'href',
      'https://github.com/example/repo/releases/download/v2.0.0/app-release.apk'
    );
  });

  it('falls back to the latest-release download url when no asset matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: 'v2.0.0', assets: [] }),
      })
    );
    const project: Project = { ...baseProject, apkUrl: 'https://github.com/example/repo' };

    render(<ProjectCard project={project} />);

    const link = await screen.findByText(/download apk/i);
    expect(link.closest('a')).toHaveAttribute(
      'href',
      'https://github.com/example/repo/releases/latest/download/app-debug.apk'
    );
  });

  it('surfaces the fetch error via the download link title once loading finishes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch release data')));
    const project: Project = { ...baseProject, apkUrl: 'https://github.com/example/repo' };

    render(<ProjectCard project={project} />);

    const link = await screen.findByText(/download apk/i);
    expect(link.closest('a')).toHaveAttribute('title', expect.stringContaining('Failed to fetch release data'));
  });
});
