import React from 'react';
import { Project } from '../types';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import GitHubIcon from './icons/GitHubIcon';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { title, description, imageUrl, tags, liveUrl, sourceUrl } = project;

  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 border border-slate-700/50 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span key={tag} className="bg-sky-900/50 text-sky-300 text-xs font-semibold px-3 py-1 rounded-full font-mono">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          {liveUrl && (
            <a 
              href={liveUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-white font-semibold hover:text-sky-400 transition-colors"
            >
              <ExternalLinkIcon />
              Live Website
            </a>
          )}
          {sourceUrl && (
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-semibold hover:text-sky-400 transition-colors"
            >
              <GitHubIcon />
              Source Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;