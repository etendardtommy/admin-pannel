import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export type GalleryItem = {
    id: number;
    type: 'photo' | 'video';
    title: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    category?: string;
    tags: string[];
    published: boolean;
    createdAt: string;
};

export function useGallery() {
    return useQuery<GalleryItem[]>({
        queryKey: ['gallery'],
        queryFn: async () => {
            const { data } = await api.get('/gallery');
            return data;
        },
    });
}

export function useCreateGalleryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: FormData) => {
            const res = await api.post('/gallery', data);
            return res.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
    });
}

export function useUpdateGalleryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
            const res = await api.patch(`/gallery/${id}`, data);
            return res.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
    });
}

export function useDeleteGalleryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/gallery/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
    });
}
