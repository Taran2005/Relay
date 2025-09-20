import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ serverId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { serverId } = await params;

        const server = await db.server.findUnique({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                    },
                },
            },
            include: {
                channels: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc",
                    },
                },
            },
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}