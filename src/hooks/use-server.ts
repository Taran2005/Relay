import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useServer = (serverId: string | undefined, includeBans = false) => {
  return useQuery({
    queryKey: ["server", serverId, includeBans],
    queryFn: async () => {
      if (!serverId) return null;
      const res = await axios.get(`/api/servers/${serverId}?includeBans=${includeBans}`);
      return res.data;
    },
    enabled: !!serverId,
  });
};