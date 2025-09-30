"use client";

import type { ServerWithMembersAndProfile } from "@/types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Query key factory for consistency
export const serverQueryKeys = {
    all: ['servers'] as const,
    lists: () => [...serverQueryKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...serverQueryKeys.lists(), filters] as const,
    details: () => [...serverQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...serverQueryKeys.details(), id] as const,
} as const;

export const useServerData = (serverId: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: serverQueryKeys.detail(serverId),
        queryFn: async (): Promise<ServerWithMembersAndProfile> => {
            const { data } = await axios.get(`/api/servers/${serverId}`);
            return data;
        },
        enabled: !!serverId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        throwOnError: false,
    });

    // Provide mutate function for compatibility
    const mutate = () => {
        queryClient.invalidateQueries({ queryKey: serverQueryKeys.detail(serverId) });
    };

    return {
        server: query.data,
        isLoading: query.isLoading,
        error: query.error,
        mutate,
    };
};