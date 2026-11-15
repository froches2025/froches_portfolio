import "server-only";
import { parseServerEnv } from "@/lib/env";

export const serverEnv = parseServerEnv({
  CRON_SECRET: process.env.CRON_SECRET,
});
