export interface SavedResearchListItem {
  id: string;
  name: string;
  description: string | null;
  ownerEmail: string;
  ownerIsMe: boolean;
  language: string;
  createdAt: string;
  preview: string;
}

export interface ResearchCardTone {
  label: string;
  value: string;
  tone?: 'danger' | 'success' | 'neutral';
}

export interface ResearchCard {
  id: string;
  kind: 'ast' | 'arch' | 'structure' | 'deps';
  title: string;
  stat: ResearchCardTone | null;
  preview: string;
  files?: string[];
}

export interface SavedResearchDetail {
  id: string;
  name: string;
  description: string | null;
  language: string;
  createdAt: string;
  preview: string;
  cards: ResearchCard[];
}

export interface CreateResearchDto {
  name: string;
  description: string | null;
}

export type UpdateResearchDto = Partial<CreateResearchDto>;
