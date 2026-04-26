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
  analysisId: string;
  status: 'started';
}
