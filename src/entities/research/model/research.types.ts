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

export type RuleStyle = 'soft' | 'balanced' | 'strict';

export type RuleScoreStatus = 'passed' | 'warning' | 'failed';

export type RuleScoreSeverity = 'low' | 'medium' | 'high';

export type RuleGroup = 'group-a' | 'group-b';

/** Метрики графа AST, по которым считается каждый score. */
export interface GraphMetrics {
  totalNodes: number;
  totalEdges: number;
  moduleCount: number;
  importEdgeCount: number;
  callEdgeCount: number;
  density: number;
}

/** Результат одного правила в составе исследования. */
export interface RuleResult {
  ruleName: string;
  ruleRussian: string;
  group: RuleGroup;
  style: RuleStyle;
  score: number;
  status: RuleScoreStatus;
  severity: RuleScoreSeverity;
  metrics: GraphMetrics;
}

export interface GraphOverview {
  formatVersion?: string;
  summary?: GraphMetrics;
  graph?: {
    nodes?: Array<{ id: string; kind: string; name?: string; moduleId?: string | null }>;
    edges?: Array<{ id: string; from: string; to: string; kind: string }>;
    modules?: Array<{ id: string; name: string; path: string; language?: string }>;
  };
}

export interface GraphByRules {
  formatVersion?: string;
  style?: RuleStyle;
  selectedRuleNames?: string[];
  groups?: {
    groupA?: RuleResult[];
    groupB?: RuleResult[];
  };
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
  graphOverview?: GraphOverview;
  graphByRules?: GraphByRules;
  selectedRules?: StartAnalysisRule[];
  ruleStyle?: RuleStyle;
}

export interface AvailableRule {
  ruleName: string;
  ruleRussian: string;
  ruleDescription: string;
}

export interface AvailableRulesResponse {
  rules: AvailableRule[];
}

export interface UploadFileError {
  jobId: string;
  originalName: string;
  status: string;
  code: string | null;
  error: string | null;
}

export interface UploadProjectResponse {
  message: string;
  archiveId: string;
  archiveName: string;
  fileCount: number;
  language: string | null;
  completedFiles?: number;
  failedFiles?: UploadFileError[];
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
