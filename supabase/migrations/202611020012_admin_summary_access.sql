-- Incremental repair only: no table, account, role membership or content changes.
begin;

do $$
begin
  if to_regprocedure('private.is_admin()') is null
     or to_regprocedure('private.is_public_listing(uuid)') is null
     or to_regclass('public.profiles') is null
     or to_regclass('public.listings') is null
     or to_regclass('public.reports') is null
     or to_regclass('public.business_profiles') is null then
    raise exception 'Base classifieds schema is required; do not apply this repair to another project';
  end if;
end;
$$;

create or replace function public.admin_summary()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception using errcode = '42501', message = 'Administrator required';
  end if;
  return jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'active', (select count(*) from public.listings where private.is_public_listing(id)),
    'pending', (select count(*) from public.listings where status = 'pending'),
    'reports', (select count(*) from public.reports where status <> 'resolved'),
    'businesses', (select count(*) from public.business_profiles),
    'trend', (
      select jsonb_agg(jsonb_build_object(
        'date', d::date,
        'count', (select count(*) from public.listings l
                  where l.created_at >= d and l.created_at < d + interval '1 day')
      ))
      from generate_series(date_trunc('day', now()) - interval '6 days',
                           date_trunc('day', now()), interval '1 day') d
    )
  );
end;
$$;

revoke all on function public.admin_summary() from public, anon, authenticated;
grant execute on function public.admin_summary() to authenticated;
notify pgrst, 'reload schema';
commit;
