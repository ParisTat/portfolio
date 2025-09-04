import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-white tracking-wider hover:text-sky-400 transition-colors font-mono">
          &gt; DevFolio<span className="animate-cursor-blink">_</span>
        </a>
        <nav>
          <ul className="flex space-x-8">
            <li><a href="#hero" className="text-lg font-medium hover:text-sky-400 transition-colors">Home</a></li>
            <li><a href="#projects" className="text-lg font-medium hover:text-sky-400 transition-colors">Projects</a></li>
            <li><a href="#contact" className="text-lg font-medium hover:text-sky-400 transition-colors">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;