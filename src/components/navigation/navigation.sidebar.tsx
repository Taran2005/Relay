// NavigationSidebar.tsx

"use client";
import { FileUpload } from "@/components/fileupload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Server { id: string; name: string; imageUrl: string | null; }
const NavigationItem = ({ server, active }: { server: Server; active: boolean }) => (
  <Link
    href={`/servers/${server.id}`}
    className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all
      ${active
        ? "bg-emerald-500 text-white"
        : "bg-muted/30 text-foreground hover:bg-emerald-500 hover:text-white"}`}
    title={server.name}
  >
    {server.imageUrl
      ? <Image src={server.imageUrl} alt={server.name} width={48} height={48} className="rounded-inherit object-cover" />
      : <span className="text-lg font-semibold">{server.name.charAt(0).toUpperCase()}</span>
    }
    <span className={`absolute left-0 top-1/2 -translate-y-1/2 bg-emerald-500 rounded-r-full transition-all duration-300
      ${active ? "h-8 w-1" : "h-0 w-1 group-hover:h-5"}`} />
  </Link>
);

export function NavigationSidebar() {
  const [servers, setServers] = useState<Server[]>([]);
  const [profile, setProfile] = useState<{ id: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false),
    [name, setName] = useState(""),
    [imageUrl, setImageUrl] = useState<string | null>(null),
    [uploading, setUploading] = useState(false),
    [loading, setLoading] = useState(false);

  const disabled = loading || uploading || name.trim().length < 3;

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/currentProfile");
        const pf = response.ok ? await response.json() : null;
        setProfile(pf);
        if (pf) {
          const serversResponse = await fetch(`/api/servers?memberId=${pf.id}`);
          const sv = serversResponse.ok ? await serversResponse.json() : [];
          setServers(sv);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setProfile(null);
        setServers([]);
      }
    }
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setLoading(true);
    try {
      await axios.post("/api/servers", { name: name.trim(), imageUrl });
      setName(""); setImageUrl(null); setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); setUploading(false); }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center py-3 bg-background/60 backdrop-blur border-r">
        <div className="text-xs text-muted-foreground px-2 text-center">
          Sign in to view servers
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between py-3 bg-background/60 backdrop-blur border-r w-[72px]">
      <div className="flex flex-col items-center space-y-4">
        <Link href="/" className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 hover:bg-emerald-500 hover:text-white transition">
          <Image src="/vercel.svg" alt="Home" width={32} height={32} className="opacity-80 group-hover:opacity-100" />
        </Link>
        <div className="h-[2px] w-8 rounded-full bg-muted/40" />
        <div className="flex flex-col items-center space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-none">
          {servers.map(s => (
            <NavigationItem key={s.id} server={s} active={pathname?.startsWith(`/servers/${s.id}`)} />
          ))}
        </div>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 hover:bg-emerald-500 hover:text-white transition"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-background border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle>Create a Server</DialogTitle>
            <DialogDescription>Give your server a name and optional image.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 p-4">
            <div className="flex justify-center">
              <FileUpload value={imageUrl || ""} onChange={setImageUrl} endpoint="serverImage" onUploading={setUploading} />
            </div>
            <Input placeholder="Server name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading || uploading} />
            <Button type="submit" disabled={disabled} className="w-full">
              {uploading ? "Uploading..." : loading ? "Creating..." : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
