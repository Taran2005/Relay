import { ServerWithMembersAndProfile } from "@/types/types";
import { create } from "zustand";

export type ModalType = "createServer" | "invite" | "serverSettings" | "manageMembers" | "deleteServer" | "leaveServer";


interface ModalState {
    type: ModalType | null;
    isOpen: boolean;
    data: ModalData;
    onOpen: (type: ModalType, data?: ModalData) => void;
    onClose: () => void;
}

interface ModalData {
    server?: ServerWithMembersAndProfile;
}

export const useModalStore = create<ModalState>((set) => ({
    type: null,
    isOpen: false,
    data: {},
    onOpen: (type: ModalType, data = {}) => set({ type, isOpen: true, data }),
    onClose: () => set({ type: null, isOpen: false }),
}));
