import { useCurrentProfile } from "@/lib/hooks/use-current-profile";
import { ChatMessage } from "@/types/types";
import { MemberRole } from "@prisma/client";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SendMessageData {
    content: string;
    apiUrl: string;
    query: Record<string, string>;
    fileUrl?: string | null;
}

// Use the same query key format as the chat messages component
type MessagesInfiniteData = InfiniteData<{
    items: ChatMessage[];
    nextCursor: string | null;
}, string | undefined>;

export const getChatQueryKey = (chatId: string) => ["chat", chatId] as const;

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    const { data: currentProfile } = useCurrentProfile();

    return useMutation({
        mutationFn: async ({ content, apiUrl, query, fileUrl }: SendMessageData) => {
            const url = new URL(apiUrl, window.location.origin);
            Object.entries(query).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const response = await axios.post(url.toString(), { content, fileUrl });
            return response.data as ChatMessage;
        },

        onMutate: async ({ content, query, fileUrl }) => {
            const channelId = query.channelId || query.conversationId;
            if (!channelId) return;

            const queryKey = getChatQueryKey(channelId);

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value
            const previousMessages = queryClient.getQueryData<MessagesInfiniteData>(queryKey);

            // Create optimistic message
            const now = new Date();
            const optimisticMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                content,
                createdAt: now,
                updatedAt: now,
                memberId: 'current-member', // This will be replaced by server response
                channelId: query.channelId,
                conversationId: query.conversationId,
                profileId: currentProfile?.id || 'current-profile',
                fileUrl: fileUrl ?? null,
                deleted: false,
                member: {
                    id: 'current-member',
                    profileId: currentProfile?.id || 'current-profile',
                    createdAt: now,
                    updatedAt: now,
                    role: MemberRole.GUEST,
                    serverId: query.serverId || 'conversation',
                    profile: {
                        id: currentProfile?.id || 'current-profile',
                        name: currentProfile?.name || 'You',
                        imageUrl: currentProfile?.imageUrl || null,
                        createdAt: now,
                        updatedAt: now,
                        userId: currentProfile?.userId || 'current-user',
                        email: currentProfile?.email || 'you@example.com',
                    },
                },
            };

            // Optimistically add message to infinite query
            queryClient.setQueryData<MessagesInfiniteData | undefined>(queryKey, (old) => {
                if (!old) {
                    return {
                        pageParams: [undefined],
                        pages: [{ items: [optimisticMessage], nextCursor: null }],
                    };
                }

                const newPages = [...old.pages];
                newPages[0] = {
                    ...newPages[0],
                    items: [optimisticMessage, ...newPages[0].items],
                };

                return {
                    ...old,
                    pages: newPages,
                };
            });

            return { previousMessages };
        },

        onError: (err, variables, context) => {
            const channelId = variables.query.channelId || variables.query.conversationId;
            if (!channelId || !context?.previousMessages) return;

            // Rollback optimistic update
            queryClient.setQueryData(
                getChatQueryKey(channelId),
                context.previousMessages
            );
        },

        onSettled: (data, error, variables) => {
            const channelId = variables.query.channelId || variables.query.conversationId;
            if (!channelId) return;

            // Refetch to get the real message from server
            queryClient.invalidateQueries({
                queryKey: getChatQueryKey(channelId),
                refetchType: "inactive",
            });
        },
    });
};