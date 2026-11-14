import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // Vitest does not read .env.local; modules that validate env at import need a value.
    env: {
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    },
  },
});
