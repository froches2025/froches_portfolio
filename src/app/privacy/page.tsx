import type { Metadata } from "next";
import { Entrance } from "@/components/motion/entrance";
import { getProfile } from "@/lib/content/queries";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "How this site handles your data: no trackers, no cookies, and a distance card that stores nothing.",
  path: "/privacy",
});

const h2 = "text-[22px] font-extrabold tracking-[-0.02em] lg:text-2xl";
const p = "text-[17px] leading-[1.6]";

// NFR-6. Copy approved by Favour on 23 Nov 2026. Every sentence describes what
// the code does today; slice 2 (contact form, guestbook, counts) must update
// this page in the same PR (technical-design section 4).
export default async function PrivacyPage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-4 px-5 pt-6 pb-16 lg:px-10 lg:pt-14">
      <Entrance>
        <h1 className="text-5xl font-extrabold tracking-[-0.04em] lg:text-[64px] lg:leading-none">
          Privacy
        </h1>
      </Entrance>
      <Entrance order={1} className="flex flex-col gap-8">
        <p className={p}>
          This is my portfolio. It is built to collect as little about you as
          possible.
        </p>

        <section aria-labelledby="not-heading" className="flex flex-col gap-3">
          <h2 id="not-heading" className={h2}>
            What this site does not do
          </h2>
          <ul className={`${p} flex list-disc flex-col gap-1.5 pl-5`}>
            <li>It has no analytics, trackers or ads.</li>
            <li>It sets no cookies.</li>
            <li>It has no accounts and no forms that send your details.</li>
            <li>It stores no IP addresses.</li>
          </ul>
        </section>

        <section
          aria-labelledby="distance-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="distance-heading" className={h2}>
            The distance card on About
          </h2>
          <p className={p}>
            The About page shows roughly how far you are from Kigali. Vercel,
            which hosts this site, adds an approximate location to each request,
            worked out from your IP address. The site turns that into a distance
            rounded to the nearest 10 km and sends only that number to your
            browser. If you are less than 50 km away, it shows no number at all.
            Your location is used once for that answer, and this site never
            stores or logs it.
          </p>
        </section>

        <section
          aria-labelledby="device-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="device-heading" className={h2}>
            Settings on your device
          </h2>
          <p className={p}>
            To decide how much animation to show, the site reads your
            reduced-motion and data-saver settings, your device&apos;s memory
            and its processor count. This happens in your browser, and nothing
            is sent anywhere.
          </p>
        </section>

        <section
          aria-labelledby="where-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="where-heading" className={h2}>
            Where the site runs
          </h2>
          <p className={p}>
            The site is hosted on Vercel. Its content, my resume and my
            certificates are stored with Supabase, so opening the resume or a
            certificate loads the file from Supabase. Fonts are served from this
            site, so your browser makes no requests to Google. Vercel and
            Supabase handle requests under their own privacy policies.
          </p>
        </section>

        <section
          aria-labelledby="contact-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="contact-heading" className={h2}>
            Contact
          </h2>
          <p className={p}>
            If you have a question about this page, email me at{" "}
            <a
              href={`mailto:${profile.email}`}
              className="font-semibold text-accent-text underline underline-offset-2"
            >
              {profile.email}
            </a>
            .
          </p>
        </section>

        <p className="text-[15px] text-muted">Last updated 23 Nov 2026.</p>
      </Entrance>
    </div>
  );
}
