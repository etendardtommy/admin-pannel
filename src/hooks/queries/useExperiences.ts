import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export interface Experience {
    id: number;
    type: 'work' | 'education';
    title: string;
    subtitle: string;
    description: string;
    date: string;
    skills: string | null;
    published: boolean;
}

// Queries
export function useExperiences(siteId?: string) {
    return useQuery({
        queryKey: ['experiences', siteId],
        queryFn: async () => {
            const headers = siteId ? { 'x-site-id': siteId } : undefined;
            // Admin fetches all experiences, not just public ones
            const { data } = await api.get<Experience[]>('/experience', { headers });
            return data;
        },
    });
}

export function useExperience(id?: string) {
    return useQuery({
        queryKey: ['experiences', 'detail', id],
        queryFn: async () => {
            const { data } = await api.get<Experience>(`/experience/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

// Mutations
export function useExperienceMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.post('/experience', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            const { data } = await api.patch(`/experience/${id}`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
            queryClient.invalidateQueries({ queryKey: ['experiences', 'detail', variables.id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/experience/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
        },
    });

    return {
        createExperience: createMutation.mutateAsync,
        updateExperience: updateMutation.mutateAsync,
        deleteExperience: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
