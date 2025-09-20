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
        const { searchParams } = new URL(req.url);
        const includeBans = searchParams.get("includeBans") === "true";

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
                ...(includeBans && {
                    bans: {
                        include: {
                            profile: true,
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                }),
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

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ serverId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { serverId } = await params;
        const { name, imageUrl } = await req.json();

        if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 30) {
            return new NextResponse("Invalid server name", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: "ADMIN"
                    },
                },
            },
            data: {
                name: name.trim(),
                imageUrl: imageUrl || null,
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ serverId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { serverId } = await params;

        // Check if user is the admin/creator of the server
        const server = await db.server.findUnique({
            where: {
                id: serverId,
                creatorId: profile.id,
            },
        });

        if (!server) {
            return new NextResponse("Server not found or insufficient permissions", { status: 404 });
        }

        // Delete the server (cascade will handle related records)
        await db.server.delete({
            where: {
                id: serverId,
            },
        });

        return new NextResponse("Server deleted successfully", { status: 200 });
    } catch (error) {
        console.log("[SERVER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}