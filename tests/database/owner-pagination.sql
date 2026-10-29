\set ON_ERROR_STOP on
begin;
-- Isolated database fixtures only; no hosted data or policy changes.
insert into auth.users(id,email_confirmed_at) values
 ('00000000-0000-4000-8000-000000000041',now()),('00000000-0000-4000-8000-000000000042',now()),('00000000-0000-4000-8000-000000000043',now());
insert into public.user_roles(user_id,role) values('00000000-0000-4000-8000-000000000043','admin');
insert into public.listings(id,user_id,category_id,subcategory,location_id,title,description,price,status,details)
 select ('50000000-0000-4000-8000-'||lpad(g::text,12,'0'))::uuid,'00000000-0000-4000-8000-000000000041','marketplace','furniture','queens','Private owner draft '||g,'Disposable owner pagination fixture, never to be published to a real service.',10,'draft','{"condition":"good","pickup":"Fixture only"}'::jsonb from generate_series(1,125) g;
insert into public.listings(user_id,category_id,subcategory,location_id,title,description,price,status,details,published_at,expires_at) values
 ('00000000-0000-4000-8000-000000000041','marketplace','furniture','queens','Owner current approved','Disposable owner pagination fixture, never to be published to a real service.',10,'pending','{"condition":"good","pickup":"Fixture only"}',null,null),
 ('00000000-0000-4000-8000-000000000041','marketplace','furniture','queens','Owner overdue approved','Disposable owner pagination fixture, never to be published to a real service.',10,'pending','{"condition":"good","pickup":"Fixture only"}',null,null),
 ('00000000-0000-4000-8000-000000000041','marketplace','furniture','queens','Owner expired status','Disposable owner pagination fixture, never to be published to a real service.',10,'expired','{"condition":"good","pickup":"Fixture only"}',null,null),
 ('00000000-0000-4000-8000-000000000041','marketplace','furniture','queens','Owner archived record','Disposable owner pagination fixture, never to be published to a real service.',10,'archived','{"condition":"good","pickup":"Fixture only"}',null,null),
 ('00000000-0000-4000-8000-000000000042','marketplace','furniture','queens','Other owner private draft','Disposable owner pagination fixture, never to be published to a real service.',10,'draft','{"condition":"good","pickup":"Fixture only"}',null,null);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000041',true);
set local role authenticated;
update public.listings set status='pending' where user_id='00000000-0000-4000-8000-000000000041' and status='pending';
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000043',true);
set local role authenticated;
select public.moderate_listing(id,'approved','Disposable owner pagination review') from public.listings where user_id='00000000-0000-4000-8000-000000000041' and status='pending';
-- Age one approved fixture as the verified fixture administrator.
update public.listings set published_at=now()-interval '3 days',expires_at=now()-interval '1 day' where title='Owner overdue approved';
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000041',true);
set local role authenticated;
do $$declare n int; a uuid[]; b uuid[];begin
 select count(*) into n from public.listings where user_id='00000000-0000-4000-8000-000000000041';
 if n<>129 then raise exception 'Owner exact count truncated or leaked';end if;
 select count(*) into n from (select id from public.listings where user_id='00000000-0000-4000-8000-000000000041' and status='draft' order by updated_at desc,id offset 120 limit 12) page;
 if n<>5 then raise exception 'Owner drafts beyond record 100 are inaccessible';end if;
 select array_agg(id) into a from (select id from public.listings where user_id='00000000-0000-4000-8000-000000000041' order by updated_at desc,id offset 0 limit 12) page;
 select array_agg(id) into b from (select id from public.listings where user_id='00000000-0000-4000-8000-000000000041' order by updated_at desc,id offset 12 limit 12) page;
 if cardinality(a)<>12 or cardinality(b)<>12 or a && b then raise exception 'Owner pages overlap or lost records';end if;
 select count(*) into n from public.listings where user_id='00000000-0000-4000-8000-000000000042';
 if n<>0 then raise exception 'Another owner private records leaked';end if;
 select count(*) into n from public.listings where user_id='00000000-0000-4000-8000-000000000041' and (status='expired' or (status='approved' and expires_at<=now()));
 if n<>2 then raise exception 'Expired status must include overdue approved records';end if;
 select count(*) into n from public.listings where user_id='00000000-0000-4000-8000-000000000041' and status='approved' and expires_at>now();
 if n<>1 then raise exception 'Current approved count includes expired records';end if;
end$$;
reset role;
rollback;
\echo 'PASS: owner exact counts, status scopes, records beyond 100, stable nonoverlapping pages, private boundaries and overdue expiry'
