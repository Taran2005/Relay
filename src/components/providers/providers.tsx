"use client";

import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ModalProvider } from "./modal.provider";
import { SocketProvider } from "./socket.provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                    storageKey="relay-theme"
                >
                    <SocketProvider>
                        <ModalProvider />
                        <Toaster />
                        {children}
                    </SocketProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ClerkProvider>
    );
}
