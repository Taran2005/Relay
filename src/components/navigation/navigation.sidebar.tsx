// NavigationSidebar.tsx

"use client";
import { ActionTooltip } from "@/components/action.tooltip";
import { FileUpload } from "@/components/fileupload";
import { ModeToggle } from "@/components/mode-toggle";
import { NavigationItem } from "@/components/navigation/navigation.item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateServer } from "@/lib/hooks/use-create-server";
import { UserButton } from "@clerk/nextjs";
import axios from 'axios';
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

interface Server { id: string; name: string; imageUrl: string | null; }

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function NavigationSidebar() {
  const [open, setOpen] = useState(false),
    [name, setName] = useState(""),
    [imageUrl, setImageUrl] = useState<string | null>(null),
    [uploading, setUploading] = useState(false);

  // Fetch profile and servers with SWR
  const { data: profile, error: profileError } = useSWR('/api/currentProfile', fetcher);
  const { data: servers, error: serversError } = useSWR(
    profile ? `/api/servers?memberId=${profile.id}` : null,
    fetcher
  );

  const { createServer, loading: creating, error: createError } = useCreateServer(profile?.id);

  const disabled = creating || uploading || name.trim().length < 3;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    try {
      await createServer({ name: name.trim(), imageUrl });
      setName(""); setImageUrl(null); setOpen(false);
    } catch {

    }
  };

  if (profileError || serversError) {
    return (
      <div className="flex flex-col items-center py-4 bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-xl border-r border-border/50 shadow-xl">
        <div className="text-xs text-muted-foreground px-3 text-center bg-muted/30 rounded-lg py-2 border border-border/30">
          Error loading data. Please try again.
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center py-4 bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-xl border-r border-border/50 shadow-xl">
        
      </div>
    );
  }

  return (
    <div className="flex h-full w-[72px] flex-col bg-gradient-to-b from-background/95 via-background/85 to-background/75 backdrop-blur-2xl border-r border-border/60 shadow-2xl relative overflow-hidden">
      {/* Subtle background pattern - more elegant */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/3 to-transparent opacity-30" />

      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-blue-400/20 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-purple-400/30 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/3 left-1/4 w-0.5 h-0.5 bg-blue-300/25 rounded-full animate-pulse delay-500" />
      </div>

      {/* Top section with Home button and separator */}
      <div className="flex flex-col items-center py-4 relative z-10 flex-shrink-0">
        <ActionTooltip side="right" align="center" label="Account">
          <Link
            href="/"
            className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/40 to-muted/30 hover:from-blue-500/70 hover:to-purple-600/70 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 border-2 border-muted-foreground/20 hover:border-blue-400/50 hover:ring-1 hover:ring-blue-400/30 overflow-hidden"
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 transition-all duration-300 group-hover:scale-110",
                },
              }}
            />
          </Link>
        </ActionTooltip>

        {/* Elegant separator */}
        <div className="h-[1px] w-6 bg-gradient-to-r from-transparent via-border to-transparent rounded-full mt-4" />
      </div>

      {/* Scrollable servers section */}
      <div className="flex-1 min-h-0 px-3 py-2 relative z-10 overflow-hidden">
        <div className="flex flex-col items-center gap-3 overflow-y-auto max-h-full scrollbar-none hover:scrollbar-thin transition-all duration-300 scroll-smooth py-1">
          {servers?.map((s: Server) => (
            <div key={s.id} className="flex-shrink-0">
              <NavigationItem id={s.id} name={s.name} imageUrl={s.imageUrl} />
            </div>
          )) || []}
        </div>
      </div>

      {/* Bottom section with Mode Toggle and Create button */}
      <div className="flex flex-col items-center py-4 space-y-3 relative z-10 flex-shrink-0">
        {/* Mode Toggle Button */}
        <ActionTooltip
          side="right"
          align="center"
          label="Toggle Theme"
        >
          <ModeToggle />
        </ActionTooltip>

        <ActionTooltip
          side="right"
          align="center"
          label="Add a Server"
        >
          <button
            onClick={() => setOpen(true)}
            className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/30 to-muted/20 hover:from-blue-500/70 hover:to-purple-600/70 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 border-2 border-muted-foreground/20 hover:border-blue-400/50 hover:ring-1 hover:ring-blue-400/30"
          >
            <Plus className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 group-hover:drop-shadow-sm" />
          </button>
        </ActionTooltip>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gradient-to-br from-background to-background/95 backdrop-blur-xl border border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Create a Server
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Give your server a name and optional image.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6 p-2">
            <div className="flex justify-center">
              <FileUpload value={imageUrl || ""} onChange={setImageUrl} endpoint="serverImage" onUploading={setUploading} />
            </div>
            <Input
              placeholder="Server name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating || uploading}
              className="bg-background/50 border-border/50 focus:border-blue-400/60 focus:ring-blue-400/30 transition-colors"
            />
            {createError && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                {createError}
              </p>
            )}
            <Button
              type="submit"
              disabled={disabled}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
            >
              {uploading ? "Uploading..." : creating ? "Creating..." : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
