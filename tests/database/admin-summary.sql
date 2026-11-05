\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email_confirmed_at) values
 ('00000000-0000-4000-8000-000000000071',now()),
 ('00000000-0000-4000-8000-000000000072',now());
insert into public.user_roles(user_id,role)
 values('00000000-0000-4000-8000-000000000072','admin');

do $$begin
 if has_function_privilege('anon','public.admin_summary()','execute') then
   raise exception 'Anonymous role can execute admin summary';
 end if;
end$$;
set local role anon;
do $$begin
 begin
   perform public.admin_summary();
   raise exception 'Anonymous summary access accepted';
 exception when insufficient_privilege then null;
 end;
end$$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000071',true);
set local role authenticated;
do $$begin
 begin
   perform public.admin_summary();
   raise exception 'Ordinary member obtained admin counts';
 exception when insufficient_privilege then
   if sqlerrm <> 'Administrator required' then raise; end if;
 end;
 if exists(select 1 from public.user_roles) then
   raise exception 'Summary repair granted a role';
 end if;
end$$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000072',true);
set local role authenticated;
do $$declare result jsonb; before_audit bigint; begin
 select count(*) into before_audit from public.audit_logs;
 result := public.admin_summary();
 if not (result ?& array['users','active','pending','reports','businesses','trend'])
    or jsonb_typeof(result->'trend') <> 'array'
    or jsonb_array_length(result->'trend') <> 7 then
   raise exception 'Administrator summary has an invalid result';
 end if;
 if (select count(*) from public.audit_logs) <> before_audit then
   raise exception 'Read-only summary wrote an audit record';
 end if;
end$$;
reset role;
rollback;
\echo 'PASS: summary repair denies anon/member, preserves roles and permits read-only admin summary'
