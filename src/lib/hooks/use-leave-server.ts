import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

export const useLeaveServer = (serverId: string, profileId?: string) => {
    const { mutate } = useSWRConfig();

    const leaveServer = async () => {
        try {
            await axios.patch(`/api/servers/${serverId}/leave`);
            mutate(`/api/servers?memberId=${profileId}`);
            toast.success("Left server successfully!");
            // Note: Redirection will be handled in the component using SWR data
        } catch (error) {
            toast.error("Failed to leave server. Please try again.");
            console.error(error);
        }
    };

    return { leaveServer };
};