import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { serverQueryKeys } from "./useServerData";

export const useDeleteServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const response = await axios.delete(`/api/servers/${serverId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all server-related queries
      queryClient.invalidateQueries({ queryKey: serverQueryKeys.all });
    },
  });
};

export const useRegenerateInvite = (serverId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.patch(`/api/servers/${serverId}/invite`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the specific server to get updated invite code
      queryClient.invalidateQueries({ 
        queryKey: serverQueryKeys.detail(serverId) 
      });
    },
  });
};

export const useLeaveServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const response = await axios.delete(`/api/servers/${serverId}/leave`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all server-related queries since user left a server
      queryClient.invalidateQueries({ queryKey: serverQueryKeys.all });
    },
  });
};