-- Test helpers, shared by the other files (they run in name order). Created
-- outside a transaction so later files can use them. This file runs only
-- against local and CI databases through `supabase test db`; it is not a
-- migration and never reaches production.

create extension if not exists pgtap with schema extensions;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

-- Creates an auth user with an identity, as GitHub sign-in would.
create or replace function tests.create_user(provider_id text, provider text default 'github')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, aud, role, email, created_at, updated_at)
  values (new_id, 'authenticated', 'authenticated', new_id || '@example.test', now(), now());

  insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
  values (
    provider_id, new_id,
    jsonb_build_object('sub', provider_id, 'email', new_id || '@example.test'),
    provider, now(), now()
  );
  return new_id;
end;
$$;

-- Creates an auth user with no identity at all (email sign-up).
create or replace function tests.create_user_without_identity()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, aud, role, email, created_at, updated_at)
  values (new_id, 'authenticated', 'authenticated', new_id || '@example.test', now(), now());
  return new_id;
end;
$$;

-- Acts as a signed-in user for the rest of the transaction.
create or replace function tests.authenticate_as(user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id, 'role', 'authenticated')::text,
    true
  );
  perform set_config('role', 'authenticated', true);
end;
$$;

-- Acts as a visitor (no session) for the rest of the transaction.
create or replace function tests.become_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end;
$$;

-- Runs one statement as the current role and returns how many rows it changed.
-- RLS turns forbidden updates and deletes into 0 rows instead of an error.
create or replace function tests.rows_affected(statement text)
returns integer
language plpgsql
as $$
declare
  affected integer;
begin
  execute statement;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

grant execute on all functions in schema tests to anon, authenticated;

select plan(1);
select has_function('tests', 'create_user', array['text', 'text'], 'test helpers are installed');
select * from finish();
