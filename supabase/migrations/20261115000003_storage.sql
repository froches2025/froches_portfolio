-- Storage buckets and policies (technical-design section 2). Created by
-- migration, not only config.toml, so `supabase db push` creates them in production.

-- Public buckets: visitors read files through public URLs. There is no select
-- policy for anon, so the file list itself cannot be enumerated through the API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', true, 10485760,
    array['image/jpeg', 'image/png', 'image/webp']),
  -- Resume PDF, headshot and certificate images (FR-3.4). One bucket holds one
  -- size limit, so images here are capped at 5 MB too.
  ('documents', 'documents', true, 5242880,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin reads site files" on storage.objects
  for select to authenticated
  using (bucket_id in ('project-images', 'documents') and (select public.is_admin()));
create policy "Admin uploads site files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('project-images', 'documents') and (select public.is_admin()));
create policy "Admin updates site files" on storage.objects
  for update to authenticated
  using (bucket_id in ('project-images', 'documents') and (select public.is_admin()))
  with check (bucket_id in ('project-images', 'documents') and (select public.is_admin()));
create policy "Admin deletes site files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('project-images', 'documents') and (select public.is_admin()));
