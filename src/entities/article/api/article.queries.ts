import { useQuery } from '@tanstack/react-query';

import { articleApi } from './article.api';

export const articleKeys = {
  all: () => ['articles'] as const,
  list: () => ['articles', 'list'] as const,
  detail: (articleId: string) => ['articles', 'detail', articleId] as const,
};

export const useArticles = () =>
  useQuery({
    queryKey: articleKeys.list(),
    queryFn: articleApi.list,
  });

export const useArticle = (articleId: string | undefined) =>
  useQuery({
    queryKey: articleKeys.detail(articleId ?? ''),
    enabled: Boolean(articleId),
    queryFn: () => articleApi.detail(articleId as string),
  });
