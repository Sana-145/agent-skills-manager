"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "skills-theme";
type Theme = "skillslight" | "skillsdark";

function isTheme(value: string | null): value is Theme {
  return value === "skillslight" || value === "skillsdark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("skillslight");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage unavailable: fall back to the system preference
    }
    const initial: Theme = isTheme(saved)
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "skillsdark"
        : "skillslight";
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "skillslight" ? "skillsdark" : "skillslight";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const isDark = theme === "skillsdark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost btn-sm btn-square"
      aria-label={label}
      title={label}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isDark ? (
          <path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
