import type { NextConfig } from "next";

// A missing or malformed variable fails `next build`: importing env.ts checks
// the public variables, and parseServerEnv checks the server-only secrets.
import { parseServerEnv } from "./src/lib/env";

parseServerEnv(process.env);

const nextConfig: NextConfig = {};

export default nextConfig;
