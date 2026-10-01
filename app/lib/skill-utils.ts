/**
 * Turn whatever the ORM returns for a timestamp (Date, Temporal.Instant, string)
 * into a plain ISO string that is safe to pass to client components.
 */
export function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  // Temporal.Instant#toString() can carry nanoseconds; trim to milliseconds
  // so every browser parses it.
  return String(value).replace(/(\.\d{3})\d+/, "$1");
}

/** Deterministic date format (UTC) so server and client render the same text. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

/** "Web Design Guidelines" -> "web-design-guidelines" */
export function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "skill";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
