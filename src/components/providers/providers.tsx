"use client";

import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { ModalProvider } from "./modal.provider";
import { SocketProvider } from "./socket.provider";

export function Providers({ children }: { children: React.ReactNode }) {
    // ✅ Create stable QueryClient instance
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                retry: 2,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 1,
            },
        },
    }));

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
