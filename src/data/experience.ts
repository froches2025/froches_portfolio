export interface ExperienceEntry {
  role: string;
  org: string;
  orgUrl?: string;
  start: string;
  end: string; // "Present" allowed
  bullets: string[];
}

export const experience: ExperienceEntry[] = [
  {
    role: "Frontend Engineer",
    org: "Fluencer",
    start: "September 2024",
    end: "Present",
    bullets: [
      "Architected a Next.js 13 App Router layout with global providers (Auth, AudioRecorder, Toasts), boosting initial-load performance by 30%.",
      "Designed and built a reusable Tailwind + Radix UI component library (buttons, dialogs, inputs, popovers), enforcing design consistency across 50+ screens.",
      "Integrated WaveSurfer.js audio recording and Three.js 3D loading animations into the avatar/video generation flows.",
      "Built complex form workflows (login, signup, password reset, profile management) with React Hook Form, Zod validation, and Sonner notifications.",
      "Managed client-side state with Zustand stores for avatars, scripts, credits, and user profiles, eliminating UI flicker during updates.",
      "Wired Axios-based API services and Next.js middleware for secure, credit-based operations (avatar training, video generation), reducing frontend-backend integration bugs by 40%.",
      "Collaborated on performance tuning and code-splitting using dynamic imports and caching, maintaining sub-200ms route transitions.",
    ],
  },
  {
    role: "Lead Frontend Developer",
    org: "A-Shopper",
    start: "September 2024",
    end: "November 2024",
    bullets: [
      "Independently designed, developed, and implemented the entire frontend from scratch.",
      "Ensured cross-browser compatibility and responsiveness across devices.",
      "Integrated backend APIs to connect the frontend with server-side logic.",
      "Tested and debugged the application to guarantee performance and functionality.",
    ],
  },
  {
    role: "Frontend Developer Intern",
    org: "HNG Tech",
    start: "July 2024",
    end: "September 2024",
    bullets: [
      "Collaborated cross-functionally with backend developers, UI/UX designers, and project managers to deliver high-quality web applications.",
      "Implemented frontend features integrated with backend APIs.",
      "Built responsive, cross-browser-compatible user interfaces.",
      "Translated Figma designs into pixel-perfect Next.js code.",
      "Contributed to testing and debugging to ensure a smooth user experience.",
    ],
  },
  // OPEN QUESTION for Favour: Adclickgo (Community and Social Manager, Jul-Dec 2024) is on
  // the resume but it's a non-engineering role. Recommend leaving it off this "purely
  // technical" timeline and keeping it on the general resume/LinkedIn instead. Add it back
  // here only if Favour wants to show range.
];
