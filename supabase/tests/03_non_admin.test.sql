-- A signed-in user who is not Favour cannot read drafts or write anything,
-- and is_admin() matches only her GitHub identity (FR-5.1, NFR-5).
begin;
select plan(24);

insert into public.projects (slug, title, one_liner, year, status, sort_order)
values ('draft-project', 'Draft', 'Not ready yet.', 2026, 'live', 100);

-- is_admin() is false for every identity that is not Favour's GitHub account.
select tests.authenticate_as(tests.create_user_without_identity());
select is(public.is_admin(), false, 'a user with no identity is not admin');
reset role;

select tests.authenticate_as(tests.create_user('239020475', 'gitlab'));
select is(public.is_admin(), false, 'the admin ID from another provider is not admin');
reset role;

select tests.authenticate_as(tests.create_user('2390204750'));
select is(public.is_admin(), false, 'a GitHub ID that only starts with the admin ID is not admin');
reset role;

select set_config('request.jwt.claims', '', true);
select is(public.is_admin(), false, 'no session is not admin');

-- The rest of the file acts as an ordinary GitHub user.
select tests.authenticate_as(tests.create_user('1'));
select is(public.is_admin(), false, 'another GitHub user is not admin');

select is_empty(
  $$select 1 from public.projects where slug = 'draft-project'$$,
  'a non-admin cannot see a draft project'
);

select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order)
    values ('spam', 'Spam', 'Spam.', 2026, 'live', 101)$$,
  '42501', null, 'a non-admin cannot insert projects'
);
select throws_ok(
  $$insert into public.profile (singleton, full_name, headline, bio_md, email)
    values (true, 'X', 'X', 'X', 'x@example.test')$$,
  '42501', null, 'a non-admin cannot insert profile'
);
select throws_ok(
  $$insert into public.project_images (project_id, storage_path, alt, width, height, sort_order)
    values ((select id from public.projects where slug = 'aidready'), 'x.png', 'x', 1, 1, 9)$$,
  '42501', null, 'a non-admin cannot insert project images'
);
select throws_ok(
  $$insert into public.experience (role, organisation, start_month, sort_order)
    values ('X', 'X', '2026-01-01', 100)$$,
  '42501', null, 'a non-admin cannot insert experience'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, sort_order) values ('X', 'X', 100)$$,
  '42501', null, 'a non-admin cannot insert about facts'
);

-- A non-admin update or delete touches 0 rows on every table.
select is(tests.rows_affected($$update public.profile set headline = 'Hacked'$$), 0,
  'a non-admin update of profile touches 0 rows');
select is(tests.rows_affected($$update public.projects set title = 'Hacked'$$), 0,
  'a non-admin update of projects touches 0 rows');
select is(tests.rows_affected($$update public.project_images set alt = 'Hacked'$$), 0,
  'a non-admin update of project images touches 0 rows');
select is(tests.rows_affected($$update public.experience set role = 'Hacked'$$), 0,
  'a non-admin update of experience touches 0 rows');
select is(tests.rows_affected($$update public.education set programme = 'Hacked'$$), 0,
  'a non-admin update of education touches 0 rows');
select is(tests.rows_affected($$update public.roles set title = 'Hacked'$$), 0,
  'a non-admin update of roles touches 0 rows');
select is(tests.rows_affected($$update public.skills set group_name = 'Hacked'$$), 0,
  'a non-admin update of skills touches 0 rows');
select is(tests.rows_affected($$update public.about_facts set title = 'Hacked'$$), 0,
  'a non-admin update of about facts touches 0 rows');
select is(tests.rows_affected($$delete from public.projects$$), 0,
  'a non-admin delete of projects touches 0 rows');
select is(tests.rows_affected($$delete from public.about_facts$$), 0,
  'a non-admin delete of about facts touches 0 rows');

select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('documents', 'test/spam.pdf')$$,
  '42501', null, 'a non-admin cannot upload to documents'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('project-images', 'test/spam.png')$$,
  '42501', null, 'a non-admin cannot upload to project-images'
);

reset role;
select is(
  (select count(*)::integer from public.about_facts where title = 'Hacked'), 0,
  'no row was changed by the non-admin attempts'
);

select * from finish();
rollback;
