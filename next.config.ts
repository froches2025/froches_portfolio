import type { NextConfig } from "next";

// Imported for its side effect: a missing or malformed variable fails `next build`.
import "./src/lib/env";

const nextConfig: NextConfig = {};

export default nextConfig;
