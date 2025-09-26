import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Profile {
    id: string;
    userId: string;
    name: string;
    imageUrl: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export const useCurrentProfile = () => {
    return useQuery({
        queryKey: ['profile', 'current'],
        queryFn: async () => {
            const { data } = await axios.get('/api/currentProfile');
            return data as Profile;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });
};