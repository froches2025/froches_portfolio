export interface SkillGroup {
  category: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { category: "Languages", items: ["Python", "TypeScript", "JavaScript", "SQL"] },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "PWAs", "State management", "Responsive UI"],
  },
  {
    category: "Backend",
    items: [
      "FastAPI",
      "Django",
      "Node.js",
      "REST APIs",
      "Authentication and authorization",
      "Payment integration",
      "Unit testing (pytest, Jest, Vitest)",
    ],
  },
  { category: "Data", items: ["PostgreSQL", "Supabase", "Firebase"] },
  {
    category: "DevOps",
    items: [
      "Docker",
      "Linux",
      "Git and GitHub",
      "HAProxy load balancing",
      "Multi-server deployment",
    ],
  },
  { category: "AI", items: ["Claude API", "Claude Vision", "Vertex AI", "Gemini API"] },
];
