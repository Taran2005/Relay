import { MemberRole } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { serverQueryKeys } from "./useServerData";

export const useUpdateMemberRole = (serverId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string; role: MemberRole }) => {
            const response = await axios.patch(`/api/members/${memberId}`, { role });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: serverQueryKeys.detail(serverId)
            });
        },
    });
};

export const useRemoveMember = (serverId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ memberId }: { memberId: string }) => {
            const response = await axios.delete(`/api/members/${memberId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: serverQueryKeys.detail(serverId)
            });
        },
    });
};

export const useBanMember = (serverId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ memberId }: { memberId: string }) => {
            await axios.post(`/api/members/${memberId}/ban`);
            const response = await axios.delete(`/api/members/${memberId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: serverQueryKeys.detail(serverId)
            });
        },
    });
};

export const useUnbanMember = (serverId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ banId }: { banId: string }) => {
            const response = await axios.delete(`/api/bans/${banId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: serverQueryKeys.detail(serverId)
            });
        },
    });
};