import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axios.get("/api/currentProfile");
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    throwOnError: false,
    refetchOnWindowFocus: false,
  });
};