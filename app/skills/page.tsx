import Link from "next/link";
import { SKILLS } from "./SKILLS";

export default function SkillsPage() {
  const skills = SKILLS
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">    
      <h1 className="text-4xl font-bold underline">Skills</h1>

    <ul>
      {skills.map((skill) => (
        <li key={skill.id} className="text-lg">
          <Link href={`/skills/${skill.id}`} className="text-blue-500 hover:underline">
            {skill.name}
          </Link>
        </li>
      ))}
    </ul>
    </div>
  );
}