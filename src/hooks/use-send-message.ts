import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCurrentProfile } from "@/lib/hooks/use-current-profile";

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    memberId: string;
    channelId?: string;
    conversationId?: string;
    member: {
        id: string;
        profileId: string;
        profile: {
            id: string;
            name: string;
            imageUrl: string | null;
        };
    };
}

interface SendMessageData {
    content: string;
    apiUrl: string;
    query: Record<string, string>;
}

// Use the same query key format as the chat messages component
export const getChatQueryKey = (chatId: string) => `chat:${chatId}`;

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    const { data: currentProfile } = useCurrentProfile();

    return useMutation({
        mutationFn: async ({ content, apiUrl, query }: SendMessageData) => {
            const url = new URL(apiUrl, window.location.origin);
            Object.entries(query).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const response = await axios.post(url.toString(), { content });
            return response.data as Message;
        },

        onMutate: async ({ content, query }) => {
            const channelId = query.channelId || query.conversationId;
            if (!channelId) return;

            const queryKey = [getChatQueryKey(channelId)];

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value
            const previousMessages = queryClient.getQueryData(queryKey);

            // Create optimistic message
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                content,
                createdAt: new Date(),
                updatedAt: new Date(),
                memberId: 'current-member', // This will be replaced by server response
                channelId: query.channelId,
                conversationId: query.conversationId,
                member: {
                    id: 'current-member',
                    profileId: currentProfile?.id || 'current-profile',
                    profile: {
                        id: currentProfile?.id || 'current-profile',
                        name: currentProfile?.name || 'You',
                        imageUrl: currentProfile?.imageUrl || null,
                    },
                },
            };

            // Optimistically add message to infinite query
            queryClient.setQueryData(queryKey, (old: unknown) => {
                const data = old as { pages?: { items: Message[] }[]; pageParams?: unknown[] };
                if (!data?.pages?.length) {
                    // If no pages exist, create the first page with our message
                    return {
                        pages: [{ items: [optimisticMessage] }],
                        pageParams: [undefined],
                    };
                }

                const newPages = [...data.pages];
                // Add the new message to the first page (most recent messages)
                newPages[0] = {
                    ...newPages[0],
                    items: [optimisticMessage, ...newPages[0].items],
                };

                return { 
                    ...data, 
                    pages: newPages 
                };
            });

            return { previousMessages };
        },

        onError: (err, variables, context) => {
            const channelId = variables.query.channelId || variables.query.conversationId;
            if (!channelId || !context?.previousMessages) return;

            // Rollback optimistic update
            queryClient.setQueryData(
                [getChatQueryKey(channelId)],
                context.previousMessages
            );
        },

        onSettled: (data, error, variables) => {
            const channelId = variables.query.channelId || variables.query.conversationId;
            if (!channelId) return;

            // Refetch to get the real message from server
            queryClient.invalidateQueries({
                queryKey: [getChatQueryKey(channelId)]
            });
        },
    });
};