export interface ExperienceEntry {
  role: string;
  org: string;
  orgUrl?: string;
  location?: string;
  start: string;
  end: string; // "Present" allowed
  bullets: string[];
}

export const experience: ExperienceEntry[] = [
  {
    role: "Frontend Engineer (Contract)",
    org: "Fluencer",
    location: "Remote",
    start: "Feb 2025",
    end: "Aug 2025",
    bullets: [
      "Sole frontend developer for phase one of a subscription-based, AI-powered video editing platform, owning the Next.js App Router architecture (global auth, audio and toast providers) from first version to handover.",
      "Built 20+ screens and a reusable component library with TypeScript, Tailwind CSS and Radix/shadcn UI, plus login, signup, password reset and profile flows using React Hook Form and Zod validation.",
      "Managed client-side state with Zustand and wired Axios API services and Next.js middleware for secure, credit-based operations such as avatar training and video generation, with a WebSocket feed for live generation progress.",
      "Integrated WaveSurfer.js audio recording, Three.js loading animations, payments and price-tier-based access; the client extended the contract into a second phase.",
    ],
  },
  {
    role: "Frontend Intern",
    org: "HNG Internship (Cohort 11)",
    location: "Remote",
    start: "Jul 2024",
    end: "Sep 2024",
    bullets: [
      "Finished all stages of a competitive remote internship that cuts participants each stage, shipping graded tasks on tight deadlines.",
    ],
  },
];
