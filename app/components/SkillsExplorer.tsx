"use client";

import { useMemo, useState } from "react";
import SkillCard, { type SkillCardData } from "@/components/SkillCard";

type SortKey = "newest" | "oldest" | "name";

export default function SkillsExplorer({ skills }: { skills: SkillCardData[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? skills.filter((s) =>
          [s.name, s.description, s.authorName ?? ""].some((field) =>
            field.toLowerCase().includes(q)
          )
        )
      : skills.slice();

    filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt);
      return sort === "newest" ? -diff : diff;
    });
    return filtered;
  }, [skills, query, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="input w-full sm:max-w-md">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 opacity-60"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, description or author"
            aria-label="Search skills"
          />
        </label>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="select w-full sm:w-44"
          aria-label="Sort skills"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name, A to Z</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-base-content/60" aria-live="polite">
        {results.length} {results.length === 1 ? "skill" : "skills"}
        {query.trim() ? ` matching “${query.trim()}”` : ""}
      </p>

      {results.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-content/30 px-6 py-12 text-center">
          <h3 className="text-lg font-semibold">
            {skills.length === 0 ? "No public skills yet" : "No skills match your search"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-base-content/70">
            {skills.length === 0
              ? "Skills that people mark as public will show up here."
              : "Try a shorter search, or clear it to see every public skill."}
          </p>
          {skills.length > 0 && (
            <button type="button" onClick={() => setQuery("")} className="btn btn-sm mt-4">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
