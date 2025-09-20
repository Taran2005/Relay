import { useEffect, useState } from "react";
import { InviteModal } from "../modals/invite.modal";
import { ServerSettingsModal } from "../modals/server-settings.modal";
import { CreateServerModal } from "../modals/server.modal";
import { ManageMembersModal } from "../modals/manage-members.modal";


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
        </>
    );
};
