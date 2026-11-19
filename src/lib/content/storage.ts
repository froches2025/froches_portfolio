import { env } from "@/lib/env";

export type Bucket = "project-images" | "documents";

// Public buckets are served from a stable URL, so pages need no signed links.
export function publicStorageUrl(bucket: Bucket, path: string): string {
  const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, "");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
