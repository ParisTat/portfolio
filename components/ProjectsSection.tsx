import React from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';

const projects: Project[] = [
  {
    id: 1,
    title: 'A Black holes website',
    description: 'An interactive educational platform that explains the physics of black holes through theory, equations, visuals, and engaging tools designed for students and researchers.',
    imageUrl: '../assets/bg-blackhole-website-section.jpg',
    tags: ['Html', 'Css', 'JavaScript'],
    liveUrl: 'https://paristat.github.io/thesis/',
    sourceUrl: 'https://github.com/ParisTat/thesis',
  },
  {
    id: 2,
    title: 'A wedding website',
    description: 'A wedding site that encorporates the invitation confirmation system, as well as all the required information a guest would need to attend the wedding.',
    imageUrl: '../assets/bg-wedding-site-section.webp',
    tags: ['React', 'TypeScript','Next.js', 'Firebase', 'Tailwind CSS'],
    liveUrl: 'https://wedding-site-d3677.web.app/',
    //sourceUrl: '#',
  },
  {
    id: 3,
    title: 'In house hiring app',
    description: 'An application that allows for the hiring of employees for the company, as well as the management of the employees.',
    imageUrl: '../assets/bg-talentpool-section.webp',
    tags: ['React', 'TypeScript', 'Next.js','Supabase', 'Tailwind CSS'],
    //liveUrl: '#',
  },
  {
    id: 4,
    title: 'Future Projects',
    description: 'Nobody knows what the future holds, but I\'m sure it will be exciting.',
    imageUrl: '../assets/bg-coming-soon-section.jpg',
    tags: ['The', 'Future', 'Awaits!'],
    //sourceUrl: '#',
  },
];

const ProjectsSection: React.FC = () => {
  return (
    <section id="projects" className="py-20 md:py-28 bg-slate-950/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white font-mono">
            <span className="text-sky-400">//</span> Featured Projects
          </h2>
          <p className="text-lg text-slate-400 mt-4">A selection of my recent websites and applications.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;