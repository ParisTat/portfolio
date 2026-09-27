import type { GitHubStats } from '../types';

/** Small, deterministic fixture used by GitHubActivity component tests. */
export const githubStatsFixture: GitHubStats = {
  generatedAt: '2026-09-27T05:00:00.000Z',
  login: 'ParisTat',
  totalContributions: 15,
  weeks: [
    [
      { date: '2026-09-14', count: 0 },
      { date: '2026-09-15', count: 2 },
      { date: '2026-09-16', count: 5 },
      { date: '2026-09-17', count: 1 },
      { date: '2026-09-18', count: 0 },
      { date: '2026-09-19', count: 3 },
      { date: '2026-09-20', count: 0 },
    ],
    [
      { date: '2026-09-21', count: 1 },
      { date: '2026-09-22', count: 0 },
      { date: '2026-09-23', count: 0 },
      { date: '2026-09-24', count: 2 },
      { date: '2026-09-25', count: 1 },
      { date: '2026-09-26', count: 0 },
      { date: '2026-09-27', count: 0 },
    ],
  ],
  languages: [
    { name: 'TypeScript', color: '#3178c6', percent: 65 },
    { name: 'CSS', color: '#563d7c', percent: 25 },
    { name: 'Other', color: '#64748b', percent: 10 },
  ],
};
