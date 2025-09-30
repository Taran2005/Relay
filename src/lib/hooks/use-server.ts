import { useUser } from "@clerk/nextjs";
import { useCreateServer } from "./use-create-server";
import { useLeaveServer } from "./use-leave-server";
import { useUpdateServer } from "./use-update-server";
import { useServerData } from "./useServerData";

interface UseServerOptions {
    serverId?: string;
}

export const useServer = ({ serverId }: UseServerOptions = {}) => {
    const { user } = useUser();

    // Read operations
    const { server, isLoading: serverLoading, error: serverError, mutate } = useServerData(serverId || "");

    // Write operations
    const createServerMutation = useCreateServer(user?.id);
    const createServer = createServerMutation.mutateAsync;
    const createLoading = createServerMutation.isPending;
    const createError = createServerMutation.error;
    const { updateServer, loading: updateLoading, error: updateError } = useUpdateServer(user?.id);
    const { leaveServer } = useLeaveServer(serverId || "", user?.id);

    // Combined loading and error states
    const isLoading = serverLoading || createLoading || updateLoading;
    const error = serverError || createError || updateError;

    return {
        // Data
        server,
        isLoading,
        error,

        // Operations
        createServer,
        updateServer,
        leaveServer,

        // Cache management
        mutate,

        // Computed values
        isAdmin: server?.members?.find(member => member.profile.userId === user?.id)?.role === "ADMIN",
        isModerator: ["ADMIN", "MODERATOR"].includes(
            server?.members?.find(member => member.profile.userId === user?.id)?.role || ""
        ),
        isMember: server?.members?.some(member => member.profile.userId === user?.id),
        isCreator: server?.creatorId === user?.id,
        currentMember: server?.members?.find(member => member.profile.userId === user?.id),
    };
};