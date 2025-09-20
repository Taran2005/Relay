"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ServerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    console.error("Server route error:", error);
  }, [error]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 text-center p-8">
      <div className="flex items-center gap-3 text-red-500/80">
        <AlertTriangle className="h-10 w-10" />
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
      </div>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        An unexpected error occurred while loading this server. You can try again or go back home.
      </p>
      <div className="flex gap-3 flex-wrap items-center justify-center">
        <Button onClick={() => reset()} variant="default">Try Again</Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-lg text-left whitespace-pre-wrap text-xs bg-muted/40 p-4 rounded-lg border border-border/50 overflow-auto">
          {error.message}
          {error.digest ? `\nDigest: ${error.digest}` : ""}
        </pre>
      )}
    </div>
  );
}
