import { api } from '@/shared/api';
import { endpoints } from '@/shared/api/endpoints';

import type { ArticleDetail, ArticleSummary } from '../model/article.types';

export const articleApi = {
  list: (): Promise<ArticleSummary[]> =>
    api.get<ArticleSummary[]>(endpoints.articles.LIST).then((response) => response.data),

  detail: (articleId: string): Promise<ArticleDetail> =>
    api.get<ArticleDetail>(endpoints.articles.DETAIL(articleId)).then((response) => response.data),
};
