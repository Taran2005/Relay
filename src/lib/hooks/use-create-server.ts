import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Server {
    id: string;
    name: string;
    imageUrl: string | null;
}

interface CreateServerData {
    name: string;
    imageUrl?: string | null;
}

export const useCreateServer = (profileId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation<Server, unknown, CreateServerData>({
        mutationFn: async (data) => {
            if (!profileId) {
                throw new Error('Missing profile. Please sign in again.');
            }

            const response = await axios.post<Server>('/api/servers', data);
            return response.data;
        },
        onSuccess: (server) => {
            if (!profileId) {
                return;
            }

            queryClient.setQueryData<Server[]>(['servers', profileId], (existing = []) => {
                const hasServer = existing.some((item) => item.id === server.id);
                if (hasServer) {
                    return existing;
                }

                return [...existing, server];
            });
        },
        onSettled: () => {
            if (!profileId) {
                return;
            }

            queryClient.invalidateQueries({ queryKey: ['servers', profileId], refetchType: 'active' });
        },
    });
};
