import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-base-content/70 sm:flex-row sm:items-center sm:justify-between">
        <p>A shelf for the SKILL.md files your coding agents rely on.</p>
        <nav className="flex gap-4" aria-label="Footer">
          <Link href="/skills" className="hover:text-base-content">Browse skills</Link>
          <Link href="/about" className="hover:text-base-content">About</Link>
        </nav>
      </div>
    </footer>
  );
}
