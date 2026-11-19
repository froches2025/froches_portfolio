import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Array form: the more specific aliases must be matched before "@".
    alias: [
      // The real file is generated at build time and is absent in unit-test jobs.
      {
        find: "@/generated/project-slugs.json",
        replacement: fromRoot("./tests/unit/stubs/project-slugs.json"),
      },
      { find: "@", replacement: fromRoot("./src") },
      // Next.js resolves "server-only" itself; outside Next it needs a stand-in.
      {
        find: "server-only",
        replacement: fromRoot("./tests/unit/stubs/server-only.ts"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // Vitest does not read .env.local; modules that validate env at import need values.
    env: {
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      CRON_SECRET: "test-cron-secret-0123456789abcdef0123",
    },
    coverage: {
      provider: "v8",
      include: ["src/lib/**"],
      reporter: ["text", "html"],
      thresholds: { lines: 80 },
    },
  },
});
