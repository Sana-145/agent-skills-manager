import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/prisma/db";
import SkillActions from "@/components/SkillActions";
import { formatDate, slugify, toIso } from "@/lib/skill-utils";

/**
 * Skill detail page - dynamic route ([id]) with ISR.
 * Revalidates every 60 seconds.
 */
export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const skillId = parseInt(id);
  if (Number.isNaN(skillId)) return { title: "Skill not found" };

  // Only public skills: a private skill's name shouldn't leak through the tab title.
  const skill = await db.orm.public.Skill
    .where({ id: skillId, isPublic: true })
    .select("name", "description")
    .first();

  if (!skill) {
    return { title: "Skill not found" };
  }

  return {
    title: `${skill.name} | Agent Skills`,
    description: skill.description,
  };
}

async function getSkill(id: string) {
  const skillId = parseInt(id);
  if (Number.isNaN(skillId)) return null;

  return db.orm.public.Skill
    .where({ id: skillId, isPublic: true })
    .include("author")
    .first();
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { id } = await params;
  const skill = await getSkill(id);

  if (!skill) {
    notFound();
  }

  const slug = slugify(skill.name);
  const lineCount = skill.content.split("\n").length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Link href="/skills" className="btn btn-ghost btn-sm mb-6">
        Back to all skills
      </Link>

      <article>
        <header className="mb-6">
          <p className="font-mono text-sm text-base-content/60">{slug}/SKILL.md</p>
          <h1 className="mt-1 text-4xl font-bold">{skill.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-base-content/75">{skill.description}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-base-content/60">
            <span>By {skill.author.name}</span>
            <span>Added {formatDate(toIso(skill.createdAt))}</span>
            <span>Updated {formatDate(toIso(skill.updatedAt))}</span>
          </div>
        </header>

        <div className="mb-4">
          <SkillActions name={skill.name} content={skill.content} />
        </div>

        <div className="overflow-hidden rounded-box border border-base-300">
          <div className="flex items-center justify-between border-b border-base-300 bg-base-200 px-4 py-2 font-mono text-xs text-base-content/70">
            <span>SKILL.md</span>
            <span>{lineCount} lines</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap bg-base-100 p-5 font-mono text-sm leading-relaxed">
            {skill.content}
          </pre>
        </div>
      </article>
    </div>
  );
}
