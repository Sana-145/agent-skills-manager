import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { verifyToken } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const skillId = parseInt(id);

    if (isNaN(skillId)) {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 });
    }

    // Get token from httpOnly cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skill = await db.orm.public.Skill
      .where({ id: skillId })
      .select("id", "name", "description", "content", "isPublic", "authorId", "createdAt", "updatedAt")
      .first();

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Check ownership
    if (skill.authorId !== payload.userId) {
      return NextResponse.json(
        { error: "Not authorized to edit this skill" },
        { status: 403 }
      );
    }

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Get skill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}