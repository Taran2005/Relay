import axios from 'axios';
import { useState } from 'react';
import { mutate } from 'swr';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createServer = async (data: CreateServerData): Promise<Server | undefined> => {
        if (!profileId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/servers', data);
            // Optimistically update the servers cache
            mutate(`/api/servers?memberId=${profileId}`, (currentServers: Server[] | undefined) => {
                return [...(currentServers || []), response.data];
            }, false);
            return response.data;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create server';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createServer, loading, error };
};
