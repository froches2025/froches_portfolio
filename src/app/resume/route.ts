import { getProfile } from "@/lib/content/queries";
import { publicStorageUrl } from "@/lib/content/storage";

// FR-4.1: one stable URL for the latest resume. It reads the cached profile,
// so it is built once and needs no database call per visit. Slice 1b's resume
// upload revalidates the profile tag, which rebuilds this redirect.
export async function GET() {
  const profile = await getProfile();
  if (!profile.resume_path) {
    return new Response("No resume has been published yet.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return Response.redirect(
    publicStorageUrl("documents", profile.resume_path),
    307,
  );
}
