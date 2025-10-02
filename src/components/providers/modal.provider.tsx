import { useEffect, useState } from "react";
import { CreateChannelModal } from "../modals/create-channel.modal";
import { DeleteChannelModal } from "../modals/delete-channel.modal";
import { DeleteMessageModal } from "../modals/delete-message.modal";
import { DeleteServerModal } from "../modals/delete-server.modal";
import { EditChannelModal } from "../modals/edit-channel.modal";
import { InviteModal } from "../modals/invite.modal";
import { LeaveServerModal } from "../modals/leave-server.modal";
import { ManageMembersModal } from "../modals/manage-members.modal";
import { ServerSettingsModal } from "../modals/server-settings.modal";
import { CreateServerModal } from "../modals/server.modal";


export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    return (
        <>
            {isMounted && <CreateServerModal />}
            {isMounted && <InviteModal />}
            {isMounted && <ServerSettingsModal />}
            {isMounted && <ManageMembersModal />}
            {isMounted && <CreateChannelModal />}
            {isMounted && <EditChannelModal />}
            {isMounted && <DeleteChannelModal />}
            {isMounted && <DeleteServerModal />}
            {isMounted && <LeaveServerModal />}
            {isMounted && <DeleteMessageModal />}
        </>
    );
};
