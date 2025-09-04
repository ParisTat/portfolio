import React from 'react';
import GitHubIcon from './icons/GitHubIcon';
import LinkedInIcon from './icons/LinkedInIcon';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-6 py-8 text-center text-slate-400">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="https://github.com/ParisTat" className="hover:text-sky-400 transition-colors transform hover:scale-110" target="_blank" rel="noopener noreferrer">
            <GitHubIcon className="w-8 h-8" />
          </a>
          <a href="https://www.linkedin.com/in/paris-rafail-tataridis-494767231/" className="hover:text-sky-400 transition-colors transform hover:scale-110" target="_blank" rel="noopener noreferrer">
            <LinkedInIcon className="w-8 h-8" />
          </a>
        </div>
        <p className="font-mono text-sm">&copy; {new Date().getFullYear()} Tataridis Paris-Rafail. All rights reserved.</p>
        <p className="text-sm mt-2">Built with React & Tailwind CSS.</p>
      </div>
    </footer>
  );
};

export default Footer;