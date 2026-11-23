-- The seed loaded completely and satisfies every rule above.
begin;
select plan(16);

select is((select count(*)::integer from public.profile), 1, 'one profile row');
select is((select full_name from public.profile), 'Favour Michael', 'profile name');
select results_eq(
  $$select slug, featured_order from public.projects order by sort_order$$,
  $$values ('aidready'::text, 1), ('lifetrack', 2), ('campusnav', 3), ('froches-pepper-sauce', 4)$$,
  'four projects in manual order, all featured in the same order'
);
select is((select count(*)::integer from public.projects where is_published), 4, 'every project is published');
select is((select count(*)::integer from public.projects where published_at is null), 0, 'every project has published_at');
select results_eq(
  $$select organisation from public.experience order by sort_order$$,
  $$values ('African Leadership University'::text), ('Fluencer'), ('HNG Internship (Cohort 11, frontend track)')$$,
  'three experience rows, newest first'
);
select is((select count(*)::integer from public.education), 2, 'two education rows');
select is((select count(*)::integer from public.roles), 3, 'three roles');
select is((select count(*)::integer from public.skills), 6, 'six skill groups');
select results_eq(
  $$select doodle, size from public.about_facts where doodle is not null order by sort_order$$,
  $$values ('trophy'::text, 'normal'::text), ('bolt', 'tall'), ('pepper', 'normal'),
    ('checklist', 'normal'), ('yarn', 'normal'), ('pot', 'wide'), ('mic', 'normal')$$,
  'seven fact cards carry doodles; hackathon is tall and cooking is wide'
);
select is((select count(*)::integer from public.about_facts), 11, 'eleven fact cards');

select is((select headline from public.profile), 'Software engineer', 'headline in sentence case');
select isnt((select pitch from public.profile), null, 'the hero pitch is seeded');
select is((select count(*)::integer from public.projects where tagline is null), 0, 'every project has a tagline');
select results_eq(
  $$select slug, stack from public.projects where slug in ('aidready', 'froches-pepper-sauce') order by sort_order$$,
  $$values ('aidready'::text, array['React', 'JavaScript', 'CSS', 'HAProxy']::text[]),
           ('froches-pepper-sauce', array['React', 'JavaScript', 'CSS']::text[])$$,
  'stacks list real technologies only'
);
select is(
  (select array[role_md is not null, approach_md is not null, outcome_md is not null] from public.projects where slug = 'aidready'),
  array[true, true, true],
  'the AidReady case study has role, approach and outcome'
);

select * from finish();
rollback;
