-- Row-level security (technical-design section 2, "Access rules"). Default deny:
-- RLS is on for every table and only the policies below grant access.
-- Visitors read published content; only is_admin() writes. Every update policy
-- checks is_admin() both before (using) and after (with check) the change.
-- is_admin() is wrapped in a select so Postgres evaluates it once per statement.

alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.roles enable row level security;
alter table public.skills enable row level security;
alter table public.about_facts enable row level security;

-- Content every visitor can read.
create policy "Visitors read profile" on public.profile
  for select to anon, authenticated using (true);
create policy "Visitors read experience" on public.experience
  for select to anon, authenticated using (true);
create policy "Visitors read education" on public.education
  for select to anon, authenticated using (true);
create policy "Visitors read roles" on public.roles
  for select to anon, authenticated using (true);
create policy "Visitors read skills" on public.skills
  for select to anon, authenticated using (true);
create policy "Visitors read about facts" on public.about_facts
  for select to anon, authenticated using (true);

-- Drafts stay private (FR-2.5).
create policy "Visitors read published projects" on public.projects
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "Visitors read images of published projects" on public.project_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects as p
      where p.id = project_images.project_id and p.is_published
    )
    or (select public.is_admin())
  );

-- Admin writes, one set per table.
create policy "Admin inserts profile" on public.profile
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates profile" on public.profile
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes profile" on public.profile
  for delete to authenticated using ((select public.is_admin()));

create policy "Admin inserts projects" on public.projects
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates projects" on public.projects
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes projects" on public.projects
  for delete to authenticated using ((select public.is_admin()));

create policy "Admin inserts project images" on public.project_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates project images" on public.project_images
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes project images" on public.project_images
  for delete to authenticated using ((select public.is_admin()));

create policy "Admin inserts experience" on public.experience
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates experience" on public.experience
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes experience" on public.experience
  for delete to authenticated using ((select public.is_admin()));

create policy "Admin inserts education" on public.education
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates education" on public.education
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes education" on public.education
  for delete to authenticated using ((select public.is_admin()));

create policy "Admin inserts roles" on public.roles
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates roles" on public.roles
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes roles" on public.roles
  for delete to authenticated using ((select public.is_admin()));

create policy "Admin inserts skills" on public.skills
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates skills" on public.skills
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes skills" on public.skills
  for delete to authenticated using ((select public.is_admin()));

create policy "Admin inserts about facts" on public.about_facts
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin updates about facts" on public.about_facts
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes about facts" on public.about_facts
  for delete to authenticated using ((select public.is_admin()));
