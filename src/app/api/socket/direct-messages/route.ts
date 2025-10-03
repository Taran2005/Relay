import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getSocketServer } from "@/lib/socket";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: {
        userId
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, fileUrl } = await request.json();
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID missing" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Content missing" }, { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            }
          },
          {
            memberTwo: {
              profileId: profile.id,
            }
          }
        ]
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          }
        },
        memberTwo: {
          include: {
            profile: true,
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
    }

    const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversationId,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          }
        }
      }
    });

    const channelKey = `chat:${conversationId}:messages`;

    const io = getSocketServer();
    if (io) {
      // ONLY emit to the specific conversation room - NO broadcasting to all users
      io.to(channelKey).emit(channelKey, message);
    } else {
      console.warn('[SOCKET] Socket server not available for direct message');
    }

    return NextResponse.json(message);
  } catch (error) {
    logger.error("[DIRECT_MESSAGES_POST]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}