import React from 'react';
import type { LanguageStat } from './types';

interface LanguageBarProps {
  languages: LanguageStat[];
}

const LanguageBar: React.FC<LanguageBarProps> = ({ languages }) => {
  if (languages.length === 0) return null;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
        {languages.map((language) => (
          <div
            key={language.name}
            title={`${language.name}: ${language.percent}%`}
            className="h-full transition-[width] motion-reduce:transition-none"
            style={{ width: `${language.percent}%`, backgroundColor: language.color }}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {languages.map((language) => (
          <li key={language.name} className="flex items-center gap-2 text-sm text-slate-400">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: language.color }}
            />
            <span className="font-mono">{language.name}</span>
            <span className="text-slate-500">{language.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageBar;
