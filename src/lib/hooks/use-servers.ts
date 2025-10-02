import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Server {
    id: string;
    name: string;
    imageUrl: string | null;
    inviteCode: string;
    creatorId: string;
}

interface CreateServerData {
    name: string;
    imageUrl?: string | null;
}

// Centralized query keys
export const serverKeys = {
    all: ['servers'] as const,
    byMember: (memberId: string) => [...serverKeys.all, 'member', memberId] as const,
    byId: (serverId: string) => [...serverKeys.all, serverId] as const,
};

// Custom hook for fetching servers
export const useServers = (memberId: string | undefined) => {
    return useQuery({
        queryKey: serverKeys.byMember(memberId!),
        queryFn: async () => {
            const { data } = await axios.get(`/api/servers?memberId=${memberId}`);
            return data as Server[];
        },
        enabled: !!memberId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

// Custom hook for creating servers with optimistic updates
export const useCreateServer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateServerData) => {
            const response = await axios.post('/api/servers', data);
            return response.data as Server;
        },
        onMutate: async (newServer) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: serverKeys.all });

            // Snapshot previous value
            const previousServers = queryClient.getQueriesData({ queryKey: serverKeys.all });

            // Optimistically update cache
            queryClient.setQueriesData({ queryKey: serverKeys.all }, (old: Server[] | undefined) => [
                ...(old ?? []),
                { ...newServer, id: 'temp-id', creatorId: 'temp', inviteCode: 'temp' }
            ]);

            return { previousServers };
        },
        onError: (err, newServer, context) => {
            // Rollback optimistic update
            if (context?.previousServers) {
                context.previousServers.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Always refetch after mutation
            queryClient.invalidateQueries({ queryKey: serverKeys.all });
        },
    });
};