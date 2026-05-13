import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/features/authorization/model/auth.store';

import { researchApi } from './research.api';
import type {
  CreateResearchDto,
  ResearchStatus,
  ResearchStatusResponse,
  StartAnalysisDto,
  UpdateResearchDto,
} from '../model/research.types';

export const researchKeys = {
  all: () => ['research'] as const,
  list: () => [...researchKeys.all(), 'list'] as const,
  detail: (id: string) => [...researchKeys.all(), 'detail', id] as const,
  publicDetail: (id: string) => [...researchKeys.all(), 'public-detail', id] as const,
  status: (id: string) => [...researchKeys.all(), 'status', id] as const,
  rules: () => [...researchKeys.all(), 'rules'] as const,
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

export const usePublicResearchDetail = (id: string | undefined) =>
  useQuery({
    queryKey: researchKeys.publicDetail(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => researchApi.publicDetail(id as string),
  });

export const useResearchStatus = (id: string | undefined, enabled = true) =>
  useQuery({
    queryKey: researchKeys.status(id ?? ''),
    enabled: Boolean(id) && enabled,
    retry: false,
    queryFn: () => researchApi.status(id as string),
  });

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const isTerminalLongPollingError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.code === 'ERR_CANCELED') {
    return true;
  }

  const status = error.response?.status;
  return status === 401 || status === 403 || status === 404;
};

export const useResearchLongPolling = (id: string | undefined, enabled = true) => {
  const queryClient = useQueryClient();
  const [data, setData] = useState<ResearchStatusResponse | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    setData(null);
    setError(null);

    if (!id || !enabled) {
      setIsPolling(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    let since: ResearchStatus = 'processing';

    const run = async () => {
      setIsPolling(true);

      while (!cancelled) {
        try {
          const result = await researchApi.waitStatus(id, since, controller.signal);

          if (cancelled) {
            return;
          }

          setData(result);
          setError(null);
          queryClient.setQueryData(researchKeys.status(id), result);

          if (result.status === 'completed') {
            setIsPolling(false);
            return;
          }

          since = result.status;
        } catch (nextError) {
          if (cancelled || controller.signal.aborted) {
            return;
          }

          setError(nextError);

          if (isTerminalLongPollingError(nextError)) {
            setIsPolling(false);
            return;
          }

          await sleep(1500);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
      setIsPolling(false);
    };
  }, [enabled, id, queryClient]);

  return {
    data,
    error,
    isPolling,
  };
};

export const useAvailableRules = (enabled = true) =>
  useQuery({
    queryKey: researchKeys.rules(),
    enabled,
    queryFn: researchApi.getAvailableRules,
  });

export const useUploadProjectFiles = () =>
  useMutation({
    mutationFn: ({ files, language }: { files: File[]; language?: string }) =>
      researchApi.uploadFiles(files, language),
  });

export const useStartAnalysis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: StartAnalysisDto) => researchApi.startAnalysis(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: researchKeys.list() });
    },
  });
};

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
      void qc.invalidateQueries({ queryKey: researchKeys.publicDetail(id) });
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
