\set ON_ERROR_STOP on
begin;
insert into public.locations(id,name_en,name_zh,state,city) values('fixture-calendar-ca','Isolated area','隔离地区','CA','Isolated city');
insert into auth.users(id,email_confirmed_at) values('00000000-0000-4000-8000-000000000021',now()),('00000000-0000-4000-8000-000000000022',now());
insert into public.user_roles(user_id,role) values('00000000-0000-4000-8000-000000000022','admin');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000021',true);
set local role authenticated;
insert into public.listings(id,category_id,subcategory,location_id,title,description,status,details)
select ('40000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'community','events',case when i=6 then 'fixture-calendar-ca' else 'queens' end,
'Isolated calendar fixture '||i,'Disposable database verification only. This record is never published to the hosted application.','pending',
jsonb_build_object('topic','Isolated activity') || case when i=7 then '{}'::jsonb else jsonb_build_object('event_date',to_char(current_date + case i when 1 then 1 when 2 then 0 when 3 then 2 when 4 then -1 when 8 then 3 else 0 end,'YYYY-MM-DD')) end
from generate_series(1,8) i;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000022',true);
set local role authenticated;
select public.moderate_listing(('40000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'approved','Reviewed disposable calendar fixture') from generate_series(1,8) i where i<>5;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$declare ids uuid[];begin
 select array_agg(id order by day,id) into ids from (
 select l.id,l.details->>'event_date' as day from public.listings l
 where l.category_id='community' and l.subcategory='events' and l.status='approved' and l.expires_at>now()
 and l.location_id in (select id from public.locations where state='NY' and enabled)
 and l.details->>'event_date'>=to_char(current_date,'YYYY-MM-DD')
 order by l.details->>'event_date',l.id limit 3) upcoming;
 if ids<>array['40000000-0000-4000-8000-000000000002'::uuid,'40000000-0000-4000-8000-000000000001'::uuid,'40000000-0000-4000-8000-000000000003'::uuid] then raise exception 'Upcoming activity visibility, scope, date ordering or limiting failed: %',ids;end if;
 if exists(select 1 from public.listings where id='40000000-0000-4000-8000-000000000005') then raise exception 'Unreviewed activity leaked';end if;
end$$;
reset role;
rollback;
\echo 'PASS: upcoming community activities exclude past, undated, unreviewed and out-of-state rows before ordering/limiting'
