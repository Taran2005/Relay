import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { chatQueryKeys } from "@/hooks/use-send-message";

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
          queryKey: chatQueryKeys.infinite(channelId) 
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
          queryKey: chatQueryKeys.infinite(channelId) 
        });
      }
    },
  });
};