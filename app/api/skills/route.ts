import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get token from httpOnly cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skills = await db.orm.public.Skill
      .where({ authorId: payload.userId })
      .orderBy((skill) => skill.createdAt.desc())
      .select("id", "name", "description", "isPublic", "createdAt")
      .all();

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}