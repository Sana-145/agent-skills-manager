"use server";

import { db } from "@/prisma/db";
import { getCurrentUser } from "@/lib/auth";
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

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;
const MAX_CONTENT = 100_000;

/**
 * Server actions are public HTTP endpoints: anyone can call them with any
 * values, no matter what the form's maxLength / required attributes say.
 * So the same rules are enforced again here.
 */
function validate(
  input: SkillFormData
): { value: SkillFormData } | { error: string } {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const description =
    typeof input?.description === "string" ? input.description.trim() : "";
  const content = typeof input?.content === "string" ? input.content.trim() : "";

  if (!name || !description || !content) {
    return { error: "Name, description and content are required" };
  }
  if (name.length > MAX_NAME) {
    return { error: `Name must be ${MAX_NAME} characters or fewer` };
  }
  if (description.length > MAX_DESCRIPTION) {
    return { error: `Description must be ${MAX_DESCRIPTION} characters or fewer` };
  }
  if (content.length > MAX_CONTENT) {
    return { error: `Content must be ${MAX_CONTENT.toLocaleString("en-US")} characters or fewer` };
  }

  return { value: { name, description, content, isPublic: input.isPublic === true } };
}

// Note: none of these actions take a userId any more. The caller's identity
// comes from the signed auth cookie, which the browser cannot fake.

export async function createSkill(data: SkillFormData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please sign in to create a skill" };
    }

    const checked = validate(data);
    if ("error" in checked) {
      return { success: false, error: checked.error };
    }

    const skill = await db.orm.public.Skill.create({
      name: checked.value.name,
      description: checked.value.description,
      content: checked.value.content,
      isPublic: checked.value.isPublic,
      authorId: user.userId,
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
  data: SkillFormData
): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id)) {
      return { success: false, error: "Invalid skill" };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please sign in to edit a skill" };
    }

    const checked = validate(data);
    if ("error" in checked) {
      return { success: false, error: checked.error };
    }

    // Verify ownership
    const existing = await db.orm.public.Skill
      .select("authorId")
      .where({ id })
      .first();

    if (!existing || existing.authorId !== user.userId) {
      return { success: false, error: "Not authorized to edit this skill" };
    }

    // authorId is in the where clause too, so the update can only ever touch
    // a row that belongs to the signed-in user.
    await db.orm.public.Skill.where({ id, authorId: user.userId }).update({
      name: checked.value.name,
      description: checked.value.description,
      content: checked.value.content,
      isPublic: checked.value.isPublic,
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

export async function deleteSkill(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id)) {
      return { success: false, error: "Invalid skill" };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please sign in to delete a skill" };
    }

    // Verify ownership
    const existing = await db.orm.public.Skill
      .select("authorId")
      .where({ id })
      .first();

    if (!existing || existing.authorId !== user.userId) {
      return { success: false, error: "Not authorized to delete this skill" };
    }

    await db.orm.public.Skill.where({ id, authorId: user.userId }).delete();

    revalidatePath("/skills");
    revalidatePath(`/skills/${id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete skill error:", error);
    return { success: false, error: "Failed to delete skill" };
  }
}