export interface EducationEntry {
  program: string;
  org?: string;
  start?: string;
  end: string;
  detail?: string;
}

export const education: EducationEntry[] = [
  {
    program: "BSc (Hons) Software Engineering",
    org: "African Leadership University, Kigali",
    start: "Sep 2025",
    end: "2029 (expected)",
    detail: "CGPA 4.37 / 5.0 · Mastercard Foundation Scholar",
  },
  {
    program: "ALX Software Engineering Program",
    end: "Completed",
  },
];

export interface RoleEntry {
  role: string;
  org: string;
  detail?: string;
}

export const roles: RoleEntry[] = [
  {
    role: "Teaching Assistant",
    org: "African Leadership University",
    detail: "Introduction to Python Programming, May 2026 to Aug 2026",
  },
  {
    role: "Co-Lead",
    org: "Claude Builders Club ALU",
    detail:
      "Feb 2026 to present: organised a hackathon with 12 projects, 4 judges and a Demo Day, plus a Claude API key-sharing scheme so every team could build.",
  },
  {
    role: "Claude Ambassador",
    org: "Anthropic Ambassador Program",
    detail:
      "Feb 2026 to present: runs weekly activations and AI fluency workshops for students.",
  },
];
