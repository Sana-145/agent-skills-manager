import Link from "next/link";

/**
 * Landing page - SSG (Static Site Generation).
 * No data fetching, so it is built once at compile time.
 */

const SAMPLE_SKILL = `---
name: commit-message-writer
description: Writes clear commit messages from a staged diff.
---

# Commit message writer

When asked for a commit message:

1. Read the staged diff, not the whole repo.
2. Start with a short summary line in the imperative.
3. Add a body only if the "why" isn't obvious.
`;

const STEPS = [
  {
    title: "Write it",
    body: "Use the editor to write a SKILL.md: a name, a one-line description, and the instructions your agent should follow.",
  },
  {
    title: "Choose who sees it",
    body: "Keep a skill private while you refine it, or make it public so it appears in the gallery.",
  },
  {
    title: "Take it with you",
    body: "Open any skill you own, or any public one, then copy it or download it into your agent's skills folder.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero: the thing this site is about is a file, so show the file */}
      <section className="border-b border-base-300">
        <div className="container mx-auto grid items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl">
              A shelf for your agent skills
            </h1>
            <p className="mt-6 max-w-xl text-lg text-base-content/75">
              Write SKILL.md files for your AI coding agents, keep them private or share them
              publicly, and grab any skill when you need it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/skills" className="btn btn-primary btn-lg">
                Browse skills
              </Link>
              <Link href="/register" className="btn btn-outline btn-lg">
                Create an account
              </Link>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-box border border-base-300 bg-base-100"
            aria-label="Example SKILL.md file"
          >
            <div className="flex items-center justify-between border-b border-base-300 bg-base-200 px-4 py-2 font-mono text-xs text-base-content/70">
              <span>commit-message-writer/SKILL.md</span>
              <span className="flex items-center gap-1.5 font-sans font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Public
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
              {SAMPLE_SKILL}
            </pre>
          </div>
        </div>
      </section>

      {/* How it works: a real sequence, so numbering is meaningful here */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t-2 border-primary pt-4">
              <p className="font-mono text-sm text-base-content/60">Step {index + 1}</p>
              <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-base-content/75">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-base-300 bg-base-200">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
          <p className="text-xl font-semibold">Have a skill worth keeping? Add it in a minute.</p>
          <Link href="/dashboard/skills/new" className="btn btn-primary">
            New skill
          </Link>
        </div>
      </section>
    </div>
  );
}
