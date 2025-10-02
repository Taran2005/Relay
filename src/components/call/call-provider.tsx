"use client";

import { useEffect, useState } from "react";

import { CallOverlay } from "./call-overlay";

export const CallProvider = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return <CallOverlay />;
};
