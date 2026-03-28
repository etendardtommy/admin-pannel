import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export interface Message {
    id: number;
    name: string;
    email: string;
    message: string;
    status: 'UNREAD' | 'READ' | 'REPLIED';
    siteId: number | null;
    site?: { name: string };
    createdAt: string;
}

export function useMessages() {
    const queryClient = useQueryClient();

    const { data: messages, isLoading, error } = useQuery<Message[]>({
        queryKey: ['messages'],
        queryFn: async () => {
            const response = await api.get('/messages');
            return response.data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            api.patch(`/messages/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/messages/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });

    const deleteBulkMutation = useMutation({
        mutationFn: (ids: number[]) => api.post('/messages/bulk-delete', { ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });

    return {
        messages,
        isLoading,
        error,
        updateStatus: updateStatusMutation.mutate,
        isUpdating: updateStatusMutation.isPending,
        deleteMessage: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        deleteMessages: deleteBulkMutation.mutate,
        isDeletingBulk: deleteBulkMutation.isPending,
    };
}
