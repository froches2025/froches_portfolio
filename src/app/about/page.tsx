import type { Metadata } from "next";
import { ContourLines } from "@/components/motion/contour-lines";
import { Entrance } from "@/components/motion/entrance";
import { DistanceCard } from "@/components/public/distance-card";
import { FactCard } from "@/components/public/fact-card";
import { PlaceholderFrame } from "@/components/public/placeholder-frame";
import { SiteLink } from "@/components/public/site-link";
import { Timeline, TimelineItem } from "@/components/public/timeline";
import { formatMonthRange, paragraphs } from "@/lib/content/format";
import { getAbout, getProfile } from "@/lib/content/queries";
import { hasResume, RESUME_HREF } from "@/lib/content/site";
import { publicStorageUrl } from "@/lib/content/storage";

export const metadata: Metadata = {
  title: "About · Favour Michael",
  description:
    "About Favour Michael: experience, education, leadership roles, skills and a few things about her.",
  alternates: { canonical: "/about" },
};

function Certificate({ path, name }: { path: string | null; name: string }) {
  if (!path) return null;
  return (
    <SiteLink
      href={publicStorageUrl("documents", path)}
      className="mi-link mt-2 inline-flex items-center gap-1.5 self-start text-[15px] font-semibold text-accent-text"
    >
      View certificate<span className="sr-only">: {name}</span>
    </SiteLink>
  );
}

const h2 = "text-[30px] font-extrabold tracking-[-0.03em] lg:text-[32px]";

// About (designs 07, 08 and 14; FR-3.1 to 3.4). Phone and desktop show the
// same cards and sections (FR-3.3, confirmed by Favour on 17 Nov).
export default async function AboutPage() {
  const [profile, about] = await Promise.all([getProfile(), getAbout()]);

  return (
    <div className="relative isolate">
      <section className="mx-auto flex max-w-[1120px] flex-wrap items-end gap-14 px-5 pt-6 lg:px-10 lg:pt-14">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4 lg:gap-5 lg:pb-[72px]">
          <Entrance>
            <h1 className="text-5xl font-extrabold tracking-[-0.04em] lg:text-[80px] lg:leading-[0.95] lg:tracking-[-0.045em]">
              <span className="lg:hidden">About</span>
              <span className="max-lg:hidden">Hi, I am Favour.</span>
            </h1>
          </Entrance>
          <Entrance
            order={1}
            className="flex max-w-[600px] flex-col gap-3.5 text-lg leading-[1.6]"
          >
            {paragraphs(profile.bio_md).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {profile.availability ? (
              <p className="max-lg:hidden">{profile.availability}</p>
            ) : null}
          </Entrance>
          <Entrance
            order={2}
            className="mt-2 flex flex-col gap-3 lg:flex-row lg:flex-wrap"
          >
            {hasResume(profile) ? (
              <a
                href={RESUME_HREF}
                className="mi-btn flex h-[52px] items-center justify-center rounded-[14px] bg-accent-fill px-[22px] text-[17px] font-bold text-on-accent lg:h-12 lg:text-base"
              >
                Download resume
              </a>
            ) : null}
            <a
              href={`mailto:${profile.email}`}
              className="mi-btn flex h-[52px] items-center justify-center rounded-[14px] border-[1.5px] border-ink px-[22px] text-[17px] font-semibold lg:h-12 lg:text-base"
            >
              Email me
            </a>
          </Entrance>
        </div>
        {/* FR-3.2: the page works without a headshot; the frame holds its place on desktop. */}
        <PlaceholderFrame className="hidden h-[440px] max-w-[360px] flex-[1_1_300px] rounded-t-[24px] rounded-b-none border-b-0 lg:block" />
      </section>

      <div
        aria-hidden="true"
        className="relative -mt-10 hidden h-[220px] lg:block"
      >
        <ContourLines className="-top-40 left-0 w-full" />
      </div>

      <div className="mx-auto max-w-[1120px] px-5 pb-6 lg:px-10">
        <section aria-labelledby="facts-heading" className="mt-12 lg:mt-6">
          <h2 id="facts-heading" className={`${h2} mb-4 lg:sr-only`}>
            A few things about me
          </h2>
          <ul className="flex flex-col gap-3.5 lg:grid lg:grid-flow-dense lg:grid-cols-3 lg:gap-5">
            <DistanceCard />
            {about.facts.map((fact) => (
              <FactCard key={fact.title} fact={fact} />
            ))}
          </ul>
        </section>

        <div className="lg:mt-20 lg:grid lg:grid-cols-2 lg:gap-x-16">
          {about.experience.length > 0 ? (
            <section
              aria-labelledby="experience-heading"
              className="mt-12 lg:mt-0"
            >
              <h2 id="experience-heading" className={`${h2} mb-5`}>
                Experience
              </h2>
              <Timeline>
                {about.experience.map((item) => (
                  <TimelineItem
                    key={`${item.organisation}-${item.start_month}`}
                    when={formatMonthRange(item.start_month, item.end_month)}
                    title={`${item.role}${item.engagement ? ` (${item.engagement})` : ""}`}
                    place={`${item.organisation}${item.location === "Remote" ? ", remote" : ""}`}
                  >
                    {item.bullets.length > 0 ? (
                      <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[15px] leading-[1.55]">
                        {item.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                    <Certificate
                      path={item.certificate_path}
                      name={item.organisation}
                    />
                  </TimelineItem>
                ))}
              </Timeline>
            </section>
          ) : null}

          <div>
            {about.education.length > 0 ? (
              <section
                aria-labelledby="education-heading"
                className="mt-12 lg:mt-0"
              >
                <h2 id="education-heading" className={`${h2} mb-5`}>
                  Education
                </h2>
                <Timeline>
                  {about.education.map((item) => (
                    <TimelineItem
                      key={item.programme}
                      when={item.period_label}
                      title={item.programme}
                      place={[item.institution, item.location]
                        .filter(Boolean)
                        .join(", ")}
                    >
                      {item.detail ? (
                        <p className="text-[15px] leading-[1.55]">
                          {item.detail}
                        </p>
                      ) : null}
                      <Certificate
                        path={item.certificate_path}
                        name={item.programme}
                      />
                    </TimelineItem>
                  ))}
                </Timeline>
              </section>
            ) : null}

            {about.roles.length > 0 ? (
              <section aria-labelledby="leadership-heading" className="mt-12">
                <h2 id="leadership-heading" className={`${h2} mb-5`}>
                  Leadership
                </h2>
                <Timeline>
                  {about.roles.map((role) => (
                    <TimelineItem
                      key={role.title}
                      when={formatMonthRange(role.start_month, role.end_month)}
                      title={
                        role.organisation
                          ? `${role.title}, ${role.organisation}`
                          : role.title
                      }
                    >
                      {role.detail ? (
                        <p className="text-[15px] leading-[1.55]">
                          {role.detail}
                        </p>
                      ) : null}
                    </TimelineItem>
                  ))}
                </Timeline>
              </section>
            ) : null}
          </div>
        </div>

        {about.skills.length > 0 ? (
          <section aria-labelledby="skills-heading" className="mt-12 lg:mt-20">
            <h2 id="skills-heading" className={`${h2} mb-5`}>
              Skills
            </h2>
            <dl className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:gap-x-6">
              {about.skills.map((group) => (
                <div key={group.group_name} className="contents">
                  <dt className="text-[15px] font-bold">{group.group_name}</dt>
                  <dd className="text-[15px] leading-normal max-lg:-mt-3">
                    {group.items.join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    </div>
  );
}
