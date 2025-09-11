"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { ModalProvider } from "./modal.provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
                storageKey="relay-theme"
            >
                <ModalProvider />
                {children}
            </ThemeProvider>
        </ClerkProvider>
    );
}
