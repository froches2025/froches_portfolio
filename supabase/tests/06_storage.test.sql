-- Buckets exist with the limits from technical-design section 2.
begin;
select plan(4);

select results_eq(
  $$select id, public, file_size_limit, allowed_mime_types
    from storage.buckets where id = 'project-images'$$,
  $$values ('project-images'::text, true, 10485760::bigint,
    array['image/jpeg', 'image/png', 'image/webp']::text[])$$,
  'project-images is public, 10 MB, JPEG, PNG and WebP only'
);
select results_eq(
  $$select id, public, file_size_limit, allowed_mime_types
    from storage.buckets where id = 'documents'$$,
  $$values ('documents'::text, true, 5242880::bigint,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[])$$,
  'documents is public, 5 MB, PDF and images only'
);
select is_empty(
  $$select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and 'anon' = any(roles)
      and (qual like '%project-images%' or qual like '%documents%'
           or with_check like '%project-images%' or with_check like '%documents%')$$,
  'no storage policy grants visitors anything (public URLs only, no listing)'
);
select is(
  (select count(*)::integer from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname like 'Admin % site files'),
  4,
  'the admin has select, insert, update and delete policies on site files'
);

select * from finish();
rollback;
