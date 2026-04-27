import { api } from '@/shared/api';
import { endpoints } from '@/shared/api/endpoints';

import type {
  AvailableRulesResponse,
  CreateResearchDto,
  ResearchDetail,
  ResearchStatus,
  ResearchStatusResponse,
  ResearchListItem,
  StartAnalysisDto,
  StartAnalysisResponse,
  UpdateResearchDto,
  UploadProjectResponse,
} from '../model/research.types';

export const researchApi = {
  list: (): Promise<ResearchListItem[]> =>
    api.get<{ items: ResearchListItem[] }>(endpoints.research.LIST).then((r) => r.data.items),

  detail: (id: string): Promise<ResearchDetail> =>
    api.get<ResearchDetail>(endpoints.research.DETAIL(id)).then((r) => r.data),

  publicDetail: (id: string): Promise<ResearchDetail> =>
    api.get<ResearchDetail>(endpoints.research.PUBLIC_DETAIL(id)).then((r) => r.data),

  status: (id: string): Promise<ResearchStatusResponse> =>
    api.get<ResearchStatusResponse>(endpoints.research.STATUS(id)).then((r) => r.data),

  waitStatus: (
    id: string,
    since: ResearchStatus,
    signal?: AbortSignal,
  ): Promise<ResearchStatusResponse> =>
    api
      .get<ResearchStatusResponse>(endpoints.research.STATUS(id), {
        params: { since },
        signal,
        timeout: 35_000,
      })
      .then((r) => r.data),

  create: (dto: CreateResearchDto): Promise<ResearchListItem> =>
    api.post<ResearchListItem>(endpoints.research.CREATE, dto).then((r) => r.data),

  update: (id: string, dto: UpdateResearchDto): Promise<ResearchListItem> =>
    api.patch<ResearchListItem>(endpoints.research.DETAIL(id), dto).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(endpoints.research.DETAIL(id)).then(() => undefined),

  uploadArchive: (archive: File, language: string): Promise<UploadProjectResponse> => {
    const formData = new FormData();
    formData.append('file', archive);
    formData.append('language', language);

    return api
      .post<UploadProjectResponse>(endpoints.research.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => response.data);
  },

  getAvailableRules: (): Promise<AvailableRulesResponse> =>
    api
      .get<AvailableRulesResponse>(endpoints.research.RULES_AVAILABLE)
      .then((response) => response.data),

  startAnalysis: (dto: StartAnalysisDto): Promise<StartAnalysisResponse> =>
    api
      .post<StartAnalysisResponse>(endpoints.research.START_ANALYSIS, dto)
      .then((response) => response.data),
};
