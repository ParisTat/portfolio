export interface ContributionDay {
  date: string;
  count: number;
}

export interface LanguageStat {
  name: string;
  color: string;
  percent: number;
}

export interface GitHubStats {
  generatedAt: string;
  login: string;
  totalContributions: number;
  weeks: ContributionDay[][];
  languages: LanguageStat[];
}
