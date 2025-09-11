import { CreateServerModal } from "../modals/server.modal";
import { useEffect , useState } from "react";


export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    return (
        <>
            {isMounted && <CreateServerModal />}
        </>
    );
};
