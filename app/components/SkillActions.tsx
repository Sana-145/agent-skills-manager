"use client";

import { useState } from "react";
import { copyText, downloadText, slugify } from "@/lib/skill-utils";

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

const COPY = "M9 9h11v11H9z M5 15H4V4h11v1";
const CHECK = "M5 12l5 5L20 7";
const DOWNLOAD = "M12 3v12 M7 10l5 5 5-5 M5 21h14";

export default function SkillActions({ name, content }: { name: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(content);
    setFailed(!ok);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={handleCopy} className="btn btn-sm gap-2">
        <Icon d={copied ? CHECK : COPY} />
        {copied ? "Copied" : "Copy SKILL.md"}
      </button>
      <button
        type="button"
        onClick={() => downloadText(`${slugify(name)}-SKILL.md`, content)}
        className="btn btn-primary btn-sm gap-2"
      >
        <Icon d={DOWNLOAD} />
        Download
      </button>
      {failed && (
        <span className="text-sm text-error" role="alert">
          Couldn&apos;t copy. Select the text below and copy it manually.
        </span>
      )}
    </div>
  );
}
