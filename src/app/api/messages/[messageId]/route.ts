import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { getSocketServer } from "@/lib/socket";
import { MessageWithMemberWithProfile } from "@/types/types";

async function handler(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return new NextResponse("Method not allowed", { status: 405 });
  }

  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { content } = await req.json();

    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId: serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    let message: MessageWithMemberWithProfile | null = null;

    if (req.method === "DELETE") {
      message = await db.message.findFirst({
        where: {
          id: messageId,
          channelId: channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!message || message.deleted) {
        return new NextResponse("Message not found", { status: 404 });
      }

      const isMessageOwner = message.memberId === member.id;
      const isAdmin = member.role === MemberRole.ADMIN;
      const isModerator = member.role === MemberRole.MODERATOR;
      const canModify = isMessageOwner || isAdmin || isModerator;

      if (!canModify) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      message = await db.message.update({
        where: {
          id: messageId,
        },
        data: {
          fileUrl: null,
          content: "This message has been deleted.",
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });

      const io = getSocketServer();
      if (io) {
        const updateKey = `chat:${channelId}:messages:update`;
        const channelKey = `chat:${channelId}:messages`;
        // ONLY emit to the specific channel room - NO broadcasting
        io.to(channelKey).emit(updateKey, message);
        console.log(`[SOCKET] Emitted message deletion to channel: ${channelKey}`);
      }
    }

    if (req.method === "PATCH") {
      message = await db.message.findFirst({
        where: {
          id: messageId,
          channelId: channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!message || message.deleted) {
        return new NextResponse("Message not found", { status: 404 });
      }

      const isMessageOwner = message.memberId === member.id;

      if (!isMessageOwner) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      if (!content) {
        return new NextResponse("Content missing", { status: 400 });
      }

      message = await db.message.update({
        where: {
          id: messageId,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });

      const io = getSocketServer();
      if (io) {
        const updateKey = `chat:${channelId}:messages:update`;
        const channelKey = `chat:${channelId}:messages`;
        // ONLY emit to the specific channel room - NO broadcasting
        io.to(channelKey).emit(updateKey, message);
        console.log(`[SOCKET] Emitted message edit to channel: ${channelKey}`);
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export { handler as DELETE, handler as PATCH };

