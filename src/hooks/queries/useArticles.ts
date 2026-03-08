import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export interface Article {
    id: number;
    title: string;
    content: string;
    htmlContent: string;
    excerpt: string;
    imageUrl: string;
    tags: string[];
    published: boolean;
    createdAt: string;
    updatedAt: string;
}

// Queries
export function useArticles(siteId?: string) {
    return useQuery({
        queryKey: ['articles', siteId],
        queryFn: async () => {
            const headers = siteId ? { 'x-site-id': siteId } : undefined;
            const { data } = await api.get<Article[]>('/articles', { headers });
            return data;
        },
    });
}

export function useArticle(id?: string) {
    return useQuery({
        queryKey: ['articles', 'detail', id],
        queryFn: async () => {
            const { data } = await api.get<Article>(`/articles/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

// Mutations
export function useArticleMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await api.post('/articles', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: FormData }) => {
            const { data } = await api.patch(`/articles/${id}`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['articles', 'detail', variables.id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/articles/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        },
    });

    return {
        createArticle: createMutation.mutateAsync,
        updateArticle: updateMutation.mutateAsync,
        deleteArticle: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
