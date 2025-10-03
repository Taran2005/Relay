import { getChatQueryKey } from "@/hooks/use-send-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SendFileMessageData {
    content: string;
    fileUrl: string;
    apiUrl: string;
    query: Record<string, string>;
}

interface DeleteMessageData {
    apiUrl: string;
    query: Record<string, string>;
}

export const useSendFileMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ content, fileUrl, apiUrl, query }: SendFileMessageData) => {
            const url = new URL(apiUrl, window.location.origin);
            Object.entries(query).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const response = await axios.post(url.toString(), {
                content,
                fileUrl,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            const channelId = variables.query.channelId || variables.query.conversationId;
            if (channelId) {
                queryClient.invalidateQueries({
                    queryKey: [getChatQueryKey(channelId)]
                });
            }
        },
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ apiUrl, query }: DeleteMessageData) => {
            const url = new URL(apiUrl, window.location.origin);
            Object.entries(query).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const response = await axios.delete(url.toString());
            return response.data;
        },
        onSuccess: (data, variables) => {
            const channelId = variables.query.channelId || variables.query.conversationId;
            if (channelId) {
                queryClient.invalidateQueries({
                    queryKey: [getChatQueryKey(channelId)]
                });
            }
        },
    });
};

interface EditMessageData {
    content: string;
    apiUrl: string;
    query: Record<string, string>;
}

export const useEditMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ content, apiUrl, query }: EditMessageData) => {
            const url = new URL(apiUrl, window.location.origin);
            Object.entries(query).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const response = await axios.patch(url.toString(), { content });
            return response.data;
        },
        onSuccess: (data, variables) => {
            const channelId = variables.query.channelId || variables.query.conversationId;
            if (channelId) {
                queryClient.invalidateQueries({
                    queryKey: [getChatQueryKey(channelId)]
                });
            }
        },
    });
};