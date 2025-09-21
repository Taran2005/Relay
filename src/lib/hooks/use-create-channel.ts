import { ServerWithMembersAndProfile } from '@/types/types';
import { ChannelType } from '@prisma/client';
import axios from 'axios';
import { useState } from 'react';
import { mutate } from 'swr';

interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    serverId: string;
}

interface CreateChannelData {
    name: string;
    type: ChannelType;
    serverId: string;
}

export const useCreateChannel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createChannel = async (data: CreateChannelData): Promise<Channel | undefined> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/api/servers/${data.serverId}/channels`, {
                name: data.name,
                type: data.type,
            });
            // Optimistically update the server data cache
            mutate(`/api/servers/${data.serverId}`, (currentServer: ServerWithMembersAndProfile | undefined) => {
                if (!currentServer) return currentServer;
                return {
                    ...currentServer,
                    channels: [...(currentServer.channels || []), response.data],
                };
            }, false);
            return response.data;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create channel';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createChannel, loading, error };
};