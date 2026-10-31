import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectsSection from './components/ProjectsSection';
import GitHubActivity from './components/github-activity/GitHubActivity';
import { useGitHubStats } from './components/github-activity/useGitHubStats';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

const App: React.FC = () => {
  // Loaded once here so the Activity section and its nav link always agree.
  const githubStats = useGitHubStats();

  return (
    <div className="bg-slate-900 text-slate-300 font-sans min-h-screen animated-grid">
      <Header hasActivity={githubStats.status === 'success'} />
      <main>
        <Hero />
        <ProjectsSection />
        <GitHubActivity state={githubStats} />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default App;