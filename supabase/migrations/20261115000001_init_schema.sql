-- Slice 1a schema (technical-design section 2). RLS policies are in the next
-- migration and Storage in the one after, so each concern reviews on its own.

-- Private schema: not exposed through the Data API, holds configuration and helpers.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.settings (
  key text primary key,
  value text not null
);
-- No policies on purpose: only definer functions read it.
alter table private.settings enable row level security;
revoke all on private.settings from public, anon, authenticated;

-- Favour's permanent GitHub user ID (gh api users/froches2025 --jq .id). A
-- username can change; this ID cannot. GitHub user IDs are public.
insert into private.settings (key, value) values ('admin_github_id', '239020475');

-- True only for the signed-in user whose GitHub identity matches the admin ID.
-- Reads auth.identities, never user_metadata, because users can edit their own metadata.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.identities as i
    where i.user_id = auth.uid()
      and i.provider = 'github'
      and i.provider_id = (
        select s.value from private.settings as s where s.key = 'admin_github_id'
      )
  );
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- CHECK constraints cannot run subqueries, so array element rules live in an immutable helper.
create function private.text_array_ok(arr text[], max_items integer, max_length integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(cardinality(arr), 0) <= max_items
    and not exists (
      select 1 from unnest(arr) as item
      where item is null or char_length(item) > max_length
    );
$$;

-- profile: exactly one row (singleton is the primary key and must be true).
create table public.profile (
  singleton boolean primary key default true check (singleton),
  id uuid not null unique default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 80),
  headline text not null check (char_length(headline) between 1 and 120),
  location text check (char_length(location) <= 80),
  bio_md text not null check (char_length(bio_md) between 1 and 4000),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  github_url text check (github_url ~ '^https://.+'),
  linkedin_url text check (linkedin_url ~ '^https://.+'),
  x_url text check (x_url ~ '^https://.+'),
  resume_path text,
  resume_updated_at timestamptz,
  headshot_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 80),
  one_liner text not null check (char_length(one_liner) between 1 and 200),
  year smallint not null check (year between 2015 and 2100),
  status text not null check (status in ('live', 'in_development', 'archived')),
  live_url text check (live_url ~ '^https://.+'),
  repo_url text check (repo_url ~ '^https://.+'),
  stack text[] not null default '{}' check (private.text_array_ok(stack, 12, 30)),
  problem_md text check (char_length(problem_md) <= 4000),
  role_md text check (char_length(role_md) <= 4000),
  approach_md text check (char_length(approach_md) <= 4000),
  challenges_md text check (char_length(challenges_md) <= 4000),
  outcome_md text check (char_length(outcome_md) <= 4000),
  is_published boolean not null default false,
  published_at timestamptz,
  is_featured boolean not null default false,
  sort_order integer not null,
  featured_order integer check (featured_order between 1 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_featured_order_matches check (is_featured = (featured_order is not null)),
  -- Deferred so a reorder can swap two positions inside one transaction.
  constraint projects_sort_order_key unique (sort_order) deferrable initially deferred,
  -- NULLs are distinct, so only featured rows compete for 1 to 4.
  constraint projects_featured_order_key unique (featured_order) deferrable initially deferred
);

-- At most 4 featured projects (FR-1.2). featured_order 1 to 4 plus uniqueness
-- already caps it at commit; the trigger rejects a 5th at once with a clear message.
create function private.enforce_featured_limit()
returns trigger
language plpgsql
-- Definer so the count sees every row, not only those the caller's RLS shows.
security definer
set search_path = ''
as $$
begin
  if new.is_featured then
    -- Serialises concurrent featuring so two sessions cannot both see 3.
    perform pg_advisory_xact_lock(hashtext('public.projects.is_featured'));
    if (
      select count(*) from public.projects as p
      where p.is_featured and p.id <> new.id
    ) >= 4 then
      raise exception 'At most 4 projects can be featured'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create function private.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Set on first publish only; unpublishing keeps the original date.
  if new.is_published and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger projects_featured_limit
  before insert or update of is_featured on public.projects
  for each row execute function private.enforce_featured_limit();

create trigger projects_published_at
  before insert or update of is_published on public.projects
  for each row execute function private.set_published_at();

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  storage_path text not null unique check (char_length(storage_path) >= 1),
  alt text not null check (char_length(alt) between 1 and 200),
  caption text check (char_length(caption) <= 200),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_images_sort_order_key unique (project_id, sort_order) deferrable initially deferred
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null check (char_length(role) >= 1),
  organisation text not null check (char_length(organisation) >= 1),
  org_url text check (org_url ~ '^https://.+'),
  location text,
  engagement text,
  start_month date not null,
  -- Empty means present.
  end_month date check (end_month >= start_month),
  bullets text[] not null default '{}' check (private.text_array_ok(bullets, 8, 300)),
  certificate_path text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experience_sort_order_key unique (sort_order) deferrable initially deferred
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  programme text not null check (char_length(programme) >= 1),
  institution text not null check (char_length(institution) >= 1),
  location text,
  -- Free text: the resume uses "Completed" and "2029 (expected)".
  period_label text not null check (char_length(period_label) >= 1),
  detail text,
  certificate_path text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint education_sort_order_key unique (sort_order) deferrable initially deferred
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) >= 1),
  organisation text,
  start_month date not null,
  end_month date check (end_month >= start_month),
  detail text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_sort_order_key unique (sort_order) deferrable initially deferred
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  group_name text not null check (char_length(group_name) >= 1),
  items text[] not null default '{}',
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_sort_order_key unique (sort_order) deferrable initially deferred
);

-- Fact cards on About (FR-3.3). The distance card is built in code, not stored.
create table public.about_facts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  body_md text not null check (char_length(body_md) between 1 and 600),
  -- https, or a site path. A second character of / or \ is refused because
  -- browsers read //host and /\host as links to another site.
  link_url text check (link_url ~ '^(https://.+|/([^/\\].*)?)$'),
  link_label text check (char_length(link_label) between 1 and 40),
  doodle text check (doodle in ('trophy', 'bolt', 'checklist', 'yarn', 'pepper', 'pot', 'mic')),
  size text not null default 'normal' check (size in ('normal', 'wide', 'tall')),
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint about_facts_link_pair check ((link_url is null) = (link_label is null)),
  constraint about_facts_sort_order_key unique (sort_order) deferrable initially deferred
);

create trigger profile_updated_at before update on public.profile
  for each row execute function private.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function private.set_updated_at();
create trigger project_images_updated_at before update on public.project_images
  for each row execute function private.set_updated_at();
create trigger experience_updated_at before update on public.experience
  for each row execute function private.set_updated_at();
create trigger education_updated_at before update on public.education
  for each row execute function private.set_updated_at();
create trigger roles_updated_at before update on public.roles
  for each row execute function private.set_updated_at();
create trigger skills_updated_at before update on public.skills
  for each row execute function private.set_updated_at();
create trigger about_facts_updated_at before update on public.about_facts
  for each row execute function private.set_updated_at();
