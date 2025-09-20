import { Button } from "@/components/ui/button";
import { Slash } from "lucide-react";
import Link from "next/link";

export default function ServerNotFound() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 text-center p-8">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Slash className="h-10 w-10 opacity-60" />
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Server Not Found
        </h1>
      </div>
      <p className="max-w-md text-sm text-muted-foreground/80 leading-relaxed">
        The server you are trying to access doesn&apos;t exist or you don&apos;t have permission to view it.
        It may have been deleted, or you were removed from it.
      </p>
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <Button asChild variant="default" className="shadow">
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" className="border-dashed">
          <Link href="/setup">Create a Server</Link>
        </Button>
      </div>
    </div>
  );
}
