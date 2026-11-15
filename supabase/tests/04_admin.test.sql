-- Favour's GitHub identity can read drafts and write every table, and what
-- visitors see follows her updates exactly (FR-2.5, FR-5.1, NFR-5).
begin;
select plan(24);

insert into public.projects (slug, title, one_liner, year, status, sort_order)
values ('draft-project', 'Draft', 'Not ready yet.', 2026, 'live', 100);

select tests.authenticate_as(tests.create_user('239020475'));
select is(public.is_admin(), true, 'Favour''s GitHub identity is admin');

select isnt_empty(
  $$select 1 from public.projects where slug = 'draft-project'$$,
  'the admin sees draft projects'
);

-- Writes on every table.
select is(tests.rows_affected($$update public.profile set location = 'Kigali, Rwanda'$$), 1,
  'the admin updates profile');
select is(tests.rows_affected($$update public.projects set title = 'Draft 2' where slug = 'draft-project'$$), 1,
  'the admin updates projects');
select is(tests.rows_affected(
  $$insert into public.project_images (project_id, storage_path, alt, width, height, sort_order)
    values ((select id from public.projects where slug = 'draft-project'), 'test/a.png', 'Alt', 10, 10, 1)$$), 1,
  'the admin inserts project images');
select is(tests.rows_affected($$update public.project_images set caption = 'Caption' where storage_path = 'test/a.png'$$), 1,
  'the admin updates project images');
select is(tests.rows_affected($$insert into public.experience (role, organisation, start_month, sort_order) values ('Test', 'Test', '2026-01-01', 100)$$), 1,
  'the admin inserts experience');
select is(tests.rows_affected($$update public.experience set role = 'Test 2' where sort_order = 100$$), 1,
  'the admin updates experience');
select is(tests.rows_affected($$insert into public.education (programme, institution, period_label, sort_order) values ('Test', 'Test', 'Test', 100)$$), 1,
  'the admin inserts education');
select is(tests.rows_affected($$insert into public.roles (title, start_month, sort_order) values ('Test', '2026-01-01', 100)$$), 1,
  'the admin inserts roles');
select is(tests.rows_affected($$insert into public.skills (group_name, sort_order) values ('Test', 100)$$), 1,
  'the admin inserts skills');
select is(tests.rows_affected($$insert into public.about_facts (title, body_md, sort_order) values ('Test', 'Test', 100)$$), 1,
  'the admin inserts about facts');
select is(tests.rows_affected($$update public.about_facts set body_md = 'Test 2' where sort_order = 100$$), 1,
  'the admin updates about facts');
select is(tests.rows_affected($$delete from public.about_facts where sort_order = 100$$), 1,
  'the admin deletes about facts');
select is(tests.rows_affected($$delete from public.skills where sort_order = 100$$), 1,
  'the admin deletes skills');
select is(tests.rows_affected($$delete from public.roles where sort_order = 100$$), 1,
  'the admin deletes roles');
select is(tests.rows_affected($$delete from public.education where sort_order = 100$$), 1,
  'the admin deletes education');
select is(tests.rows_affected($$delete from public.experience where sort_order = 100$$), 1,
  'the admin deletes experience');

select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('documents', 'test/resume.pdf')$$,
  'the admin uploads to documents'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('project-images', 'test/cover.png')$$,
  'the admin uploads to project-images'
);

-- Visibility follows the admin's update: publishing shows the project and
-- its image to visitors, unpublishing hides both again.
select is(tests.rows_affected($$update public.projects set is_published = true where slug = 'draft-project'$$), 1,
  'the admin publishes the draft');
reset role;
select tests.become_anon();
select results_eq(
  $$select count(*)::integer from public.projects where slug = 'draft-project'
    union all
    select count(*)::integer from public.project_images where storage_path = 'test/a.png'$$,
  $$values (1), (1)$$,
  'visitors see the project and its image once published'
);
reset role;

select tests.authenticate_as((select user_id from auth.identities where provider_id = '239020475'));
select is(tests.rows_affected($$update public.projects set is_published = false where slug = 'draft-project'$$), 1,
  'the admin unpublishes the project');
reset role;
select tests.become_anon();
select results_eq(
  $$select count(*)::integer from public.projects where slug = 'draft-project'
    union all
    select count(*)::integer from public.project_images where storage_path = 'test/a.png'$$,
  $$values (0), (0)$$,
  'visitors no longer see the project or its image once unpublished'
);
reset role;

select * from finish();
rollback;
