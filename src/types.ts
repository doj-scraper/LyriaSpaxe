export type SectionType = 'Intro' | 'Hook' | 'Verse' | 'Bridge' | 'Outro';

export interface ArrangementSection {
  id: string;
  type: SectionType;
  bars: number;
  energy: number;
}

export interface SongDNA {
  darkness: number;
  atmosphere: number;
  emotion: number;
  nostalgia: number;
  energy: number;
  aggression: number;
}

export const THEME = {
  bg: '#0A0B0F',
  panel: '#111318',
  elevated: '#171A21',
  border: '#252933',
  accent: '#00D4FF',
  text: '#F5F7FA',
  textSecondary: '#98A2B3',
};
