// src/generated/project-slugs.json is written by scripts/write-project-slugs.mjs
// before every build and is git-ignored. This declaration lets typecheck and
// lint run where the file has not been generated (they need no database).
declare module "@/generated/project-slugs.json" {
  const slugs: string[];
  export default slugs;
}
