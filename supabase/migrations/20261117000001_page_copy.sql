-- Page copy the approved designs show but slice 1a's first schema did not hold
-- (decided with Favour on 17 Nov 2026). New columns only; RLS is unchanged.
--
-- tagline and pitch are required. No text is back-filled: the tables are
-- empty when this runs (production is seeded after this migration). If rows
-- ever exist without them, `set not null` fails loudly instead of inventing copy.

alter table public.projects
  add column tagline text check (char_length(tagline) between 1 and 80),
  add column highlight text check (char_length(highlight) between 1 and 120),
  add column live_label text check (char_length(live_label) between 1 and 40),
  add column repo_label text check (char_length(repo_label) between 1 and 40),
  add column built_at text check (char_length(built_at) between 1 and 80);

alter table public.projects alter column tagline set not null;

alter table public.profile
  add column pitch text check (char_length(pitch) between 1 and 240),
  add column availability text check (char_length(availability) between 1 and 160);

alter table public.profile alter column pitch set not null;
