-- Visitors (no session, role anon) read published content only and cannot
-- write anything (FR-2.5, NFR-5).
begin;
select plan(29);

-- Fixture, written as the table owner: one draft with an image, and an image
-- on a published project.
insert into public.projects (slug, title, tagline, one_liner, year, status, sort_order)
values ('draft-project', 'Draft', 'Tagline.', 'Not ready yet.', 2026, 'live', 100);
insert into public.project_images (project_id, storage_path, alt, width, height, sort_order)
values
  ((select id from public.projects where slug = 'draft-project'), 'test/draft.png', 'Draft image', 10, 10, 1),
  ((select id from public.projects where slug = 'aidready'), 'test/published.png', 'Published image', 10, 10, 1);

select tests.become_anon();

select is(
  (select count(*)::integer from public.projects), 4,
  'visitors see the 4 published projects'
);
select is_empty(
  $$select 1 from public.projects where slug = 'draft-project'$$,
  'visitors cannot see a draft project'
);
select results_eq(
  $$select storage_path from public.project_images order by storage_path$$,
  $$values ('test/published.png'::text)$$,
  'visitors see images of published projects only'
);
select isnt_empty($$select 1 from public.profile$$, 'visitors read profile');
select isnt_empty($$select 1 from public.experience$$, 'visitors read experience');
select isnt_empty($$select 1 from public.education$$, 'visitors read education');
select isnt_empty($$select 1 from public.roles$$, 'visitors read roles');
select isnt_empty($$select 1 from public.skills$$, 'visitors read skills');
select isnt_empty($$select 1 from public.about_facts$$, 'visitors read about facts');

-- Inserts are refused outright.
select throws_ok(
  $$insert into public.profile (singleton, full_name, headline, pitch, bio_md, email)
    values (true, 'X', 'X', 'X', 'X', 'x@example.test')$$,
  '42501', null, 'visitors cannot insert profile'
);
select throws_ok(
  $$insert into public.projects (slug, title, tagline, one_liner, year, status, sort_order)
    values ('spam', 'Spam', 'Tagline.', 'Spam.', 2026, 'live', 101)$$,
  '42501', null, 'visitors cannot insert projects'
);
select throws_ok(
  $$insert into public.project_images (project_id, storage_path, alt, width, height, sort_order)
    values ((select id from public.projects where slug = 'aidready'), 'x.png', 'x', 1, 1, 9)$$,
  '42501', null, 'visitors cannot insert project images'
);
select throws_ok(
  $$insert into public.experience (role, organisation, start_month, sort_order)
    values ('X', 'X', '2026-01-01', 100)$$,
  '42501', null, 'visitors cannot insert experience'
);
select throws_ok(
  $$insert into public.education (programme, institution, period_label, sort_order)
    values ('X', 'X', 'X', 100)$$,
  '42501', null, 'visitors cannot insert education'
);
select throws_ok(
  $$insert into public.roles (title, start_month, sort_order) values ('X', '2026-01-01', 100)$$,
  '42501', null, 'visitors cannot insert roles'
);
select throws_ok(
  $$insert into public.skills (group_name, sort_order) values ('X', 100)$$,
  '42501', null, 'visitors cannot insert skills'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, sort_order) values ('X', 'X', 100)$$,
  '42501', null, 'visitors cannot insert about facts'
);

-- Updates and deletes match no rows, so nothing changes.
select is(tests.rows_affected($$update public.profile set headline = 'Hacked'$$), 0,
  'visitors cannot update profile');
select is(tests.rows_affected($$update public.projects set title = 'Hacked'$$), 0,
  'visitors cannot update projects');
select is(tests.rows_affected($$update public.project_images set alt = 'Hacked'$$), 0,
  'visitors cannot update project images');
select is(tests.rows_affected($$update public.experience set role = 'Hacked'$$), 0,
  'visitors cannot update experience');
select is(tests.rows_affected($$update public.about_facts set title = 'Hacked'$$), 0,
  'visitors cannot update about facts');
select is(tests.rows_affected($$delete from public.profile$$), 0,
  'visitors cannot delete profile');
select is(tests.rows_affected($$delete from public.projects$$), 0,
  'visitors cannot delete projects');
select is(tests.rows_affected($$delete from public.education$$), 0,
  'visitors cannot delete education');
select is(tests.rows_affected($$delete from public.roles$$), 0,
  'visitors cannot delete roles');
select is(tests.rows_affected($$delete from public.skills$$), 0,
  'visitors cannot delete skills');

reset role;
select is(
  (select headline from public.profile), 'Software engineer',
  'profile is unchanged after the visitor attempts'
);
select is(
  (select count(*)::integer from public.projects), 5,
  'no project was deleted by the visitor attempts'
);

select * from finish();
rollback;
