import { currentProfile } from "@/lib/current.profile";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
