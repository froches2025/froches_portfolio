export type ProjectStatus = "live" | "in-development" | "archived";

export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  description: string; // may be empty; detail page hides it
  stack: string[];
  status: ProjectStatus;
  liveUrl?: string;
  repoUrl?: string;
  images: {
    src: string; // path under /public/projects/
    alt: string;
  }[];
  featured: boolean;
  year: string;
}

export const projects: Project[] = [
  {
    slug: "aidready",
    title: "AidReady",
    oneLiner:
      "Built a voice-first emergency first-aid web app, largely solo, in one day; placed top 5 of 35 teams at the Frontiers GenAI Hackathon (ALX Kigali, powered by Google and DeepMind).",
    description:
      "Deployed AidReady Help Finder, an emergency facility locator, across two web servers behind an HAProxy load balancer.",
    stack: ["React", "JavaScript", "CSS"],
    status: "live",
    liveUrl: "https://aidready-finder.froches.tech",
    images: [],
    featured: true,
    year: "2026",
  },
  {
    slug: "lifetrack",
    title: "LifeTrack",
    oneLiner:
      "Designed and built a personal productivity PWA from a written PRD: React + TypeScript frontend, Python FastAPI backend, Supabase PostgreSQL, containerised with Docker and covered by unit tests.",
    description:
      "Implemented Google sign-in, a Goal to Target to Task hierarchy for SMART weekly planning, hourly activity logging and mood journaling. Integrated the Canvas LMS API (personal access token) to sync assignments, due dates and grades, and Web Push notifications for reminders.",
    stack: ["React", "TypeScript", "FastAPI", "Supabase PostgreSQL", "Docker"],
    status: "live",
    liveUrl: "https://lifetrack.froches.tech",
    images: [],
    featured: false,
    year: "2026",
  },
  {
    slug: "campusnav",
    title: "CampusNav AI",
    oneLiner:
      "Built a multi-tenant campus navigation system using Claude Vision to read maps and A* pathfinding for routes, with a React frontend.",
    description:
      "Designed offline-first, low-bandwidth behaviour for campuses with unreliable connectivity.",
    stack: ["React", "Claude Vision"],
    status: "in-development",
    repoUrl: "https://github.com/froches2025/alu-campus-navigator",
    images: [],
    featured: false,
    year: "2026",
  },
  {
    slug: "froches-pepper-sauce",
    title: "Froches Pepper Sauce",
    oneLiner:
      "Built and launched a live brand site for a West African pepper sauce business in Aug 2026, which made its first paying sale.",
    description: "",
    stack: ["React", "JavaScript", "CSS"],
    status: "live",
    liveUrl: "https://sauce.froches.tech",
    images: [],
    featured: false,
    year: "2026",
  },
];
