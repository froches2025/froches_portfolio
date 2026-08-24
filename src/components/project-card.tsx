"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "LIVE",
  "in-development": "IN DEVELOPMENT",
  archived: "ARCHIVED",
};

export function ProjectCard({ project }: { project: Project }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), {
    stiffness: 200,
    damping: 20,
  });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={
          reduced
            ? undefined
            : { rotateX, rotateY, transformPerspective: 800 }
        }
        className="relative overflow-hidden rounded-lg border border-line bg-bg-panel p-6 transition-colors duration-150 group-hover:border-line"
      >
        {/* corner brackets */}
        <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t border-transparent transition-colors duration-200 group-hover:border-signal-amber" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r border-transparent transition-colors duration-200 group-hover:border-signal-amber" />

        <div className="flex items-center justify-between">
          <h3 className="font-mono text-lg font-bold text-text-primary">
            {project.title}
          </h3>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-text-secondary">
            {project.status === "live" && (
              <span className="h-1.5 w-1.5 rounded-full bg-status-nominal" />
            )}
            {STATUS_LABEL[project.status]}
          </span>
        </div>

        <p className="mt-3 text-sm text-text-secondary">{project.oneLiner}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-text-secondary"
            >
              {s}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
