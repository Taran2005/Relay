import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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

export const chatQueryKeys = {
  all: ['chat'] as const,
  lists: () => [...chatQueryKeys.all, 'list'] as const,
  list: (channelId: string) => [...chatQueryKeys.lists(), channelId] as const,
  infinite: (channelId: string) => [...chatQueryKeys.all, 'infinite', channelId] as const,
} as const;

export const useSendMessage = () => {
  const queryClient = useQueryClient();

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

      const queryKey = chatQueryKeys.infinite(channelId);
      
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
        memberId: 'current-member', // This should come from current user context
        channelId: query.channelId,
        conversationId: query.conversationId,
        member: {
          id: 'current-member',
          profileId: 'current-profile',
          profile: {
            id: 'current-profile',
            name: 'You',
            imageUrl: null,
          },
        },
      };

      // Optimistically add message to infinite query
      queryClient.setQueryData(queryKey, (old: unknown) => {
        const data = old as { pages?: { items?: Message[] }[] };
        if (!data?.pages?.length) return old;
        
        const newPages = [...data.pages];
        if (newPages[0]?.items) {
          newPages[0] = {
            ...newPages[0],
            items: [optimisticMessage, ...newPages[0].items],
          };
        }
        
        return { ...data, pages: newPages };
      });

      return { previousMessages };
    },

    onError: (err, variables, context) => {
      const channelId = variables.query.channelId || variables.query.conversationId;
      if (!channelId || !context?.previousMessages) return;

      // Rollback optimistic update
      queryClient.setQueryData(
        chatQueryKeys.infinite(channelId),
        context.previousMessages
      );
    },

    onSettled: (data, error, variables) => {
      const channelId = variables.query.channelId || variables.query.conversationId;
      if (!channelId) return;

      // Refetch to get the real message from server
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.infinite(channelId) 
      });
    },
  });
};