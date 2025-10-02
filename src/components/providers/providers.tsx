"use client";

import { ErrorBoundary } from "@/components/error-boundary-improved";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { CallProvider } from "../call/call-provider";
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
        <ErrorBoundary>
            <ClerkProvider
                publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
                appearance={{
                    baseTheme: undefined,
                    variables: {
                        colorPrimary: '#5865f2',
                    },
                }}
                afterSignOutUrl="/"
                signInFallbackRedirectUrl="/"
                signUpFallbackRedirectUrl="/"
            >
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
                            <CallProvider />
                            <Toaster />
                            {children}
                        </SocketProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </ClerkProvider>
        </ErrorBoundary>
    );
}
