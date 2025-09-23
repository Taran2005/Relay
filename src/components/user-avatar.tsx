import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";

interface UserAvatarProps {
    src?: string | null;
    className?: string;
}

export const UserAvatar = ({ src, className }: UserAvatarProps) => {
    if (!src) {
        return (
            <div className={cn("h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center", className)}>
                <User className="h-4 w-4 text-white" />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt="User Avatar"
            width={32}
            height={32}
            className={cn("h-8 w-8 rounded-full", className)}
        />
    );
};