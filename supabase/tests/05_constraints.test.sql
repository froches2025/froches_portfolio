-- Database rules from technical-design section 2 reject bad data, even when
-- written by the table owner (RLS aside). Runs against the seeded data.
begin;
select plan(43);

-- Featured: at most 4 (FR-1.2). The seed features all 4 projects.
select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order, is_featured, featured_order)
    values ('fifth', 'Fifth', 'Fifth.', 2026, 'live', 100, true, 4)$$,
  '23514', 'At most 4 projects can be featured',
  'a 5th featured project is rejected'
);
update public.projects set is_featured = false, featured_order = null where slug = 'froches-pepper-sauce';
select throws_ok(
  $$update public.projects set is_featured = true where slug = 'froches-pepper-sauce'$$,
  '23514', null, 'featured without a featured_order is rejected'
);
select throws_ok(
  $$update public.projects set featured_order = 4 where slug = 'froches-pepper-sauce'$$,
  '23514', null, 'a featured_order without featured is rejected'
);
select throws_ok(
  $$update public.projects set featured_order = 5, is_featured = true where slug = 'froches-pepper-sauce'$$,
  '23514', null, 'featured_order above 4 is rejected'
);
set constraints all immediate;
select throws_ok(
  $$update public.projects set is_featured = true, featured_order = 1 where slug = 'froches-pepper-sauce'$$,
  '23505', null, 'two projects cannot share a featured_order'
);
set constraints all deferred;
select lives_ok(
  $$update public.projects set sort_order = case slug when 'aidready' then 2 when 'lifetrack' then 1 end
    where slug in ('aidready', 'lifetrack')$$,
  'two projects can swap sort_order in one transaction'
);
select lives_ok(
  'set constraints all immediate',
  'the swapped sort_order is still unique when checked'
);
select throws_ok(
  $$update public.projects set sort_order = 1 where slug = 'campusnav'$$,
  '23505', null, 'two projects cannot share a sort_order'
);
set constraints all deferred;

-- projects
select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order) values ('Bad Slug', 'T', 'O', 2026, 'live', 100)$$,
  '23514', null, 'a slug with capitals or spaces is rejected'
);
select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order) values ('trailing-', 'T', 'O', 2026, 'live', 100)$$,
  '23514', null, 'a slug ending in a hyphen is rejected'
);
select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order) values ('old', 'T', 'O', 2014, 'live', 100)$$,
  '23514', null, 'a year before 2015 is rejected'
);
select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order) values ('state', 'T', 'O', 2026, 'paused', 100)$$,
  '23514', null, 'an unknown status is rejected'
);
select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order, live_url) values ('insecure', 'T', 'O', 2026, 'live', 100, 'http://example.com')$$,
  '23514', null, 'an http live_url is rejected'
);
select throws_ok(
  format($$insert into public.projects (slug, title, one_liner, year, status, sort_order) values ('long', 'T', %L, 2026, 'live', 100)$$, repeat('a', 201)),
  '23514', null, 'a one_liner of 201 characters is rejected'
);
select lives_ok(
  format($$insert into public.projects (slug, title, one_liner, year, status, sort_order) values ('long-ok', 'T', %L, 2026, 'live', 101)$$, repeat('a', 200)),
  'a one_liner of 200 characters is accepted'
);
select throws_ok(
  $$insert into public.projects (slug, title, one_liner, year, status, sort_order, stack)
    values ('stack', 'T', 'O', 2026, 'live', 102, array['1','2','3','4','5','6','7','8','9','10','11','12','13'])$$,
  '23514', null, '13 stack tags are rejected'
);
select throws_ok(
  format($$insert into public.projects (slug, title, one_liner, year, status, sort_order, stack) values ('tag', 'T', 'O', 2026, 'live', 102, array[%L])$$, repeat('a', 31)),
  '23514', null, 'a stack tag of 31 characters is rejected'
);

-- published_at is set on first publish and kept afterwards.
insert into public.projects (slug, title, one_liner, year, status, sort_order) values ('pub', 'T', 'O', 2026, 'live', 103);
select is((select published_at from public.projects where slug = 'pub'), null, 'a draft has no published_at');
update public.projects set is_published = true, published_at = null where slug = 'pub';
select isnt((select published_at from public.projects where slug = 'pub'), null, 'publishing sets published_at');
update public.projects set published_at = '2020-01-01' where slug = 'pub';
update public.projects set is_published = false where slug = 'pub';
update public.projects set is_published = true where slug = 'pub';
select is((select published_at from public.projects where slug = 'pub'), '2020-01-01'::timestamptz,
  'republishing keeps the first published_at');

-- updated_at follows every update.
update public.projects set updated_at = '2020-01-01' where slug = 'pub';
update public.projects set title = 'T2' where slug = 'pub';
select cmp_ok((select updated_at from public.projects where slug = 'pub'), '>', '2020-01-01'::timestamptz,
  'updating a row refreshes updated_at');

-- project_images, and the cascade when a project is deleted.
select throws_ok(
  $$insert into public.project_images (project_id, storage_path, alt, width, height, sort_order)
    values ((select id from public.projects where slug = 'pub'), 'x.png', '', 1, 1, 1)$$,
  '23514', null, 'an empty alt text is rejected'
);
select throws_ok(
  format($$insert into public.project_images (project_id, storage_path, alt, width, height, sort_order)
    values ((select id from public.projects where slug = 'pub'), 'x.png', %L, 1, 1, 1)$$, repeat('a', 201)),
  '23514', null, 'an alt text of 201 characters is rejected'
);
insert into public.project_images (project_id, storage_path, alt, width, height, sort_order)
values ((select id from public.projects where slug = 'pub'), 'cascade.png', 'Alt', 1, 1, 1);
delete from public.projects where slug = 'pub';
select is_empty($$select 1 from public.project_images where storage_path = 'cascade.png'$$,
  'deleting a project deletes its image rows');

-- profile
select throws_ok(
  $$insert into public.profile (full_name, headline, bio_md, email) values ('X', 'X', 'X', 'x@example.test')$$,
  '23505', null, 'a second profile row is rejected'
);
select throws_ok(
  $$insert into public.profile (singleton, full_name, headline, bio_md, email) values (false, 'X', 'X', 'X', 'x@example.test')$$,
  '23514', null, 'profile.singleton cannot be false'
);
select throws_ok($$update public.profile set email = 'not-an-email'$$, '23514', null, 'an invalid email is rejected');
select throws_ok($$update public.profile set github_url = 'http://github.com/x'$$, '23514', null, 'an http social link is rejected');
select throws_ok($$update public.profile set full_name = ''$$, '23514', null, 'an empty full_name is rejected');

-- experience and roles
select throws_ok(
  $$insert into public.experience (role, organisation, start_month, sort_order, bullets)
    values ('R', 'O', '2026-01-01', 100, array['1','2','3','4','5','6','7','8','9'])$$,
  '23514', null, '9 bullets are rejected'
);
select throws_ok(
  format($$insert into public.experience (role, organisation, start_month, sort_order, bullets) values ('R', 'O', '2026-01-01', 100, array[%L])$$, repeat('a', 301)),
  '23514', null, 'a bullet of 301 characters is rejected'
);
select throws_ok(
  $$insert into public.experience (role, organisation, start_month, end_month, sort_order) values ('R', 'O', '2026-02-01', '2026-01-01', 100)$$,
  '23514', null, 'an experience ending before it starts is rejected'
);
select throws_ok(
  $$insert into public.roles (title, start_month, end_month, sort_order) values ('T', '2026-02-01', '2026-01-01', 100)$$,
  '23514', null, 'a role ending before it starts is rejected'
);

-- about_facts: links may be https or a site path, never another site.
select throws_ok(
  $$insert into public.about_facts (title, body_md, link_url, link_label, sort_order) values ('T', 'B', '//evil.com', 'L', 100)$$,
  '23514', null, 'a protocol-relative link (//evil.com) is rejected'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, link_url, link_label, sort_order) values ('T', 'B', '/\evil.com', 'L', 100)$$,
  '23514', null, 'a backslash link (/\evil.com) is rejected'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, link_url, link_label, sort_order) values ('T', 'B', 'http://example.com', 'L', 100)$$,
  '23514', null, 'an http link is rejected'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, link_url, link_label, sort_order) values ('T', 'B', 'javascript:alert(1)', 'L', 100)$$,
  '23514', null, 'a javascript: link is rejected'
);
select lives_ok(
  $$insert into public.about_facts (title, body_md, link_url, link_label, sort_order) values ('T', 'B', '/projects/aidready', 'L', 100)$$,
  'a site path (/projects/aidready) is accepted'
);
select lives_ok(
  $$insert into public.about_facts (title, body_md, link_url, link_label, sort_order) values ('T', 'B', 'https://sauce.froches.tech', 'L', 101)$$,
  'an https link is accepted'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, link_url, sort_order) values ('T', 'B', '/projects', 102)$$,
  '23514', null, 'a link without a label is rejected'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, doodle, sort_order) values ('T', 'B', 'rocket', 102)$$,
  '23514', null, 'an unknown doodle is rejected'
);
select throws_ok(
  $$insert into public.about_facts (title, body_md, size, sort_order) values ('T', 'B', 'huge', 102)$$,
  '23514', null, 'an unknown size is rejected'
);
select throws_ok(
  format($$insert into public.about_facts (title, body_md, sort_order) values ('T', %L, 102)$$, repeat('a', 601)),
  '23514', null, 'a body of 601 characters is rejected'
);

select * from finish();
rollback;
