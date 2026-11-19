"use client";

import { useEffect, useState } from "react";

export type Section = { id: string; label: string };

// Desktop home side navigation (FR-1.3): highlights the section in view.
// Plain anchors, so it works before JavaScript loads.
export function SectionNav({ sections }: { sections: readonly Section[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        // The first section, in page order, that crosses the reading band wins.
        const current = sections.find((section) => visible.get(section.id));
        if (current) setActiveId(current.id);
      },
      // A band around the upper middle of the viewport counts as "in view".
      { rootMargin: "-35% 0px -55% 0px" },
    );
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav aria-label="Sections" className="mt-6 hidden lg:block lg:short:mt-0">
      <ul>
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "location" : undefined}
                className={[
                  "group flex items-center gap-3.5 py-2.5 text-[15px]",
                  active ? "font-bold text-ink" : "font-medium text-muted",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "inline-block h-0.5 origin-left transition-[width] duration-200 motion-reduce:transition-none",
                    active ? "w-16 bg-accent-fill" : "w-8 bg-line group-hover:w-12",
                  ].join(" ")}
                />
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
