export type ResearchStatus = 'processing' | 'completed';

export interface ResearchListItem {
  id: string;
  name: string;
  description: string | null;
  ownerEmail: string;
  ownerIsMe: boolean;
  isSaved: boolean;
  language: string;
  createdAt: string;
  preview: string;
  status: ResearchStatus;
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

export interface ResearchDetail {
  id: string;
  name: string;
  description: string | null;
  ownerIsMe: boolean;
  isSaved: boolean;
  status: ResearchStatus;
  language: string;
  createdAt: string;
  preview: string;
  cards: ResearchCard[];
}

export interface AvailableRule {
  ruleName: string;
  ruleRussian: string;
  ruleDescription: string;
}

export interface AvailableRulesResponse {
  rules: AvailableRule[];
}

export interface UploadProjectResponse {
  message: string;
  archiveId: string;
  archiveName: string;
  fileCount: number;
  language: string;
}

export interface StartAnalysisRule {
  ruleName: string;
  value: boolean;
}

export interface StartAnalysisDto {
  rules: StartAnalysisRule[];
  uploadId?: string | null;
}

export interface StartAnalysisResponse {
  message: string;
  researchId: string;
  status: ResearchStatus;
}

export interface ResearchStatusResponse {
  id: string;
  status: ResearchStatus;
}

export interface CreateResearchDto {
  name: string;
  description: string | null;
}

export type UpdateResearchDto = Partial<CreateResearchDto>;

export type SavedResearchListItem = ResearchListItem;
export type SavedResearchDetail = ResearchDetail;
