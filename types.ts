
export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl?: string;
  sourceUrl?: string;
}
