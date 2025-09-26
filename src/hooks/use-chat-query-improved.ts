import { useSocket } from "@/components/providers/socket.provider";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import qs from "query-string";

interface Message {
    id: string;
    content: string;
    member: {
        id: string;
        profile: {
            id: string;
            name: string;
            imageUrl: string | null;
        };
    };
    createdAt: string;
    updatedAt: string;
}

interface MessagesResponse {
    items: Message[];
    nextCursor: string | null;
}

type InfiniteMessagesData = InfiniteData<MessagesResponse, string | undefined>;

interface ChatQueryProps {
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
}

export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
}: ChatQueryProps) => {
    const { isConnected } = useSocket();
    const queryClient = useQueryClient();

    const fetchMessages = async ({ pageParam }: { pageParam?: string }): Promise<MessagesResponse> => {
        const url = qs.stringifyUrl(
            {
                url: apiUrl,
                query: {
                    cursor: pageParam,
                    [paramKey]: paramValue,
                },
            },
            { skipNull: true }
        );

        const { data } = await axios.get(url);
        return data;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        isLoading,
    } = useInfiniteQuery({
        queryKey: [queryKey, paramValue],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchInterval: isConnected ? false : 5000,
        initialPageParam: undefined,
        staleTime: 30 * 1000, // 30 seconds
        enabled: !!paramValue, // Only fetch when we have a valid paramValue
    });

    // Helper function to add a message optimistically
    const addMessageOptimistically = (newMessage: Partial<Message>) => {
        queryClient.setQueryData([queryKey, paramValue], (oldData: InfiniteMessagesData | undefined) => {
            if (!oldData) return oldData;

            const newPages = [...oldData.pages];
            newPages[0] = {
                ...newPages[0],
                items: [newMessage as Message, ...newPages[0].items],
            };

            return {
                ...oldData,
                pages: newPages,
            };
        });
    };

    // Helper function to update a message
    const updateMessage = (messageId: string, updates: Partial<Message>) => {
        queryClient.setQueryData([queryKey, paramValue], (oldData: InfiniteMessagesData | undefined) => {
            if (!oldData) return oldData;

            const newPages = oldData.pages.map((page: MessagesResponse) => ({
                ...page,
                items: page.items.map((message) =>
                    message.id === messageId ? { ...message, ...updates } : message
                ),
            }));

            return {
                ...oldData,
                pages: newPages,
            };
        });
    };

    // Helper function to remove a message
    const removeMessage = (messageId: string) => {
        queryClient.setQueryData([queryKey, paramValue], (oldData: InfiniteMessagesData | undefined) => {
            if (!oldData) return oldData;

            const newPages = oldData.pages.map((page: MessagesResponse) => ({
                ...page,
                items: page.items.filter((message) => message.id !== messageId),
            }));

            return {
                ...oldData,
                pages: newPages,
            };
        });
    };

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        isLoading,
        // Helper functions for real-time updates
        addMessageOptimistically,
        updateMessage,
        removeMessage,
    };
};