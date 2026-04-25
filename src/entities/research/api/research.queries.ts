import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/authorization/model/auth.store';

import { researchApi } from './research.api';
import type { CreateResearchDto, UpdateResearchDto } from '../model/research.types';

export const researchKeys = {
  all: () => ['research'] as const,
  list: () => [...researchKeys.all(), 'list'] as const,
  detail: (id: string) => [...researchKeys.all(), 'detail', id] as const,
};

export const useResearchList = () => {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: researchKeys.list(),
    enabled: Boolean(token),
    queryFn: researchApi.list,
  });
};

export const useResearchDetail = (id: string | undefined) =>
  useQuery({
    queryKey: researchKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => researchApi.detail(id as string),
  });

export const useCreateResearch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateResearchDto) => researchApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: researchKeys.list() }),
  });
};

export const useUpdateResearch = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateResearchDto) => researchApi.update(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: researchKeys.list() });
      void qc.invalidateQueries({ queryKey: researchKeys.detail(id) });
    },
  });
};

export const useDeleteResearch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => researchApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: researchKeys.list() }),
  });
};
