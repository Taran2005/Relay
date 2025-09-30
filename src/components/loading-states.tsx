"use client";

import { Loader2, Server, Hash, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text,
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Server-specific loading states
export const ServerSidebarSkeleton = () => (
  <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
    <div className="flex items-center justify-center h-12 border-b border-border/50">
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="flex-1 px-3 py-2 space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-5/6" />
      <div className="pt-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-1" />
        <Skeleton className="h-6 w-4/5 mb-1" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </div>
  </div>
);

export const ChatMessagesSkeleton = () => (
  <div className="flex-1 space-y-4 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const ServerListSkeleton = () => (
  <div className="space-y-2 p-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Full page loading state
export const PageLoadingState = ({ 
  message = "Loading...",
  icon: Icon = Loader2 
}: { 
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <div className="flex items-center gap-3">
      <Icon className="h-8 w-8 animate-spin text-primary" />
      <span className="text-lg font-medium">{message}</span>
    </div>
  </div>
);

// Context-aware loading states
export const ServerLoadingState = () => (
  <PageLoadingState message="Loading server..." icon={Server} />
);

export const ChannelLoadingState = () => (
  <PageLoadingState message="Loading channel..." icon={Hash} />
);

export const MembersLoadingState = () => (
  <PageLoadingState message="Loading members..." icon={Users} />
);