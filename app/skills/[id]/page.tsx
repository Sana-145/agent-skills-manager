import { SKILLS } from "../SKILLS";

type SkillPageProps = {
    params: {
        id: string; 
    };
};
export default async function SkillPage({
    params,
}: SkillPageProps) {
    const { id } = await params;

    const skill = SKILLS.find((skill) => skill.id === id);
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold underline">Skill: {skill?.name}</h1>
            <p className="text-lg">{skill?.description}</p>
            <p className="text-md text-gray-500">Category: {skill?.category}</p>
            <p className="text-sm text-gray-400">Created: {skill?.createdAt}</p>
            <p className="text-sm text-gray-400">Updated: {skill?.updatedAt}</p>
        </div>
    );
}