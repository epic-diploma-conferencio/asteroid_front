import { api } from '@/shared/api';
import { endpoints } from '@/shared/api/endpoints';

import type {
  CreateResearchDto,
  SavedResearchDetail,
  SavedResearchListItem,
  UpdateResearchDto,
} from '../model/research.types';

export const researchApi = {
  list: (): Promise<SavedResearchListItem[]> =>
    api.get<{ items: SavedResearchListItem[] }>(endpoints.research.LIST).then((r) => r.data.items),

  detail: (id: string): Promise<SavedResearchDetail> =>
    api.get<SavedResearchDetail>(endpoints.research.DETAIL(id)).then((r) => r.data),

  create: (dto: CreateResearchDto): Promise<SavedResearchListItem> =>
    api.post<SavedResearchListItem>(endpoints.research.CREATE, dto).then((r) => r.data),

  update: (id: string, dto: UpdateResearchDto): Promise<SavedResearchListItem> =>
    api.patch<SavedResearchListItem>(endpoints.research.DETAIL(id), dto).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(endpoints.research.DETAIL(id)).then(() => undefined),
};
