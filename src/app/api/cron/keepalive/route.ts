import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { serverEnv } from "@/lib/server-env";
import { createPublicSupabase } from "@/lib/supabase/server";

// Called daily by .github/workflows/keepalive.yml so the Supabase Free project
// never reaches its one-week idle pause (NFR-4).
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  if (
    !isAuthorizedCronRequest(
      request.headers.get("authorization"),
      serverEnv.CRON_SECRET,
    )
  ) {
    return Response.json({ ok: false }, { status: 401, headers: NO_STORE });
  }

  const { error } = await createPublicSupabase()
    .from("profile")
    .select("singleton")
    .limit(1);

  if (error) {
    return Response.json({ ok: false }, { status: 503, headers: NO_STORE });
  }
  return Response.json({ ok: true }, { headers: NO_STORE });
}
