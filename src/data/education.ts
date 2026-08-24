export interface EducationEntry {
  program: string;
  org: string;
  start: string;
  end: string;
  detail?: string;
}

export const education: EducationEntry[] = [
  {
    program: "BSc Software Engineering",
    org: "African Leadership University, Kigali, Rwanda",
    start: "September 2025",
    end: "November 2029 (expected)",
    // CONFIRM: which GPA scale (4.0 or 5.0)? state it explicitly once known.
    detail: "GPA 4.3",
  },
  {
    program: "Software Engineering Certificate",
    org: "ALX Africa",
    start: "2023",
    end: "2024",
  },
  {
    program: "Certificate of Completion, Frontend Internship",
    org: "HNG Tech",
    start: "July 2024",
    end: "September 2024",
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
    // NEEDED: which course/subject
    detail: undefined,
  },
  {
    role: "Claude Ambassador",
    org: "Anthropic",
    // OPTIONAL: add a line on what this involves day-to-day, in Favour's own words
    detail: undefined,
  },
];
