import { useSocket } from "@/components/providers/socket.provider";
import { ChatMessage } from "@/types/types";
import { InfiniteData, QueryFunctionContext, QueryKey, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import qs from "query-string";

interface MessagesResponse {
  items: ChatMessage[];
  nextCursor: string | null;
}

type InfiniteMessagesData = InfiniteData<MessagesResponse, string | undefined>;

interface ChatQueryProps {
  queryKey: QueryKey;
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

  const fetchMessages = async ({ pageParam }: QueryFunctionContext<QueryKey>) => {
    const cursor = typeof pageParam === "string" ? pageParam : undefined;
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const { data } = await axios.get<MessagesResponse>(url);
    return data;
  };

  const query = useInfiniteQuery<MessagesResponse, Error>({
    queryKey,
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    refetchInterval: isConnected ? false : 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    initialPageParam: undefined,
    staleTime: 30 * 1000,
    enabled: Boolean(paramValue),
    throwOnError: false,
  });

  const addMessage = (newMessage: ChatMessage) => {
    queryClient.setQueryData<InfiniteMessagesData | undefined>(queryKey, (oldData) => {
      if (!oldData) {
        return {
          pageParams: [undefined],
          pages: [{ items: [newMessage], nextCursor: null }],
        } as InfiniteMessagesData;
      }

      const pages = [...oldData.pages];
      if (!pages.length) {
        pages.push({ items: [newMessage], nextCursor: null });
      } else {
        pages[0] = {
          ...pages[0],
          items: [newMessage, ...pages[0].items],
        };
      }

      return {
        ...oldData,
        pages,
      };
    });
  };

  const updateMessage = (message: ChatMessage) => {
    queryClient.setQueryData<InfiniteMessagesData | undefined>(queryKey, (oldData) => {
      if (!oldData) {
        return oldData;
      }

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          items: page.items.map((item) => (item.id === message.id ? message : item)),
        })),
      };
    });
  };

  const removeMessage = (messageId: string) => {
    queryClient.setQueryData<InfiniteMessagesData | undefined>(queryKey, (oldData) => {
      if (!oldData) {
        return oldData;
      }

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== messageId),
        })),
      };
    });
  };

  return {
    ...query,
    addMessage,
    updateMessage,
    removeMessage,
  };
};
