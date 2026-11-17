// Stands in for a screenshot or portrait until a real image exists (approved
// 17 Nov): the designed dashed frame with a faint contour motif and no text.
// Decorative, so screen readers skip it.
export function PlaceholderFrame({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-placeholder=""
      className={[
        "relative overflow-hidden rounded-[16px] border-[1.5px] border-dashed border-line bg-surface",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        fill="none"
        stroke="var(--contour)"
        strokeWidth={0.8}
      >
        <path d="M-10 90c30-22 52-6 80-18s40-40 72-36 48 20 70 14" />
        <path d="M-10 104c34-18 60-2 88-14s44-38 76-32 46 22 60 18" />
        <path d="M-10 76c26-24 46-10 72-22s38-42 70-40 50 18 80 10" />
        <path d="M120 30c10-8 26-6 30 4s-6 20-18 18-20-14-12-22z" />
      </svg>
    </div>
  );
}
