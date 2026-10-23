\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email_confirmed_at) values('00000000-0000-0000-0000-000000000001',now()),('00000000-0000-0000-0000-000000000002',now()),('00000000-0000-0000-0000-000000000003',now());
insert into public.user_roles values('00000000-0000-0000-0000-000000000003','admin');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
set local role authenticated;
insert into public.listings(id,category_id,subcategory,location_id,title,description,price,status,details) values('20000000-0000-0000-0000-000000000001','jobs','full-time','queens','Disposable structured job fixture','Only a database test fixture; this is not an actual employment opportunity.',null,'pending','{"company":"Fixture only","salary_min":20,"salary_max":30,"pay_period":"hour","employment":"full-time","workplace":"on-site","industry":"Test"}');
insert into public.business_profiles(id,user_id,name,category,location,description,website) values('30000000-0000-0000-0000-000000000001',auth.uid(),'Fixture business only','retail','queens','A disposable test fixture, not a real merchant or public business.','');
insert into public.listings(id,category_id,subcategory,location_id,title,description,price,details) values('20000000-0000-0000-0000-000000000002','marketplace','furniture','queens','Private image reordering fixture','This fixture only exercises media membership and transactional ordering.',10,'{"condition":"good","pickup":"Public place"}');
insert into public.listing_media(id,listing_id,object_path,position) values('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',auth.uid()::text||'/20000000-0000-0000-0000-000000000002/a.webp',0),('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',auth.uid()::text||'/20000000-0000-0000-0000-000000000002/b.webp',1);
select public.reorder_media('20000000-0000-0000-0000-000000000002',array['40000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001']::uuid[]);
do $$begin
 if (select position from public.listing_media where id='40000000-0000-0000-0000-000000000002')<>0 then raise exception 'Cover reordering failed';end if;
 begin perform public.reorder_media('20000000-0000-0000-0000-000000000002',array['40000000-0000-0000-0000-000000000001']::uuid[]);raise exception 'Partial media membership accepted';exception when raise_exception then if sqlerrm<>'Exact media membership required' then raise;end if;end;
 begin insert into public.listings(category_id,subcategory,location_id,title,description,price,status,details) values('jobs','full-time','queens','Disposable structured job fixture','Only a database test fixture; this is not an actual employment opportunity.',null,'pending','{"company":"Fixture only","salary_min":20,"salary_max":30,"pay_period":"hour","employment":"full-time","workplace":"on-site","industry":"Test"}');raise exception 'Duplicate owner submission accepted';exception when raise_exception then if sqlerrm<>'Duplicate listing' then raise;end if;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
set local role authenticated;
do $$begin begin update public.business_profiles set status='approved';raise exception 'Direct business approval accepted';exception when raise_exception then if sqlerrm<>'Verified publisher and audited business review required' then raise;end if;end;end$$;
select public.moderate_listing('20000000-0000-0000-0000-000000000001','approved','Reviewed isolated fixture');
select public.moderate_business('30000000-0000-0000-0000-000000000001','approved','Reviewed isolated fixture');
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin
 if (select count(*) from public.job_details)<>1 or (select count(*) from public.business_profiles)<>1 then raise exception 'Approved normalized data not public';end if;
 if (public.search_listings('jobs','{"industry":"tes","pay_period":"hour"}',12,0)->>'total')::int<>1 then raise exception 'Job industry filter failed';end if;
 if (public.search_listings('jobs','{"location":"brooklyn"}',12,0)->>'total')::int<>0 then raise exception 'Location filter failed';end if;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
set local role authenticated;
insert into public.listings(id,category_id,subcategory,location_id,title,description,price,status,details) values('20000000-0000-0000-0000-000000000003','jobs','full-time','queens','Disposable structured job fixture','Only a database test fixture; this is not an actual employment opportunity.',null,'pending','{"company":"Fixture only","salary_min":20,"salary_max":30,"pay_period":"hour","employment":"full-time","workplace":"on-site","industry":"Test"}');
do $$begin if not exists(select 1 from public.listing_checks where listing_id='20000000-0000-0000-0000-000000000003' and 'duplicate_content'=any(flags)) then raise exception 'Cross-publisher duplicate was not flagged';end if;end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
set local role authenticated;
select public.restrict_member('00000000-0000-0000-0000-000000000001',true,'Restriction fixture for public visibility checks');
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin if exists(select 1 from public.listings where id='20000000-0000-0000-0000-000000000001') or exists(select 1 from public.business_profiles) then raise exception 'Restricted publisher content still public';end if;end$$;
reset role;
rollback;
\echo 'PASS: normalized jobs, industry/location search, private media ordering, exact membership, duplicate detection, audited business approval, publisher restrictions'
