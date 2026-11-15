-- Finds tables at run time, so a table added later without RLS or a policy
-- fails this test without anyone editing a list (technical-design section 2).
begin;
select plan(7);

select cmp_ok(
  (select count(*)::integer from pg_class as c
   join pg_namespace as n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p')),
  '>=', 8,
  'finds the slice 1a tables in public at run time'
);

select is(
  (select array_agg(c.relname::text order by c.relname) from pg_class as c
   join pg_namespace as n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity),
  null,
  'every table in public has row-level security enabled'
);

select is(
  (select array_agg(c.relname::text order by c.relname) from pg_class as c
   join pg_namespace as n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p')
     and not exists (
       select 1 from pg_policies as p
       where p.schemaname = 'public' and p.tablename = c.relname
     )),
  null,
  'every table in public has at least one policy'
);

-- Every update policy must check is_admin() before (using) and after (with
-- check) the change, so an update can neither reach nor produce a row the
-- caller may not write.
select cmp_ok(
  (select count(*)::integer from pg_policies
   where cmd = 'UPDATE'
     and (schemaname = 'public' or (schemaname = 'storage' and tablename = 'objects'))),
  '>=', 9,
  'finds the update policies at run time'
);

select is(
  (select array_agg(schemaname || '.' || tablename || ': ' || policyname order by 1)
   from pg_policies
   where cmd = 'UPDATE'
     and (schemaname = 'public' or (schemaname = 'storage' and tablename = 'objects'))
     and (qual is null or with_check is null
          or qual not like '%is_admin()%' or with_check not like '%is_admin()%')),
  null,
  'every update policy checks is_admin() in both using and with check'
);

select tests.become_anon();
select throws_ok(
  'select * from private.settings', '42501', null,
  'visitors cannot read private.settings'
);
reset role;

select tests.authenticate_as(tests.create_user('1'));
select throws_ok(
  'select * from private.settings', '42501', null,
  'signed-in users cannot read private.settings'
);
reset role;

select * from finish();
rollback;
