import { db } from "@/prisma/db";
import SkillsExplorer from "@/components/SkillsExplorer";
import type { SkillCardData } from "@/components/SkillCard";
import { toIso } from "@/lib/skill-utils";

/**
 * Skills gallery - ISR (Incremental Static Regeneration).
 * Rebuilt at most once a minute; your server actions also call
 * revalidatePath("/skills"), so new skills appear right after saving.
 */
export const revalidate = 60;

export const metadata = {
  title: "Browse skills | Agent Skills",
  description: "Explore public SKILL.md files shared by the community",
};

async function getPublicSkills() {
  return db.orm.public.Skill
    .where({ isPublic: true })
    .orderBy((skill) => skill.createdAt.desc())
    .include("author")
    .all();
}

export default async function SkillsPage() {
  const skills = await getPublicSkills();

  // Only plain, serializable values can be passed to the client component.
  const cards: SkillCardData[] = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    content: skill.content,
    isPublic: true,
    createdAt: toIso(skill.createdAt),
    authorName: skill.author.name,
  }));

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold">Browse skills</h1>
        <p className="mt-2 text-base-content/75">
          Public SKILL.md files shared here. Preview one, then copy it or download it into your
          agent&apos;s skills folder.
        </p>
      </header>

      <SkillsExplorer skills={cards} />
    </div>
  );
}
