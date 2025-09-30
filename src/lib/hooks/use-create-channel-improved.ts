import type { ServerWithMembersAndProfile } from "@/types/types";
import { ChannelType } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreateChannelData {
    name: string;
    type: ChannelType;
    serverId: string;
}

interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    serverId: string;
    createdAt: Date;
    updatedAt: Date;
}

// ✅ MODERN: React Query mutation with optimistic updates
export const useCreateChannel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateChannelData): Promise<Channel> => {
            const response = await axios.post(`/api/servers/${data.serverId}/channels`, {
                name: data.name,
                type: data.type,
            });
            return response.data;
        },

        // Optimistic update
        onMutate: async (newChannel) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['server', newChannel.serverId] });

            // Snapshot previous value
            const previousServer = queryClient.getQueryData<ServerWithMembersAndProfile>(
                ['server', newChannel.serverId]
            );

            // Optimistically update the server data
            queryClient.setQueryData<ServerWithMembersAndProfile>(
                ['server', newChannel.serverId],
                (old) => {
                    if (!old) return old;

                    const tempChannel: Channel = {
                        id: `temp-${Date.now()}`,
                        name: newChannel.name,
                        type: newChannel.type,
                        serverId: newChannel.serverId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    return {
                        ...old,
                        channels: [...old.channels, tempChannel],
                    };
                }
            );

            return { previousServer };
        },

        // Rollback on error
        onError: (err, newChannel, context) => {
            if (context?.previousServer) {
                queryClient.setQueryData(
                    ['server', newChannel.serverId],
                    context.previousServer
                );
            }
        },

        // Always refetch after mutation settles
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ['server', variables.serverId] });
        },
    });
};