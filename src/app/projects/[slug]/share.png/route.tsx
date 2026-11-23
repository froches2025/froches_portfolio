import { getProjectBySlug, getProjectSlugs } from "@/lib/content/queries";
import { renderShareImage } from "@/lib/og/render";

// One share image per published case study (FR-10.3), at
// /projects/<slug>/share.png. A plain route handler rather than an
// opengraph-image file, so the page can give each image its own alt text
// (generateMetadata in ../page.tsx) and still have every image prerendered at
// build: the file convention needs generateImageMetadata for per-image alt,
// and its extra id segment stopped the build from prerendering. Unknown slugs
// never get here: src/proxy.ts answers them with the 404 first (NFR-4).
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return new Response("Not found", { status: 404 });
  return renderShareImage({
    title: project.title,
    subtitle: project.one_liner,
    footer: "Favour Michael · froches.tech",
  });
}
