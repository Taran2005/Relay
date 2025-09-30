import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useServers = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["servers", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const res = await axios.get(`/api/servers?memberId=${profileId}`);
      return res.data;
    },
    enabled: !!profileId,
  });
};