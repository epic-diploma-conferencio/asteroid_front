import { useMutation, useQuery } from '@tanstack/react-query';

import { analysisApi } from './analysis.api';
import type { StartAnalysisDto } from '../model/analysis.types';

export const analysisKeys = {
  all: () => ['analysis'] as const,
  rulesAvailable: () => [...analysisKeys.all(), 'rules-available'] as const,
};

export const useAvailableRules = (enabled = true) =>
  useQuery({
    queryKey: analysisKeys.rulesAvailable(),
    enabled,
    queryFn: analysisApi.getAvailableRules,
  });

export const useUploadProjectArchive = () =>
  useMutation({
    mutationFn: (archive: File) => analysisApi.uploadArchive(archive),
  });

export const useStartAnalysis = () =>
  useMutation({
    mutationFn: (dto: StartAnalysisDto) => analysisApi.startAnalysis(dto),
  });
