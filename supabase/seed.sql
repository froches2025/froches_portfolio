-- Slice 1a content. Real content only: Favour's v1 data files at b79f85b
-- (synced to her resume on 12 Nov 2026), the About designs in docs/design/source/
-- and corrections Favour gave on 15 Nov 2026. Fields with no source stay empty.
-- Text is dollar-quoted so it matches the sources character for character.

insert into public.profile (full_name, headline, location, bio_md, email, github_url, linkedin_url, x_url)
values (
  'Favour Michael',
  'Software Engineer',
  'Kigali, Rwanda',
  $bio$I am a software engineer from Nigeria, studying Software Engineering at African Leadership University in Kigali as a Mastercard Foundation Scholar.

I have production frontend experience as the sole frontend developer on a paid AI video editing SaaS, and I build full-stack projects in React, TypeScript, Python (FastAPI) and PostgreSQL.

On campus I co-lead the Claude Builders Club and run weekly AI fluency workshops as a Claude Ambassador.$bio$,
  'f.michael@alustudent.com',
  'https://github.com/froches2025',
  'https://www.linkedin.com/in/froches',
  'https://x.com/froches_'
);

insert into public.projects
  (slug, title, one_liner, year, status, live_url, repo_url, stack, approach_md,
   is_published, is_featured, sort_order, featured_order)
values
  ('aidready', 'AidReady',
   $t$Built a voice-first emergency first-aid web app, largely solo, in one day; placed top 5 of 35 teams at the Frontiers GenAI Hackathon (ALX Kigali, powered by Google and DeepMind).$t$,
   2026, 'live', 'https://aidready-finder.froches.tech', null,
   array['React', 'JavaScript', 'CSS'],
   $t$Deployed AidReady Help Finder, an emergency facility locator, across two web servers behind an HAProxy load balancer.$t$,
   true, true, 1, 1),
  ('lifetrack', 'LifeTrack',
   $t$Designed and built a personal productivity PWA from a written PRD: React + TypeScript frontend, Python FastAPI backend, Supabase PostgreSQL, containerised with Docker and covered by unit tests.$t$,
   -- Temporary Vercel URL from v1; lifetrack.froches.tech did not resolve on 14 Nov 2026.
   2026, 'live', 'https://frontend-khaki-mu-72.vercel.app', null,
   array['React', 'TypeScript', 'FastAPI', 'Supabase PostgreSQL', 'Docker'],
   $t$Implemented Google sign-in, a Goal to Target to Task hierarchy for SMART weekly planning, hourly activity logging and mood journaling. Integrated the Canvas LMS API (personal access token) to sync assignments, due dates and grades, and Web Push notifications for reminders.$t$,
   true, true, 2, 2),
  ('campusnav', 'CampusNav AI',
   $t$Built a multi-tenant campus navigation system using Claude Vision to read maps and A* pathfinding for routes, with a React frontend.$t$,
   2026, 'in_development', null, 'https://github.com/froches2025/alu-campus-navigator',
   array['React', 'Claude Vision'],
   $t$Designed offline-first, low-bandwidth behaviour for campuses with unreliable connectivity.$t$,
   true, true, 3, 3),
  ('froches-pepper-sauce', 'Froches Pepper Sauce',
   $t$Built and launched a live brand site for a West African pepper sauce business in Aug 2026, which made its first paying sale.$t$,
   2026, 'live', 'https://sauce.froches.tech', null,
   array['React', 'JavaScript', 'CSS'],
   null,
   true, true, 4, 4);

insert into public.experience
  (role, organisation, location, engagement, start_month, end_month, bullets, sort_order)
values
  ('Teaching Assistant, Introduction to Python Programming', 'African Leadership University', 'Kigali', null,
   '2026-05-01', '2026-08-01',
   array[
     $t$Co-facilitated a Python fundamentals workshop for complete beginners, owning concept explanations and live coding.$t$,
     $t$Wrote a facilitator guide that co-facilitators used to run sessions consistently.$t$
   ], 1),
  ('Frontend Engineer', 'Fluencer', 'Remote', 'Contract',
   '2025-02-01', '2025-08-01',
   array[
     $t$Sole frontend developer for phase one of a subscription-based, AI-powered video editing platform, owning the Next.js App Router architecture (global auth, audio and toast providers) from first version to handover.$t$,
     $t$Built 20+ screens and a reusable component library with TypeScript, Tailwind CSS and Radix/shadcn UI, plus login, signup, password reset and profile flows using React Hook Form and Zod validation.$t$,
     $t$Managed client-side state with Zustand and wired Axios API services and Next.js middleware for secure, credit-based operations such as avatar training and video generation, with a WebSocket feed for live generation progress.$t$,
     $t$Integrated WaveSurfer.js audio recording, Three.js loading animations, payments and price-tier-based access; the client extended the contract into a second phase.$t$
   ], 2),
  ('Frontend Intern', 'HNG Internship (Cohort 11, frontend track)', 'Remote', null,
   '2024-07-01', '2024-09-01',
   array[
     $t$Finished all stages of a competitive remote internship that cuts participants each stage, shipping graded tasks on tight deadlines.$t$
   ], 3);

insert into public.education (programme, institution, location, period_label, detail, sort_order)
values
  ('BSc (Hons) Software Engineering', 'African Leadership University', 'Kigali',
   'Sep 2025 to 2029 (expected)', 'CGPA 4.37 / 5.0 · Mastercard Foundation Scholar', 1),
  ('ALX Software Engineering Program', 'ALX', null,
   'Feb 2023 to Sep 2024. Completed.', null, 2);

insert into public.roles (title, organisation, start_month, end_month, detail, sort_order)
values
  ('Co-Lead', 'Claude Builders Club ALU', '2026-02-01', null,
   $t$Organised a hackathon with 12 projects, 4 judges and a Demo Day, plus a Claude API key-sharing scheme so every team could build.$t$, 1),
  ('Claude Ambassador', 'Anthropic Ambassador Program', '2026-02-01', null,
   $t$Runs weekly activations and AI fluency workshops for students.$t$, 2),
  ('Host, weekly Twitter Spaces', 'X (@Froches_)', '2024-02-01', '2025-08-01',
   $t$Ran a Space on X (@Froches_) every weekend for almost two years, on tech and the mental health of techies.$t$, 3);

insert into public.skills (group_name, items, sort_order)
values
  ('Languages', array['Python', 'TypeScript', 'JavaScript', 'SQL'], 1),
  ('Frontend', array['React', 'Next.js', 'Tailwind CSS', 'PWAs', 'State management', 'Responsive UI'], 2),
  ('Backend', array['FastAPI', 'Django', 'Node.js', 'REST APIs', 'Authentication and authorization',
    'Payment integration', 'Unit testing (pytest, Jest, Vitest)'], 3),
  ('Data', array['PostgreSQL', 'Supabase', 'Firebase'], 4),
  ('DevOps', array['Docker', 'Linux', 'Git and GitHub', 'HAProxy load balancing', 'Multi-server deployment'], 5),
  ('AI', array['Claude API', 'Claude Vision', 'Vertex AI', 'Gemini API'], 6);

-- Desktop card order. Cards shown on both screens use the phone wording; the four
-- desktop-only cards use the desktop wording. Doodles from the phone design,
-- sizes from the desktop grid (cooking spans two columns, hackathon two rows).
insert into public.about_facts (title, body_md, link_url, link_label, doodle, size, sort_order)
values
  ('Top 5 of 35 teams',
   $t$At the Frontiers GenAI Hackathon, ALX Kigali. I built AidReady largely solo, in one day.$t$,
   '/projects/aidready', 'Read the case study', 'trophy', 'normal', 1),
  ('Mastercard Foundation Scholar',
   $t$Studying Software Engineering at African Leadership University, with a CGPA of 4.37 out of 5.0.$t$,
   null, null, null, 'normal', 2),
  ('I organised a hackathon',
   $t$As co-lead of the Claude Builders Club at ALU: 12 projects, 4 judges, a Demo Day, and shared Claude API keys so every team could build.$t$,
   null, null, 'bolt', 'tall', 3),
  ('I eat more pepper than the average Yoruba person',
   $t$Tested and confirmed. I also built the brand site for a West African pepper sauce business, and it made its first paying sale in August 2026.$t$,
   'https://sauce.froches.tech', 'sauce.froches.tech', 'pepper', 'normal', 4),
  ('Solo on the frontend',
   $t$I was the only frontend developer for phase one of a paid AI video editing platform. The client extended my contract into a second phase.$t$,
   null, null, null, 'normal', 5),
  ('I teach, too',
   $t$As a teaching assistant I co-facilitated Introduction to Python for complete beginners and wrote the guide the other facilitators used.$t$,
   null, null, null, 'normal', 6),
  ('Claude Ambassador',
   $t$I run weekly activations and AI fluency workshops for students on campus.$t$,
   null, null, null, 'normal', 7),
  ('My days run on weighted points',
   $t$I keep a mental checklist for almost everything, and every item carries points, positive and negative. Daily decisions end up feeling like a game.$t$,
   null, null, 'checklist', 'normal', 8),
  ('I ran a crochet business',
   $t$From 2021 to 2023, as @hooked2froches on Instagram.$t$,
   null, null, 'yarn', 'normal', 9),
  ('Sunday is for cooking',
   $t$I love cooking, so I host people at my house every Sunday just to share it.$t$,
   null, null, 'pot', 'wide', 10),
  ('I hosted Twitter Spaces every weekend',
   $t$For almost two years, from February 2024 to August 2025, on tech and the mental health of techies. Topics included “Is Networking Gold?”, “Physical vs Online Connections” and “Weekend Check-in: How are you doing?”$t$,
   null, null, 'mic', 'normal', 11);
