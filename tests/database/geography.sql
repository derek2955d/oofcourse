\set ON_ERROR_STOP on
begin;
insert into public.locations(id,name_en,name_zh,state,city) values('fixture-ca','Isolated California area','隔离加州地区','CA','Isolated city');
insert into auth.users(id,email_confirmed_at) values('00000000-0000-4000-8000-000000000011',now()),('00000000-0000-4000-8000-000000000012',now());
insert into public.user_roles(user_id,role) values('00000000-0000-4000-8000-000000000012','admin');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000011',true);
set local role authenticated;
insert into public.listings(id,category_id,subcategory,location_id,title,description,price,status,details) values
 ('30000000-0000-4000-8000-000000000001','marketplace','furniture','queens','Isolated NY state fixture','This is an isolated database test record and must never be published to a real service.',20,'pending','{"condition":"good","pickup":"Test only"}'),
 ('30000000-0000-4000-8000-000000000003','marketplace','furniture','jersey-city','Isolated NJ state fixture','This is an isolated database test record and must never be published to a real service.',15,'pending','{"condition":"good","pickup":"Test only"}'),
 ('30000000-0000-4000-8000-000000000002','marketplace','furniture','fixture-ca','Isolated CA state fixture','This is an isolated database test record and must never be published to a real service.',10,'pending','{"condition":"good","pickup":"Test only"}');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000012',true);
set local role authenticated;
select public.moderate_listing('30000000-0000-4000-8000-000000000001','approved','Reviewed disposable state fixture');
select public.moderate_listing('30000000-0000-4000-8000-000000000003','approved','Reviewed disposable NJ fixture');
select public.moderate_listing('30000000-0000-4000-8000-000000000002','approved','Reviewed disposable state fixture');
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$declare r jsonb;begin
 r=public.search_listings_by_state('marketplace','{"state":"NY"}',12,0);
 if (r->>'total')::int<>1 or r->'items'->0->>'state'<>'NY' then raise exception 'NY state scope failed';end if;
 r=public.search_listings_by_state('marketplace','{"state":"NJ","location":"jersey-city"}',12,0);
 if (r->>'total')::int<>1 or r->'items'->0->>'state'<>'NJ' then raise exception 'NJ city scope failed';end if;
 if (public.search_listings_by_state('marketplace','{"state":"NY","location":"jersey-city"}',12,0)->>'total')::int<>0 then raise exception 'NJ city leaked into NY';end if;
 if (public.search_listings_by_state('marketplace','{"state":"NJ","location":"hoboken"}',12,0)->>'total')::int<>0 then raise exception 'NJ city filter leaked another city';end if;
 r=public.search_listings_by_state('marketplace','{"state":"CA","sort":"price-low"}',12,0);
 if (r->>'total')::int<>1 or r->'items'->0->>'location_id'<>'fixture-ca' then raise exception 'CA state scope failed';end if;
 if (public.search_listings_by_state('marketplace','{"state":"CA","location":"queens"}',12,0)->>'total')::int<>0 then raise exception 'Cross-state neighborhood leaked';end if;
 if (public.search_listings_by_state('marketplace','{"state":"TX"}',12,0)->>'total')::int<>0 then raise exception 'Empty state leaked NY rows';end if;
 if (public.search_listings_by_state('marketplace','{"state":"CA"}',1,1)->'items')<>'[]'::jsonb then raise exception 'State pagination failed';end if;
end$$;
reset role;
rollback;
\echo 'PASS: statewide scope, exact areas, cross-state rejection, empty states and pagination'
