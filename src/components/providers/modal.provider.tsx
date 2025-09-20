import { useEffect, useState } from "react";
import { InviteModal } from "../modals/invite.modal";
import { CreateServerModal } from "../modals/server.modal";
import { ServerSettingsModal } from "../modals/server-settings.modal";


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
        </>
    );
};
