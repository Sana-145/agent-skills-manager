"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { copyText, downloadText, formatDate, slugify } from "@/lib/skill-utils";

export interface SkillCardData {
  id: number;
  name: string;
  description: string;
  content?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
}

interface SkillCardProps {
  skill: SkillCardData;
  /** Pass this to show Edit / Delete (owner view, used on the dashboard). */
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICON = {
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
  check: "M5 12l5 5L20 7",
  download: "M12 3v12 M7 10l5 5 5-5 M5 21h14",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  lock: "M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3",
};

export default function SkillCard({ skill, onDelete, isDeleting = false }: SkillCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const slug = slugify(skill.name);
  const hasContent = typeof skill.content === "string" && skill.content.length > 0;
  const isOwnerView = typeof onDelete === "function";

  const handleCopy = async () => {
    if (!skill.content) return;
    const ok = await copyText(skill.content);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const handleDownload = () => {
    if (!skill.content) return;
    downloadText(`${slug}-SKILL.md`, skill.content);
  };

  const openPreview = () => {
    setPreviewOpen(true);
    dialogRef.current?.showModal();
  };

  const copyLabel = copied ? "Copied" : "Copy";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-box bg-base-100 ${
        skill.isPublic
          ? "border border-base-300"
          : "border border-dashed border-base-content/40"
      }`}
    >
      {/* File-tab header: the file name, and whether the skill is visible to others */}
      <div className="flex items-center justify-between gap-3 border-b border-base-300 bg-base-200 px-4 py-2">
        <span className="truncate font-mono text-xs text-base-content/70" title={`${slug}/SKILL.md`}>
          {slug}/SKILL.md
        </span>
        {skill.isPublic ? (
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            Public
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-base-content/70">
            <Icon d={ICON.lock} />
            Private
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2 px-4 py-4">
        <h3 className="text-lg font-semibold leading-snug">
          {skill.isPublic ? (
            <Link href={`/skills/${skill.id}`} className="hover:underline">
              {skill.name}
            </Link>
          ) : hasContent ? (
            <button type="button" onClick={openPreview} className="text-left hover:underline">
              {skill.name}
            </button>
          ) : (
            skill.name
          )}
        </h3>
        <p className="line-clamp-3 text-sm text-base-content/75">{skill.description}</p>
      </div>

      <div className="space-y-3 border-t border-base-300 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/60">
          {skill.authorName && <span>By {skill.authorName}</span>}
          <span>Added {formatDate(skill.createdAt)}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {hasContent && (
            <div className="flex flex-wrap items-center gap-1">
              <button type="button" onClick={openPreview} className="btn btn-ghost btn-xs gap-1.5">
                <Icon d={ICON.eye} /> Preview
              </button>
              <button type="button" onClick={handleCopy} className="btn btn-ghost btn-xs gap-1.5">
                <Icon d={copied ? ICON.check : ICON.copy} /> {copyLabel}
              </button>
              <button type="button" onClick={handleDownload} className="btn btn-ghost btn-xs gap-1.5">
                <Icon d={ICON.download} /> Download
              </button>
            </div>
          )}

          {isOwnerView && (
            <div className="flex items-center gap-1">
              <Link href={`/dashboard/skills/${skill.id}/edit`} className="btn btn-ghost btn-xs">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => onDelete?.(skill.id)}
                className="btn btn-outline btn-error btn-xs"
                disabled={isDeleting}
              >
                {isDeleting ? <span className="loading loading-spinner loading-xs" /> : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview dialog */}
      {hasContent && (
        <dialog ref={dialogRef} className="modal" onClose={() => setPreviewOpen(false)}>
          <div className="modal-box max-w-3xl">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="truncate text-lg font-semibold">{skill.name}</h4>
                <p className="truncate font-mono text-xs text-base-content/60">{slug}/SKILL.md</p>
              </div>
              <form method="dialog">
                <button className="btn btn-ghost btn-sm">Close</button>
              </form>
            </div>

            {previewOpen && (
              <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap rounded-field border border-base-300 bg-base-200 p-4 font-mono text-sm">
                {skill.content}
              </pre>
            )}

            <div className="modal-action">
              <button type="button" onClick={handleCopy} className="btn btn-sm gap-1.5">
                <Icon d={copied ? ICON.check : ICON.copy} /> {copyLabel}
              </button>
              <button type="button" onClick={handleDownload} className="btn btn-primary btn-sm gap-1.5">
                <Icon d={ICON.download} /> Download SKILL.md
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button aria-label="Close preview">close</button>
          </form>
        </dialog>
      )}
    </article>
  );
}
