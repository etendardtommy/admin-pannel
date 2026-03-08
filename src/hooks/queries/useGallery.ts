import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../../contexts/SiteContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders(siteId: number) {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-site-id': String(siteId),
    };
}

function getMultipartAuthHeaders(siteId: number) {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'x-site-id': String(siteId),
    };
}

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
    const { activeSite } = useSite();
    const siteId = activeSite?.id || 1;

    return useQuery<GalleryItem[]>({
        queryKey: ['gallery', siteId],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/gallery`, {
                headers: getAuthHeaders(siteId),
            });
            if (!res.ok) throw new Error('Failed to fetch gallery');
            return res.json();
        },
        enabled: !!localStorage.getItem('token'),
    });
}

export function useCreateGalleryItem() {
    const queryClient = useQueryClient();
    const { activeSite } = useSite();
    const siteId = activeSite?.id || 1;

    return useMutation({
        mutationFn: async (data: FormData) => {
            const res = await fetch(`${API_URL}/gallery`, {
                method: 'POST',
                headers: getMultipartAuthHeaders(siteId),
                body: data,
            });
            if (!res.ok) throw new Error('Failed to create item');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery', siteId] }),
    });
}

export function useUpdateGalleryItem() {
    const queryClient = useQueryClient();
    const { activeSite } = useSite();
    const siteId = activeSite?.id || 1;

    return useMutation({
        mutationFn: async ({ id, data }: { id: number, data: FormData }) => {
            const res = await fetch(`${API_URL}/gallery/${id}`, {
                method: 'PATCH',
                headers: getMultipartAuthHeaders(siteId),
                body: data,
            });
            if (!res.ok) throw new Error('Failed to update item');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery', siteId] }),
    });
}

export function useDeleteGalleryItem() {
    const queryClient = useQueryClient();
    const { activeSite } = useSite();
    const siteId = activeSite?.id || 1;

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`${API_URL}/gallery/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(siteId),
            });
            if (!res.ok) throw new Error('Failed to delete item');
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery', siteId] }),
    });
}
