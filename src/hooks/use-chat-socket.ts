import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSocket } from "@/components/providers/socket.provider";
import { logger } from "@/lib/logger";
import { DirectMessage } from "@prisma/client";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
}

type MessageWithMemberWithProfile = (Message | DirectMessage) & {
  member: Member & {
    profile: Profile;
  }
};

interface InfiniteQueryData {
  pages: {
    items: MessageWithMemberWithProfile[];
  }[];
}

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    // Join the channel/room to receive messages
    const roomName = addKey; // addKey is 'chat:channelId:messages'
    
    // Ensure we're connected before joining
    if (socket.connected) {
      socket.emit('join-channel', roomName);
      console.log(`[CHAT_SOCKET] Joining room: ${roomName}`);
    } else {
      socket.on('connect', () => {
        socket.emit('join-channel', roomName);
        console.log(`[CHAT_SOCKET] Connected and joined room: ${roomName}`);
      });
    }

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: InfiniteQueryData) => {
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
        }
      })
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      logger.socket.message(message.id);
      console.log(`[CHAT_SOCKET] Received new message on ${addKey}:`, message.id);
      
      queryClient.setQueryData([queryKey], (oldData: InfiniteQueryData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{
              items: [message],
            }]
          }
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

      // Force invalidation to ensure React re-renders
      queryClient.invalidateQueries({
        queryKey: [queryKey]
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
      socket.emit('leave-channel', roomName);
    }
  }, [queryClient, addKey, queryKey, socket, updateKey]);
}
