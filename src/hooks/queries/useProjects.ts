import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export interface Project {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    url: string;
    githubUrl: string;
    tags: string[];
    published: boolean;
}

// Queries
export function useProjects(siteId?: string) {
    return useQuery({
        queryKey: ['projects', siteId],
        queryFn: async () => {
            const headers = siteId ? { 'x-site-id': siteId } : undefined;
            const { data } = await api.get<Project[]>('/portfolio/projects', { headers });
            return data;
        },
    });
}

export function useProject(id?: string) {
    return useQuery({
        queryKey: ['projects', 'detail', id],
        queryFn: async () => {
            const { data } = await api.get<Project>(`/portfolio/projects/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

// Mutations
export function useProjectMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await api.post('/portfolio/projects', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: FormData }) => {
            const { data } = await api.patch(`/portfolio/projects/${id}`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['projects', 'detail', variables.id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/portfolio/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    return {
        createProject: createMutation.mutateAsync,
        updateProject: updateMutation.mutateAsync,
        deleteProject: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
