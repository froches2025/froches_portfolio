import type { ProjectStatus } from "@/lib/validation/content";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2026-05-01" -> "May 2026". Dates are calendar months, read without time zones.
export function formatMonth(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  return `${MONTHS[(month ?? 1) - 1]} ${year}`;
}

// "May 2026 to Aug 2026", or "Feb 2026 to present" when there is no end.
export function formatMonthRange(start: string, end: string | null): string {
  return `${formatMonth(start)} to ${end ? formatMonth(end) : "present"}`;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "Live",
  in_development: "In development",
  archived: "Archived",
};

export function statusLabel(status: ProjectStatus): string {
  return STATUS_LABELS[status];
}

// Markdown fields hold plain paragraphs separated by blank lines; there is no
// Markdown renderer (a new library would need approval).
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function isExternalLink(href: string): boolean {
  return /^https:\/\//.test(href);
}
