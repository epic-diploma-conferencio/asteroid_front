import { api } from '@/shared/api';
import { endpoints } from '@/shared/api/endpoints';

import type {
  AvailableRulesResponse,
  StartAnalysisDto,
  StartAnalysisResponse,
  UploadProjectResponse,
} from '../model/analysis.types';

export const analysisApi = {
  uploadArchive: (archive: File): Promise<UploadProjectResponse> => {
    const formData = new FormData();
    formData.append('file', archive);

    return api
      .post<UploadProjectResponse>(endpoints.upload.PROJECT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => response.data);
  },

  getAvailableRules: (): Promise<AvailableRulesResponse> =>
    api
      .get<AvailableRulesResponse>(endpoints.analysis.RULES_AVAILABLE)
      .then((response) => response.data),

  startAnalysis: (dto: StartAnalysisDto): Promise<StartAnalysisResponse> =>
    api
      .post<StartAnalysisResponse>(endpoints.analysis.START, dto)
      .then((response) => response.data),
};
