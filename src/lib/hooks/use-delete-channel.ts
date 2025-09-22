import { ServerWithMembersAndProfile } from '@/types/types';
import axios from 'axios';
import { useState } from 'react';
import { mutate } from 'swr';

interface DeleteChannelData {
    channelId: string;
    serverId: string;
}

export const useDeleteChannel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteChannel = async (data: DeleteChannelData): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`/api/servers/${data.serverId}/channels/${data.channelId}`);
            // Optimistically update the server data cache
            mutate(`/api/servers/${data.serverId}`, (currentServer: ServerWithMembersAndProfile | undefined) => {
                if (!currentServer) return currentServer;
                return {
                    ...currentServer,
                    channels: currentServer.channels?.filter(channel => channel.id !== data.channelId),
                };
            }, false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete channel';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deleteChannel, loading, error };
};