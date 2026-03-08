import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export interface Site {
    id: number;
    name: string;
    domain: string;
}

// Queries
export function useSites() {
    return useQuery({
        queryKey: ['sites'],
        queryFn: async () => {
            const { data } = await api.get<Site[]>('/sites');
            return data;
        },
    });
}

// Mutations
export function useSiteMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (payload: { name: string; domain: string }) => {
            const { data } = await api.post('/sites', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            const { data } = await api.patch(`/sites/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/sites/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
        },
    });

    return {
        createSite: createMutation.mutateAsync,
        updateSite: updateMutation.mutateAsync,
        deleteSite: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
