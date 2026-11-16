import type { CSSProperties, ReactNode } from "react";

// One orchestrated entrance per page (FR-1.7). Pure CSS, so the content is in
// the server HTML and appears even before (or without) JavaScript; reduced
// motion and low-power mode show it in its final state at once.
export function Entrance({
  children,
  order = 0,
  className,
}: {
  children: ReactNode;
  order?: number;
  className?: string;
}) {
  return (
    <div
      className={["entrance", className].filter(Boolean).join(" ")}
      style={{ "--entrance-order": order } as CSSProperties}
    >
      {children}
    </div>
  );
}
