import { create } from "zustand";

export type CallTargetType = "channel" | "conversation";

export interface CallTarget {
    type: CallTargetType;
    targetId: string;
    serverId?: string;
    roomHint?: string;
    startVideo?: boolean;
    title?: string | null;
}

interface CallState {
    isOpen: boolean;
    target?: CallTarget;
    open: (target: CallTarget) => void;
    close: () => void;
}

export const useCallStore = create<CallState>((set) => ({
    isOpen: false,
    target: undefined,
    open: (target) => set({ isOpen: true, target }),
    close: () => set({ isOpen: false, target: undefined }),
}));
