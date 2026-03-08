import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export interface RosterItem {
    id: number;
    name: string;
    number: string | null;
    photoUrl: string | null;
    siteId: number;
    createdAt: string;
    updatedAt: string;
}

export function useRoster() {
    return useQuery<RosterItem[]>({
        queryKey: ['roster'],
        queryFn: async () => {
            const { data } = await api.get('/roster');
            return data;
        },
    });
}

export function useCreateRosterItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await api.post('/roster', payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roster'] }),
    });
}

export function useUpdateRosterItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: FormData }) => {
            const { data } = await api.patch(`/roster/${id}`, payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roster'] }),
    });
}

export function useDeleteRosterItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/roster/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roster'] }),
    });
}
