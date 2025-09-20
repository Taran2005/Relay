import { useEffect, useState } from "react";
import { InviteModal } from "../modals/invite.modal";
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
        </>
    );
};
