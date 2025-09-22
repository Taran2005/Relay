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

interface EditChannelData {
    name: string;
    type: ChannelType;
    channelId: string;
    serverId: string;
}

export const useEditChannel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editChannel = async (data: EditChannelData): Promise<Channel | undefined> => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.patch(`/api/servers/${data.serverId}/channels/${data.channelId}`, {
                name: data.name,
                type: data.type,
            });
            // Optimistically update the server data cache
            mutate(`/api/servers/${data.serverId}`, (currentServer: ServerWithMembersAndProfile | undefined) => {
                if (!currentServer) return currentServer;
                return {
                    ...currentServer,
                    channels: currentServer.channels?.map(channel =>
                        channel.id === data.channelId ? response.data : channel
                    ),
                };
            }, false);
            return response.data;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to edit channel';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { editChannel, loading, error };
};