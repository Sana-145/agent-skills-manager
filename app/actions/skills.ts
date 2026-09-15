"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

interface SkillFormData {
  name: string;
  description: string;
  content: string;
  isPublic: boolean;
}

interface ActionResult {
  success: boolean;
  error?: string;
  skillId?: number;
}

export async function createSkill(
  data: SkillFormData,
  userId: number
): Promise<ActionResult> {
  try {
    const skill = await db.orm.public.Skill.create({
      name: data.name,
      description: data.description,
      content: data.content,
      isPublic: data.isPublic,
      authorId: userId,
    });

    revalidatePath("/skills");
    revalidatePath("/dashboard");

    return { success: true, skillId: skill.id };
  } catch (error) {
    console.error("Create skill error:", error);
    return { success: false, error: "Failed to create skill" };
  }
}

export async function updateSkill(
  id: number,
  data: SkillFormData,
  userId: number
): Promise<ActionResult> {
  try {
    // Verify ownership
    const existing = await db.orm.public.Skill
      .select("authorId")
      .where({ id })
      .first();

    if (!existing || existing.authorId !== userId) {
      return { success: false, error: "Not authorized to edit this skill" };
    }

    await db.orm.public.Skill.where({ id }).update({
      name: data.name,
      description: data.description,
      content: data.content,
      isPublic: data.isPublic,
    });

    revalidatePath("/skills");
    revalidatePath(`/skills/${id}`);
    revalidatePath("/dashboard");

    return { success: true, skillId: id };
  } catch (error) {
    console.error("Update skill error:", error);
    return { success: false, error: "Failed to update skill" };
  }
}

export async function deleteSkill(
  id: number,
  userId: number
): Promise<ActionResult> {
  try {
    // Verify ownership
    const existing = await db.orm.public.Skill
      .select("authorId")
      .where({ id })
      .first();

    if (!existing || existing.authorId !== userId) {
      return { success: false, error: "Not authorized to delete this skill" };
    }

    await db.orm.public.Skill.where({ id }).delete();

    revalidatePath("/skills");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete skill error:", error);
    return { success: false, error: "Failed to delete skill" };
  }
}