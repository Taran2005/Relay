import { ErrorBoundary } from "@/components/error-boundary";
import { Providers } from "@/components/providers/providers";
import { SocketStatus } from "@/components/socket-status";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Relay",
  description: "A modern Discord clone built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900 dark:bg-[#313338] dark:text-slate-50`)}
      >
        <Providers>
          <ErrorBoundary>
            {children}
            <SocketStatus />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
