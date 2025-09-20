import axios from 'axios';
import { useState } from 'react';
import { mutate } from 'swr';

interface Server {
    id: string;
    name: string;
    imageUrl: string | null;
}

interface UpdateServerData {
    name: string;
    imageUrl?: string | null;
}

export const useUpdateServer = (profileId: string | undefined) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateServer = async (serverId: string, data: UpdateServerData): Promise<Server | undefined> => {
        if (!profileId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.patch(`/api/servers/${serverId}`, data);
            // Optimistically update the servers cache
            mutate(`/api/servers?memberId=${profileId}`, (currentServers: Server[] | undefined) => {
                if (!currentServers) return currentServers;
                return currentServers.map(server =>
                    server.id === serverId ? response.data : server
                );
            }, false);
            return response.data;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update server';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateServer, loading, error };
};