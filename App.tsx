import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectsSection from './components/ProjectsSection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-300 font-sans min-h-screen animated-grid">
      <Header />
      <main>
        <Hero />
        <ProjectsSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;