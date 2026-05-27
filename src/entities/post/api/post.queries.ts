import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';

import { postApi } from './post.api';
import type { CreatePostDto, Post } from '../model/post.types';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
} as const;

export const usePosts = (options?: Partial<UseQueryOptions<Post[]>>) =>
  useQuery({
    queryKey: postKeys.lists(),
    queryFn: postApi.getList,
    ...options,
  });

export const usePost = (id: number | null, options?: Partial<UseQueryOptions<Post>>) =>
  useQuery({
    queryKey: postKeys.detail(id!),
    queryFn: () => postApi.getById(id!),
    enabled: id !== null,
    ...options,
  });

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.create,

    onMutate: async (newPost: CreatePostDto) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      const previousPosts = queryClient.getQueryData<Post[]>(postKeys.lists());

      queryClient.setQueryData<Post[]>(postKeys.lists(), (old = []) => [
        ...old,
        { id: Date.now(), ...newPost },
      ]);

      return { previousPosts };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousPosts !== undefined) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
