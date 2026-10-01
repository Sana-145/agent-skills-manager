import Link from "next/link";

export const metadata = {
  title: "About | Agent Skills",
  description: "What Agent Skills is and what you can do with it",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold">About Agent Skills</h1>

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-base-content/80">
        <p>
          A skill is a folder with a SKILL.md file inside. The file starts with a name and a
          short description, followed by plain-markdown instructions that an AI coding agent
          can load when a task calls for them.
        </p>
        <p>
          This site is a home for those files. Write them in the browser, keep works in
          progress to yourself, and publish the ones you are happy with.
        </p>
      </div>

      <h2 className="mt-10 text-2xl font-bold">What you can do here</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-base-content/80">
        <li>Create, edit and delete your own skills.</li>
        <li>Mark each skill public or private.</li>
        <li>Search the public gallery by name, description or author.</li>
        <li>Preview, copy or download any public skill as a SKILL.md file.</li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/skills" className="btn btn-primary">
          Browse skills
        </Link>
        <Link href="/register" className="btn btn-outline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
