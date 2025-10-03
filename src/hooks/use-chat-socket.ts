import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSocket } from "@/components/providers/socket.provider";
import { ChatMessage } from "@/types/types";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: QueryKey;
  meta?: {
    channelId?: string;
    conversationId?: string;
    serverId?: string;
  };
};

type MessageWithMemberWithProfile = ChatMessage;

interface InfiniteQueryData {
  pages: {
    items: MessageWithMemberWithProfile[];
    nextCursor?: string | null;
  }[];
}

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
  meta,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    const roomName = addKey;
    const joinPayload = {
      room: roomName,
      meta,
    };

    let connectHandler: (() => void) | undefined;

    if (socket.connected) {
      socket.emit('join-channel', joinPayload);
    } else {
      connectHandler = () => {
        socket.emit('join-channel', joinPayload);
      };
      socket.on('connect', connectHandler);
    }

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteQueryData | undefined>(queryKey, (oldData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            })
          }
        });

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    const messageHandler = (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteQueryData | undefined>(queryKey, (oldData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{
              items: [message],
              nextCursor: null,
            }],
          } as InfiniteQueryData;
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [
            message,
            ...newData[0].items,
          ]
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    socket.on(addKey, messageHandler);

    return () => {
      socket.off(addKey, messageHandler);
      socket.off(updateKey);
      if (connectHandler) {
        socket.off('connect', connectHandler);
      }
      socket.emit('leave-channel', roomName);
    };
  }, [addKey, meta, queryClient, queryKey, socket, updateKey]);
};
