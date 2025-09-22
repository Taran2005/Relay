import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  className?: string;
}

export const UserAvatar = ({ src, className }: UserAvatarProps) => {
  return (
    <Image
      src={src ?? "/default-avatar.png"}
      alt="User Avatar"
      width={32}
      height={32}
      className={cn("h-8 w-8 rounded-full", className)}
    />
  );
};