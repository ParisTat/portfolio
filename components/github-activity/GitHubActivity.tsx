import React from 'react';
import { useGitHubStats } from './useGitHubStats';
import ContributionHeatmap from './ContributionHeatmap';
import LanguageBar from './LanguageBar';

/**
 * Renders the GitHub activity section (contribution heatmap + top languages) from the
 * build-time github-stats.json snapshot. Renders nothing when the file is missing,
 * still loading, or fails validation — e.g. local dev without a GITHUB_TOKEN.
 */
const GitHubActivity: React.FC = () => {
  const state = useGitHubStats();

  if (state.status !== 'success') return null;

  const { data } = state;

  return (
    <section id="activity" className="py-20 md:py-28 bg-slate-950/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white font-mono">
            <span className="text-sky-400">//</span> GitHub Activity
          </h2>
          <p className="text-lg text-slate-400 mt-4">
            {data.totalContributions} contributions in the last year across public repositories.
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm p-6 md:p-8 space-y-10">
          <ContributionHeatmap weeks={data.weeks} totalContributions={data.totalContributions} />
          {data.languages.length > 0 && <LanguageBar languages={data.languages} />}
        </div>
      </div>
    </section>
  );
};

export default GitHubActivity;
