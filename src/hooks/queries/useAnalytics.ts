import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export function useAnalytics(siteId?: string) {
    return useQuery({
        queryKey: ['analytics', siteId],
        queryFn: async () => {
            const params = siteId ? { siteId } : undefined;
            const { data } = await api.get<{ visits: number }>('/analytics/stats', { params });
            return data;
        },
    });
}
