// Prints one row per Lighthouse run so CI logs keep the scores; LHCI only prints pass or fail.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? ".lighthouseci";
const files = readdirSync(dir).filter((name) => /^lhr-.*\.json$/.test(name));

const percent = (score) => Math.round(score * 100);
const ms = (audit) => `${Math.round(audit.numericValue)} ms`;

const rows = files.map((name) => {
  const report = JSON.parse(readFileSync(join(dir, name), "utf8"));
  const { categories: c, audits: a } = report;
  return [
    percent(c.performance.score),
    percent(c.accessibility.score),
    percent(c["best-practices"].score),
    percent(c.seo.score),
    ms(a["first-contentful-paint"]),
    ms(a["largest-contentful-paint"]),
    ms(a["total-blocking-time"]),
    ms(a["speed-index"]),
    a["cumulative-layout-shift"].numericValue.toFixed(3),
    Math.round(report.environment.benchmarkIndex),
  ];
});

const header = [
  "Performance",
  "Accessibility",
  "Best practices",
  "SEO",
  "FCP",
  "LCP",
  "TBT",
  "Speed Index",
  "CLS",
  "CPU benchmark",
];

console.log(`| Run | ${header.join(" | ")} |`);
console.log(`| --- | ${header.map(() => "---").join(" | ")} |`);
rows.forEach((row, index) =>
  console.log(`| ${index + 1} | ${row.join(" | ")} |`),
);
