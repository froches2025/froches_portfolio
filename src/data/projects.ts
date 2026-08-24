export type ProjectStatus = "live" | "in-development" | "archived";

export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  description: string; // 2-4 sentence case study summary
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
    slug: "campusnav",
    title: "CampusNav",
    oneLiner: "A navigation tool for finding your way around the ALU campus.",
    // NOTE: light polish of Favour's one-line summary. Confirm/replace once repo +
    // screenshots are in hand — do not treat as final marketing copy yet.
    description:
      "CampusNav helps students and visitors navigate the ALU campus without getting lost, with the goal of extending to other large buildings where people commonly lose their way. Built with React, JavaScript, and CSS.",
    stack: ["React", "JavaScript", "CSS"],
    // CONFIRM with Favour: live/shipped or still in progress?
    status: "in-development",
    // NEEDED: live URL if deployed
    liveUrl: undefined,
    // NEEDED: GitHub repo URL
    repoUrl: undefined,
    // NEEDED: real homepage screenshot(s), placed at /public/projects/campusnav/
    images: [],
    featured: true,
    year: "2025",
  },

  // --- Template for adding future projects. Copy this block, fill it in, done. ---
  // {
  //   slug: "aidready",
  //   title: "AidReady",
  //   oneLiner: "",
  //   description: "",
  //   stack: [],
  //   status: "in-development",
  //   liveUrl: undefined,
  //   repoUrl: undefined,
  //   images: [],
  //   featured: false,
  //   year: "",
  // },
  //
  // Pending from Favour, do not fabricate copy for these — wait for real details:
  // - AidReady (AI-powered emergency first-aid app, currently concept/research stage)
  // - Froches Pepper Sauce landing page
  // - E-commerce bags shop
  // - E-commerce admin dashboard
];
