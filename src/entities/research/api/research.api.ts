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

  /**
   * Загрузка одного или нескольких исходных файлов на анализ.
   * Бэк ожидает поле `files` (массив) либо `file` (одиночный) — НЕ zip.
   * Каждый файл будет распределён воркеру по расширению.
   */
  uploadFiles: (files: File[], language?: string): Promise<UploadProjectResponse> => {
    if (files.length === 0) {
      return Promise.reject(new Error('Не выбрано ни одного файла для загрузки.'));
    }

    const formData = new FormData();
    if (files.length === 1) {
      formData.append('file', files[0], files[0].name);
    } else {
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });
    }
    if (language) {
      formData.append('language', language);
    }

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
