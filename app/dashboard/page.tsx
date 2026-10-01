"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { deleteSkill } from "@/actions/skills";
import SkillCard, { type SkillCardData } from "@/components/SkillCard";

type Filter = "all" | "public" | "private";

/**
 * Dashboard - Client Component with httpOnly cookie auth.
 * The filter buttons double as the stats: they show how many skills are
 * in each group.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [skills, setSkills] = useState<SkillCardData[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    const fetchUserSkills = async () => {
      try {
        const response = await fetch("/api/skills", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setSkills(data.skills || []);
        } else {
          setError("Couldn't load your skills. Refresh the page to try again.");
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
        setError("Couldn't load your skills. Check your connection and refresh.");
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchUserSkills();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!user || !confirm("Delete this skill? This can't be undone.")) return;

    setDeletingId(id);
    setError("");
    try {
      const result = await deleteSkill(id);
      if (result.success) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError(result.error || "Couldn't delete the skill.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Couldn't delete the skill. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: skills.length,
      public: skills.filter((s) => s.isPublic).length,
      private: skills.filter((s) => !s.isPublic).length,
    }),
    [skills]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (filter === "public" && !s.isPublic) return false;
      if (filter === "private" && s.isPublic) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    });
  }, [skills, filter, query]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "public", label: "Public" },
    { key: "private", label: "Private" },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">My skills</h1>
          <p className="mt-2 text-base-content/75">
            Signed in as {user?.name}. Public skills appear in the gallery; private ones stay here.
          </p>
        </div>
        <Link href="/dashboard/skills/new" className="btn btn-primary">
          New skill
        </Link>
      </header>

      {error && (
        <div className="alert alert-error mb-6" role="alert">
          <span>{error}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="join" role="group" aria-label="Filter by visibility">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`btn btn-sm join-item ${filter === key ? "btn-neutral" : ""}`}
            >
              {label}
              <span className="font-mono text-xs opacity-70">{counts[key]}</span>
            </button>
          ))}
        </div>

        <label className="input input-sm w-full sm:max-w-xs">
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
            placeholder="Search your skills"
            aria-label="Search your skills"
          />
        </label>
      </div>

      {loadingSkills ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-box border border-base-300 p-4">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-content/30 px-6 py-14 text-center">
          <h2 className="text-lg font-semibold">You haven&apos;t created a skill yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-base-content/70">
            Write your first SKILL.md and it will show up here.
          </p>
          <Link href="/dashboard/skills/new" className="btn btn-primary btn-sm mt-4">
            Create your first skill
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-content/30 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">No skills match</h2>
          <p className="mt-1 text-sm text-base-content/70">
            Try a different search or switch the visibility filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="btn btn-sm mt-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onDelete={handleDelete}
              isDeleting={deletingId === skill.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

