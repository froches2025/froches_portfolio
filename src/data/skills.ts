export interface SkillGroup {
  category: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { category: "Core", items: ["React.js", "Next.js", "JavaScript", "TypeScript"] },
  {
    category: "Styling & UI",
    items: [
      "Tailwind CSS",
      "Radix UI",
      "Responsive Design",
      "Pixel-Perfect Implementation",
      "Cross-Browser Compatibility",
    ],
  },
  { category: "State & Data", items: ["Zustand", "Axios", "React Hook Form"] },
  { category: "Media & Interactive", items: ["Three.js", "WaveSurfer.js"] },
  { category: "Platform", items: ["Firebase"] },
  {
    category: "Practices",
    items: ["Agile Methodologies", "Debugging & Testing", "Collaboration", "Communication"],
  },
  // Backend/Python skills are newly acquired and not yet detailed — add a
  // "Backend" category here once Favour confirms specific tools/frameworks.
  // Do not guess Django/Flask/FastAPI etc. without confirmation.
];
