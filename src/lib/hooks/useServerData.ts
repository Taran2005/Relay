"use client";

import { ServerWithMembersAndProfile } from '@/types/types';
import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useServerData = (serverId: string) => {
    const { data, error, isLoading, mutate } = useSWR<ServerWithMembersAndProfile>(
        serverId ? `/api/servers/${serverId}` : null,
        fetcher
    );

    return {
        server: data,
        isLoading,
        error,
        mutate,
    };
};