import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ServerWithMembersAndProfile } from "@/types/types";

// ✅ MODERN: React Query replacement for SWR hook
export const useServerData = (serverId: string) => {
    return useQuery({
        queryKey: ['server', serverId],
        queryFn: async (): Promise<ServerWithMembersAndProfile> => {
            const { data } = await axios.get(`/api/servers/${serverId}`);
            return data;
        },
        enabled: !!serverId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        // Add error handling
        throwOnError: false,
    });
};

// Query key factory for consistency
export const serverQueryKeys = {
    all: ['servers'] as const,
    lists: () => [...serverQueryKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...serverQueryKeys.lists(), filters] as const,
    details: () => [...serverQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...serverQueryKeys.details(), id] as const,
} as const;